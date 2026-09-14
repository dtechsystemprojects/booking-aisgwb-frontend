"use client";
import DataTable from "@/components/table/DataTable";
import Swal from "sweetalert2";
import TablePagination from "@/components/table/TablePagination";
import Icon from "@/components/wrappers/Icon";
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  Row as TableRow,
  Table as TableType,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import React, { useMemo, useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Col,
  Dropdown,
  Row,
  Form,
  FormSelect,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchBookings,
  deleteBooking,
  resendBookingInvoice,
  Booking
} from "@/redux/slices/admin/bookingSlice";
import { InvoiceTemplate } from "@/app/(frontEnd)/profile/components/InvoiceTemplate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import { useAccess } from "@/hooks/useAccess";
import dayjs from "dayjs";
import BookingDetailsModal from "./BookingDetailsModal";

const BookingListContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { bookings, loading, error } = useAppSelector((state) => state.bookings);
  const { read: canRead, write: canWrite, delete: canDelete, export: canExport } = useAccess("Bookings");

  // Filtering state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [downloadingTxn, setDownloadingTxn] = useState<any>(null);

  const handleResendInvoice = async (booking: Booking) => {
    setResendingId(booking._id);
    try {
      // Fetch transaction to get real transactionRef
      const token = typeof window !== "undefined" ? localStorage.getItem('token') || sessionStorage.getItem('token') : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/transactions`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
      });
      const data = await res.json();
      const allTxns = data.data || [];
      const matchedTxn = allTxns.find((t: any) => t.bookingId?._id === (booking._id || (booking as any).id) || t.bookingId === (booking._id || (booking as any).id));
      
      const provisionalTxn = {
        id: booking._id || (booking as any).id,
        transactionRef: matchedTxn?.transactionRef || booking.transactionRef || "N/A",
        date: dayjs(booking.createdAt).format('DD MMM YYYY, hh:mm A'),
        description: `Booking for ${booking.eventId?.title || 'Event'}`,
        paymentMethod: booking.paymentMethod || "N/A",
        amount: `₹ ${booking.totalAmount}`,
        status: booking.paymentStatus,
        type: "Event",
        eventName: booking.eventId?.title || 'Event',
        tickets: booking.tickets.map(t => ({
          name: t.ticketName || "Event Ticket",
          quantity: t.quantity,
          unitPrice: `₹ ${Number(t.price || 0).toFixed(2)}`,
          totalPrice: `₹ ${Number((t.price || 0) * t.quantity).toFixed(2)}`
        })),
        quantity: booking.tickets.reduce((sum, t) => sum + t.quantity, 0),
        unitPrice: `₹ ${booking.totalAmount}`,
      };

      setDownloadingTxn(provisionalTxn);

      setTimeout(async () => {
        const element = document.getElementById(`admin-booking-list-invoice-template-${booking._id}`);
        if (element) {
          try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL("image/jpeg", 1.0);
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
            const pdfBase64 = pdf.output("datauristring");

            await dispatch(resendBookingInvoice({ id: booking._id, pdfBase64 })).unwrap();
            toast.success('Invoice resent successfully');
          } catch (error: any) {
            toast.error(error?.message || error || 'Failed to resend invoice');
          } finally {
            setResendingId(null);
            setDownloadingTxn(null);
          }
        } else {
          setResendingId(null);
          setDownloadingTxn(null);
          toast.error("Failed to generate invoice template");
        }
      }, 500);

    } catch (error: any) {
      toast.error(error?.message || error || 'Failed to process invoice resend');
      setResendingId(null);
    }
  };

  useEffect(() => {
    if (canRead) {
      dispatch(fetchBookings());
    }
  }, [dispatch, canRead]);

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this booking!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteBooking(id))
          .unwrap()
          .then(() => {
            Swal.fire("Deleted!", "The booking has been deleted.", "success");
            setSelectedRowIds({});
          })
          .catch((err) => {
            Swal.fire("Error!", err || "Failed to delete booking.", "error");
          });
      }
    });
  };

  const handleConfirmBulkDelete = () => {
    const selectedIds = Object.keys(selectedRowIds);
    if (selectedIds.length === 0) return;

    Swal.fire({
      title: "Delete Selected Bookings?",
      text: `Are you sure you want to delete ${selectedIds.length} booking${selectedIds.length > 1 ? "s" : ""}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        let deletedCount = 0;
        for (const id of selectedIds) {
          try {
            await dispatch(deleteBooking(id)).unwrap();
            deletedCount++;
          } catch (err) {
            console.error(err);
          }
        }
        
        setSelectedRowIds({});
        Swal.fire({
          title: "Deleted!",
          text: `${deletedCount} booking${deletedCount > 1 ? "s have" : " has"} been deleted.`,
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  };

  const columnHelper = createColumnHelper<Booking>();

  const columns: ColumnDef<Booking, any>[] = useMemo(
    () => [
      columnHelper.display({
        id: "selection",
        header: ({ table }: { table: TableType<Booking> }) => (
          <input
            type="checkbox"
            className="form-check-input form-check-input-light fs-14"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }: { row: TableRow<Booking> }) => {
          return (
            <input
              type="checkbox"
              className="form-check-input form-check-input-light fs-14"
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
            />
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      }),
      columnHelper.accessor("_id", {
        header: "ID & Date",
        cell: (info) => (
          <div>
            <div className="fw-bold text-dark">#{info.getValue().substring(info.getValue().length - 4).toUpperCase()}</div>
            <div className="text-muted small">{dayjs(info.row.original.createdAt).format("MMM DD, YYYY")}</div>
            <div className="text-muted small">{dayjs(info.row.original.createdAt).format("hh:mm A")}</div>
          </div>
        ),
      }),
      columnHelper.accessor((row) => row.billingInfo?.firstName, {
        id: "name",
        header: "Name",
        cell: (info) => (
          <div className="fw-medium">
            {info.row.original.billingInfo?.firstName} {info.row.original.billingInfo?.lastName || ""}
          </div>
        ),
      }),
      columnHelper.accessor((row) => row.billingInfo?.email, {
        id: "email",
        header: "Email",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor((row) => row.tickets, {
        id: "passes",
        header: "Passes",
        cell: (info) => {
          const totalTickets = info.getValue().reduce((sum: number, t: any) => sum + t.quantity, 0);
          return <span className="fw-medium">{totalTickets}</span>;
        },
      }),
      columnHelper.accessor("paymentMethod", {
        header: "Payment",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("totalAmount", {
        header: "Amount",
        cell: (info) => (
          <span className="fw-bold text-dark">
            ₹{info.getValue().toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        ),
      }),
      columnHelper.accessor("paymentStatus", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          let color = "secondary";
          if (status === "Completed" || status === "Free") color = "success";
          if (status === "Pending") color = "warning";
          if (status === "Failed") color = "danger";
          return (
            <Badge bg={color} className="rounded-pill px-3 py-2 fw-medium d-flex align-items-center" style={{ width: 'fit-content' }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "white",
                  marginRight: "8px",
                  opacity: 0.8
                }}
              />
              {status}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: "action",
        header: "Action",
        cell: (info) => (
          <div className="d-flex align-items-center gap-2">
            <OverlayTrigger placement="top" overlay={<Tooltip>View Details</Tooltip>}>
              <Button variant="light" size="sm" className="btn-icon" onClick={() => {
                setSelectedBooking(info.row.original);
                setShowModal(true);
              }}>
                <Icon icon="eye" className="fs-16" />
              </Button>
            </OverlayTrigger>

            {canWrite && !info.row.original.hasUsedTickets && (
              <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
                <Link href={`/admin/bookings/edit?id=${info.row.original._id}`}>
                  <Button variant="light" size="sm" className="btn-icon">
                    <Icon icon="square-pen" className="fs-16 text-secondary" />
                  </Button>
                </Link>
              </OverlayTrigger>
            )}

            <Dropdown>
              <Dropdown.Toggle variant="light" size="sm" className="btn-icon hide-arrow">
                <Icon icon="more-horizontal" className="fs-16" />
              </Dropdown.Toggle>
              <Dropdown.Menu align="end" className="shadow-sm border-0">
                <Dropdown.Item onClick={() => handleResendInvoice(info.row.original)} disabled={resendingId === info.row.original._id}>
                  <Icon icon="mail" className="fs-14 me-2 text-muted" /> 
                  {resendingId === info.row.original._id ? 'Sending...' : 'Resend Invoice'}
                </Dropdown.Item>
                {/* <Dropdown.Item href="#">
                  <Icon icon="refresh-ccw" className="fs-14 me-2 text-muted" /> Refund Booking
                </Dropdown.Item> */}
                {canDelete && !info.row.original.hasUsedTickets && (
                  <>
                    <Dropdown.Divider />
                    <Dropdown.Item className="text-danger" onClick={() => handleDelete(info.row.original._id)}>
                      <Icon icon="trash" className="fs-14 me-2" /> Delete
                    </Dropdown.Item>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        ),
      }),
    ],
    [canDelete]
  );

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = b.billingInfo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            b.billingInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || b.paymentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const table = useReactTable({
    data: filteredBookings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row) => row._id || (row as any).id,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setSelectedRowIds,
    state: {
      sorting,
      pagination,
      rowSelection: selectedRowIds,
    },
  });

  const exportToCSV = () => {
    if (bookings.length === 0) return;
    const headers = ["ID", "Name", "Email", "Total Tickets", "Payment Method", "Amount", "Status", "Date"];
    const csvContent = [
      headers.join(","),
      ...bookings.map((b) => {
        const qty = b.tickets.reduce((sum: number, t: any) => sum + t.quantity, 0);
        return `"${b._id}","${b.billingInfo?.firstName || ''} ${b.billingInfo?.lastName || ''}","${b.billingInfo?.email || ''}",${qty},"${b.paymentMethod || ''}",${b.totalAmount},"${b.paymentStatus || ''}","${dayjs(b.createdAt).format("YYYY-MM-DD")}"`
      }),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Bookings_Export_${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalItems = filteredBookings.length;
  const start = pagination.pageIndex * pagination.pageSize + 1;
  const end = Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalItems);

  return (
    <Card className="shadow-sm border-0">
      <div className="p-3 border-bottom">
        <h5 className="mb-1 fw-bold">Manage Bookings</h5>
      </div>
      <CardHeader className="border-light d-flex justify-content-between align-items-center flex-wrap gap-2 py-3">
          
          <div className="d-flex align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center">
              <span className="text-muted fs-xs fw-semibold me-2">Show</span>
              <FormSelect
                size="sm"
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
                style={{ width: "70px" }}
              >
                {[10, 20, 30, 40, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </FormSelect>
            </div>

            <span className="ms-2 me-1 fw-semibold text-muted fs-xs d-flex align-items-center gap-1">
              <Icon icon="filter" className="fs-xs text-primary" /> Filter By:
            </span>

            <Dropdown className="d-inline-block">
              <Dropdown.Toggle
                variant="outline-secondary"
                size="sm"
                className="d-flex align-items-center gap-1 my-1 my-md-0"
              >
                <span className="fw-semibold">
                  {statusFilter === "All" ? "All Statuses" : statusFilter}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item active={statusFilter === "All"} onClick={() => setStatusFilter("All")}>
                  All Statuses
                </Dropdown.Item>
                <Dropdown.Item active={statusFilter === "Completed"} onClick={() => setStatusFilter("Completed")}>
                  Completed
                </Dropdown.Item>
                <Dropdown.Item active={statusFilter === "Pending"} onClick={() => setStatusFilter("Pending")}>
                  Pending
                </Dropdown.Item>
                <Dropdown.Item active={statusFilter === "Failed"} onClick={() => setStatusFilter("Failed")}>
                  Failed
                </Dropdown.Item>
                <Dropdown.Item active={statusFilter === "Free"} onClick={() => setStatusFilter("Free")}>
                  Free
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="app-search">
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Icon icon="search" className="app-search-icon text-muted" />
            </div>

            {canDelete && Object.keys(selectedRowIds).length > 0 && (
              <Button variant="danger" size="sm" onClick={handleConfirmBulkDelete}>
                Delete ({Object.keys(selectedRowIds).length})
              </Button>
            )}

            {canExport && (
              <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-export-csv">Export to CSV</Tooltip>}>
                <Button variant="light" size="sm" onClick={exportToCSV} className="d-flex align-items-center gap-1">
                  <Icon icon="download" className="fs-sm" /> Export
                </Button>
              </OverlayTrigger>
            )}

            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="tooltip-reset">Reset Filters</Tooltip>}
            >
              <Button
                variant="light"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                  table.setPageSize(10);
                }}
                title="Reset"
              >
                <Icon icon="rotate-ccw" className="fs-sm" />
              </Button>
            </OverlayTrigger>

            {canWrite && (
              <Link href="/admin/bookings/edit">
                <Button variant="primary" size="sm" className="d-flex align-items-center gap-1">
                  <Icon icon="plus" className="fs-16" />
                  <span className="d-none d-sm-inline">Add Booking</span>
                </Button>
              </Link>
            )}
          </div>
      </CardHeader>
      <CardBody className="p-0">
        {error && (
          <Alert variant="danger" className="m-3 border-0">
            {error}
          </Alert>
        )}
        <div className="table-responsive">
          <DataTable<Booking> table={table} isLoading={loading} />
        </div>
      </CardBody>
      <CardFooter className="bg-white border-top py-3">
        <TablePagination
          totalItems={totalItems}
          start={start}
          end={end}
          previousPage={() => table.previousPage()}
          canPreviousPage={table.getCanPreviousPage()}
          pageCount={table.getPageCount()}
          pageIndex={table.getState().pagination.pageIndex}
          setPageIndex={(index) => table.setPageIndex(index)}
          nextPage={() => table.nextPage()}
          canNextPage={table.getCanNextPage()}
          showInfo={true}
          itemsName="bookings"
        />
      </CardFooter>
      <BookingDetailsModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
      />
      
      {downloadingTxn && (
        <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
          <InvoiceTemplate 
            transaction={downloadingTxn} 
            user={{ 
              name: `${selectedBooking?.billingInfo?.firstName || ""} ${selectedBooking?.billingInfo?.lastName || ""}`.trim() || "", 
              email: selectedBooking?.billingInfo?.email, 
              phone: selectedBooking?.billingInfo?.phone 
            }} 
            id={`admin-booking-list-invoice-template-${downloadingTxn.id}`} 
          />
        </div>
      )}
    </Card>
  );
};

export default BookingListContent;
