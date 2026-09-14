"use client";
import React, { useMemo, useEffect, useState } from "react";
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
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Dropdown,
  FormSelect,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchAttendees,
  deleteAttendee,
  updateAttendee,
  resendTicketEmail
} from "@/redux/slices/admin/attendeeSlice";
import { fetchEvents, fetchEventById } from "@/redux/slices/admin/eventSlice";
import { fetchBookingById } from "@/redux/slices/admin/bookingSlice";
import { fetchTransactions } from "@/redux/slices/admin/transactionSlice";
import { AttendeeRecord } from "@/app/admin/dataStore";
import { useAccess } from "@/hooks/useAccess";
import { useSettingsContext } from "@/context/useSettingsContext";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import AttendeeModal from "./AttendeeModal";
import AttendeeViewModal from "./AttendeeViewModal";
import { TicketTemplate } from "@/app/(frontEnd)/profile/components/TicketTemplate";
import { InvoiceTemplate } from "@/app/(frontEnd)/profile/components/InvoiceTemplate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const AttendeeListContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { attendees, loading, error } = useAppSelector((state) => state.attendees);
  const { read: canRead, write: canWrite, delete: canDelete, export: canExport } = useAccess("Attendees");
  const { setting } = useSettingsContext();
  const underAgeLimit = parseInt(setting('general.under_age', '10')) || 10;

  // Filtering state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});

  const [resendingAttendee, setResendingAttendee] = useState<AttendeeRecord | null>(null);
  const [resendingEventDetails, setResendingEventDetails] = useState<any>(null);
  const [downloadingTxn, setDownloadingTxn] = useState<any>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalId, setModalId] = useState<string | null>(null);
  
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedViewAttendee, setSelectedViewAttendee] = useState<AttendeeRecord | null>(null);
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (canRead) {
      dispatch(fetchAttendees());
      dispatch(fetchEvents({ limit: 1000 }));
    }
  }, [dispatch, canRead]);

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this attendee!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteAttendee(id))
          .unwrap()
          .then(() => {
            Swal.fire("Deleted!", "The attendee has been deleted.", "success");
            setSelectedRowIds({});
          })
          .catch((err) => {
            Swal.fire("Error!", err || "Failed to delete attendee.", "error");
          });
      }
    });
  };

  const handleConfirmBulkDelete = () => {
    const selectedIds = Object.keys(selectedRowIds);
    if (selectedIds.length === 0) return;

    Swal.fire({
      title: "Delete Selected Attendees?",
      text: `Are you sure you want to delete ${selectedIds.length} attendee${selectedIds.length > 1 ? "s" : ""}? This action cannot be undone.`,
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
            await dispatch(deleteAttendee(id)).unwrap();
            deletedCount++;
          } catch (err) {
            console.error(err);
          }
        }
        
        setSelectedRowIds({});
        Swal.fire({
          title: "Deleted!",
          text: `${deletedCount} attendee${deletedCount > 1 ? "s have" : " has"} been deleted.`,
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleStatusChange = async (attendee: AttendeeRecord, newStatus: 'Unused' | 'Used' | 'Cancelled') => {
    const payload: Partial<AttendeeRecord> = { ticketStatus: newStatus };
    if (newStatus === 'Used') {
      payload.checkInTime = new Date().toISOString();
    } else if (newStatus === 'Unused') {
      payload.checkInTime = null;
    }
    
    try {
      await dispatch(updateAttendee({ id: attendee._id || attendee.id || "", payload })).unwrap();
      toast.success(`Ticket marked as ${newStatus}`, { duration: 3000 });
    } catch (err: any) {
      toast.error(err || "Failed to update status");
    }
  };

  const handleResendTicket = async (attendeeId: string) => {
    const attendee = attendees.find(a => (a._id || a.id) === attendeeId);
    if (!attendee) return;

    toast.loading("Generating ticket...", { id: "resendTicket" });
    
    let eventDetails = attendee.eventId;
    const eventIdStr = typeof attendee.eventId === 'string' 
      ? attendee.eventId 
      : (attendee.eventId?._id || attendee.eventId?.id);
      
    if (!eventDetails?.venueLocation && !eventDetails?.venue) {
      try {
        if (eventIdStr) {
          eventDetails = await dispatch(fetchEventById(eventIdStr)).unwrap();
        }
      } catch (e) {
        console.error("Failed to fetch full event details", e);
      }
    }

    const bookingIdStr = typeof attendee.bookingId === 'string' 
      ? attendee.bookingId 
      : (attendee.bookingId?._id || attendee.bookingId?.id);

    let fullBooking = null;
    let provisionalTxn = null;

    if (bookingIdStr) {
      try {
        fullBooking = await dispatch(fetchBookingById(bookingIdStr)).unwrap();
        
        if (fullBooking) {
          const allTxns = await dispatch(fetchTransactions()).unwrap();
          const matchedTxn = allTxns.find((t: any) => t.bookingId?._id === bookingIdStr || t.bookingId === bookingIdStr);

          provisionalTxn = {
            id: fullBooking._id || (fullBooking as any).id,
            transactionRef: matchedTxn?.transactionRef || "N/A",
            date: dayjs(fullBooking.createdAt).format('DD MMM YYYY, hh:mm A'),
            description: `Booking for ${fullBooking.eventId?.title || 'Event'}`,
            paymentMethod: fullBooking.paymentMethod || "N/A",
            amount: `₹ ${fullBooking.totalAmount}`,
            status: fullBooking.paymentStatus,
            type: "Event",
            eventName: fullBooking.eventId?.title || 'Event',
            tickets: fullBooking.tickets.flatMap((t: any) => {
              const regularAttendees = t.attendees.filter((a: any) => !(t.ticketName && t.ticketName.includes('(Under')));
              const underAgeAttendees = t.attendees.filter((a: any) => (t.ticketName && t.ticketName.includes('(Under')));
              const items = [];
              if (regularAttendees.length > 0) {
                items.push({
                  name: t.ticketName?.replace(/ \(Under \d+\)/, '') || "Event Ticket",
                  quantity: regularAttendees.length,
                  unitPrice: `₹ ${Number(t.price || 0).toFixed(2)}`,
                  totalPrice: `₹ ${Number((t.price || 0) * regularAttendees.length).toFixed(2)}`
                });
              }
              if (underAgeAttendees.length > 0) {
                items.push({
                  name: t.ticketName || "Event Ticket",
                  quantity: underAgeAttendees.length,
                  unitPrice: `₹ 0.00`,
                  totalPrice: `₹ 0.00`
                });
              }
              if (items.length === 0) {
                items.push({
                  name: t.ticketName || "Event Ticket",
                  quantity: t.quantity,
                  unitPrice: `₹ ${Number(t.price || 0).toFixed(2)}`,
                  totalPrice: `₹ ${Number((t.price || 0) * t.quantity).toFixed(2)}`
                });
              }
              return items;
            }),
            quantity: fullBooking.tickets.reduce((sum: number, t: any) => sum + t.quantity, 0),
            unitPrice: `₹ ${fullBooking.totalAmount}`,
            user: { 
              name: `${fullBooking.billingInfo?.firstName || ""} ${fullBooking.billingInfo?.lastName || ""}`.trim() || "", 
              email: fullBooking.billingInfo?.email, 
              phone: fullBooking.billingInfo?.phone,
              memberId: fullBooking.userId?.memberId || ""
            }
          };
        }
      } catch (e) {
        console.error("Failed to fetch full booking details", e);
      }
    }

    setResendingAttendee(attendee);
    setResendingEventDetails(eventDetails);
    if (provisionalTxn) {
      setDownloadingTxn(provisionalTxn);
    }

    setTimeout(async () => {
      try {
        let ticketPdfBase64 = "";
        let invoicePdfBase64 = "";

        const ticketEl = document.getElementById(`admin-attendee-list-ticket-${attendeeId}`);
        if (ticketEl) {
          // Wait for all images inside the ticket to fully load before capturing
          const imgs = Array.from(ticketEl.querySelectorAll('img'));
          await Promise.all(imgs.map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
              img.onload = resolve;
              img.onerror = resolve; // don't block on broken images
            });
          }));
          const tCanvas = await html2canvas(ticketEl, { scale: 2, useCORS: true, allowTaint: true, windowWidth: 800, logging: true });
          const tImgData = tCanvas.toDataURL("image/png");
          const tPdf = new jsPDF("p", "mm", "a4");
          const tPdfWidth = tPdf.internal.pageSize.getWidth();
          const tPdfHeight = (tCanvas.height * tPdfWidth) / tCanvas.width;
          tPdf.addImage(tImgData, "PNG", 0, 0, tPdfWidth, tPdfHeight);
          ticketPdfBase64 = tPdf.output("datauristring");
        }

        const invoiceEl = document.getElementById(`admin-booking-invoice-template-${attendeeId}`);
        if (invoiceEl) {
          const iCanvas = await html2canvas(invoiceEl, { scale: 2, useCORS: true, allowTaint: true, windowWidth: 800, logging: true });
          const iImgData = iCanvas.toDataURL("image/png");
          const iPdf = new jsPDF("p", "mm", "a4");
          const iPdfWidth = iPdf.internal.pageSize.getWidth();
          const iPdfHeight = (iCanvas.height * iPdfWidth) / iCanvas.width;
          iPdf.addImage(iImgData, "PNG", 0, 0, iPdfWidth, iPdfHeight);
          invoicePdfBase64 = iPdf.output("datauristring");
        }

        if (!ticketPdfBase64) {
          toast.error("Could not generate Ticket PDF. Template not found.", { id: "resendTicket" });
          return;
        }

        toast.loading("Sending email...", { id: "resendTicket" });
        const result = await dispatch(resendTicketEmail({ id: attendeeId, ticketPdfBase64, invoicePdfBase64 })).unwrap();
        toast.success(result.message || "Email resent successfully", { id: "resendTicket" });
      } catch (err: any) {
        console.error("PDF generation/email error", err);
        toast.error(err.message || err || "Failed to resend ticket email", { id: "resendTicket" });
      } finally {
        setResendingAttendee(null);
        setResendingEventDetails(null);
        setDownloadingTxn(null);
      }
    }, 3500);
  };

  const columnHelper = createColumnHelper<AttendeeRecord>();

  const columns: ColumnDef<AttendeeRecord, any>[] = useMemo(
    () => [
      columnHelper.display({
        id: "selection",
        header: ({ table }: { table: TableType<AttendeeRecord> }) => (
          <input
            type="checkbox"
            className="form-check-input form-check-input-light fs-14"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }: { row: TableRow<AttendeeRecord> }) => {
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
        id: "ticketId",
        header: "Ticket ID",
        cell: (info) => {
          const id = info.getValue() || info.row.original.id;
          return (
            <div className="text-dark">#{id?.substring(id.length - 10) || "N/A"}</div>
          );
        },
      }),
      columnHelper.accessor((row) => (row as any).attendeeId || row.id, {
        id: "attendeeId",
        header: "Attendee ID",
        cell: (info) => {
          const id = info.getValue() || info.row.original._id;
          // Dummy logic to match the image if attendeeId is not present
          const displayId = (info.row.original as any).attendeeId || id?.substring(id.length - 4);
          return (
            <div className="text-primary">{displayId}</div>
          );
        },
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <div className="fw-medium">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor((row) => row.bookingId, {
        id: "bookedBy",
        header: "Booked By",
        cell: (info) => {
          const booking = info.getValue();
          if (!booking) return <div className="text-muted">-</div>;

          let name = booking.billingInfo?.firstName || "Unknown";
          if (booking.billingInfo?.lastName) {
            name += ` ${booking.billingInfo.lastName}`;
          }

          // If userId has a populated name or memberId, we can prefer or display it
          const user = booking.userId;
          if (user) {
             name = user.name || name;
             if (user.memberId) {
                return (
                  <div className="fw-medium">
                    {name} <span className="text-muted">({user.memberId})</span>
                  </div>
                );
             }
          }

          return <div className="fw-medium">{name}</div>;
        },
      }),
      columnHelper.accessor((row) => row.eventId?.title, {
        id: "event",
        header: "Event",
        cell: (info) => (
          <div style={{ maxWidth: '220px', whiteSpace: 'normal', lineHeight: '1.4' }} className="text-muted">
            {info.getValue() || "-"}
          </div>
        ),
      }),
      columnHelper.accessor("paymentStatus", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          let bg = "secondary";
          let text = "secondary";
          if (status === "Success") { bg = "success-subtle"; text = "success"; }
          if (status === "Pending") { bg = "warning-subtle"; text = "warning"; }
          if (status === "Failed") { bg = "danger-subtle"; text = "danger"; }
          return (
            <Badge bg={bg} className={`text-${text} px-3 py-1 fw-medium rounded-pill`} style={{ fontSize: '12px' }}>
              {status}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("checkInTime", {
        header: "Check-in Time",
        cell: (info) => {
          const val = info.getValue();
          if (!val) return <div className="text-muted">-</div>;
          return (
            <div>
              <div className="fw-medium text-dark">{dayjs(val).format("MMM DD, YYYY")}</div>
              <div className="text-muted small">{dayjs(val).format("hh:mm A")}</div>
            </div>
          );
        },
      }),
      columnHelper.accessor("ticketStatus", {
        header: "Ticket Status",
        cell: (info) => {
          const status = info.getValue();
          let dotColor = "secondary";
          if (status === "Unused") dotColor = "success";
          if (status === "Used") dotColor = "primary";
          if (status === "Cancelled") dotColor = "danger";
          return (
            <Dropdown>
              <Dropdown.Toggle 
                variant="white" 
                size="sm" 
                className="border d-flex align-items-center gap-2 bg-white shadow-sm px-2 py-1 rounded"
              >
                <div
                  className={`bg-${dotColor}`}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                  }}
                />
                <span className="text-dark fw-medium fs-xs">{status}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu className="shadow-sm border-0 fs-sm">
                <Dropdown.Item onClick={() => handleStatusChange(info.row.original, 'Used')}>
                  Mark as Used
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleStatusChange(info.row.original, 'Unused')}>
                  Mark as Unused
                </Dropdown.Item>
                {/* <Dropdown.Item onClick={() => handleStatusChange(info.row.original, 'Cancelled')} className="text-danger">
                  Cancel Ticket
                </Dropdown.Item> */}
              </Dropdown.Menu>
            </Dropdown>
          );
        },
      }),
      columnHelper.display({
        id: "action",
        header: "Action",
        cell: (info) => (
          <div className="d-flex align-items-center gap-1">
            <OverlayTrigger placement="top" overlay={<Tooltip>View</Tooltip>}>
              <Button 
                variant="light" 
                size="sm" 
                className="btn-icon border"
                onClick={() => {
                  setSelectedViewAttendee(info.row.original);
                  setShowViewModal(true);
                }}
              >
                <Icon icon="eye" className="fs-16 text-secondary" />
              </Button>
            </OverlayTrigger>
            
            {canWrite && info.row.original.ticketStatus !== 'Used' && (
              <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
                <Button 
                  variant="light" 
                  size="sm" 
                  className="btn-icon border"
                  onClick={() => {
                    setModalId(info.row.original._id || info.row.original.id || null);
                    setShowModal(true);
                  }}
                >
                  <Icon icon="square-pen" className="fs-16 text-secondary" />
                </Button>
              </OverlayTrigger>
            )}

            <Dropdown>
              <Dropdown.Toggle variant="light" size="sm" className="btn-icon hide-arrow border">
                <Icon icon="more-horizontal" className="fs-16 text-secondary" />
              </Dropdown.Toggle>
              <Dropdown.Menu align="end" className="shadow-sm border-0 fs-sm">
                <Dropdown.Item 
                  onClick={() => handleResendTicket(info.row.original._id || info.row.original.id || "")}
                  className="d-flex align-items-center gap-2"
                >
                  <Icon icon="ticket" className="fs-14 text-muted" /> Resend Ticket
                </Dropdown.Item>
                {canDelete && info.row.original.ticketStatus !== 'Used' && (
                  <>
                    <Dropdown.Item 
                      className="text-danger d-flex align-items-center gap-2" 
                      onClick={() => handleDelete(info.row.original._id || info.row.original.id || "")}
                    >
                      <Icon icon="trash" className="fs-14" /> Delete
                    </Dropdown.Item>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        ),
      }),
    ],
    [canDelete, canWrite]
  );

  const filteredAttendees = useMemo(() => {
    return attendees.filter(a => {
      const matchesSearch = a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            a.eventId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || a.paymentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [attendees, searchTerm, statusFilter]);

  const table = useReactTable({
    data: filteredAttendees,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
    if (attendees.length === 0) return;
    const headers = ["ID", "Name", "Event", "Ticket", "Price", "Ticket Status", "Payment Status", "Date"];
    const csvContent = [
      headers.join(","),
      ...attendees.map((a) => {
        return `"${a._id}","${a.name}","${a.eventId?.title || ''}","${a.ticketId?.ticketName || ''}",${a.ticketPrice},"${a.ticketStatus}","${a.paymentStatus}","${dayjs(a.createdAt).format("YYYY-MM-DD")}"`
      }),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Attendees_Export_${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalItems = filteredAttendees.length;
  const start = pagination.pageIndex * pagination.pageSize + 1;
  const end = Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalItems);

  if (!canRead) {
    return <div className="p-4 text-center">You do not have permission to view attendees.</div>;
  }

  if (!mounted) {
    return null;
  }

  return (
    <Card className="shadow-sm border-0 mb-4">
      <div className="p-3 border-bottom">
        <h5 className="mb-1 fw-bold">Manage Attendees</h5>
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
                  {statusFilter === "All" ? "All Payment Statuses" : statusFilter}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item active={statusFilter === "All"} onClick={() => setStatusFilter("All")}>
                  All Payment Statuses
                </Dropdown.Item>
                <Dropdown.Item active={statusFilter === "Success"} onClick={() => setStatusFilter("Success")}>
                  Success
                </Dropdown.Item>
                <Dropdown.Item active={statusFilter === "Pending"} onClick={() => setStatusFilter("Pending")}>
                  Pending
                </Dropdown.Item>
                <Dropdown.Item active={statusFilter === "Failed"} onClick={() => setStatusFilter("Failed")}>
                  Failed
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

            {/* {canWrite && (
              <Button 
                variant="primary" 
                size="sm" 
                className="d-flex align-items-center gap-1"
                onClick={() => { setModalId(null); setShowModal(true); }}
              >
                <Icon icon="plus" className="fs-16" />
                <span className="d-none d-sm-inline">Add Attendee</span>
              </Button>
            )} */}
          </div>
      </CardHeader>
      <CardBody className="p-0">
        {error && (
          <Alert variant="danger" className="m-3 border-0">
            {error}
          </Alert>
        )}
        <div className="table-responsive">
          <DataTable<AttendeeRecord> table={table} isLoading={loading} />
        </div>
      </CardBody>
      <CardFooter className="bg-white border-top py-3">
        {totalItems > 0 && (
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
            itemsName="attendees"
          />
        )}
      </CardFooter>

      <AttendeeModal
        show={showModal}
        onHide={() => setShowModal(false)}
        id={modalId}
        onSuccess={() => dispatch(fetchAttendees())}
      />
      
      <AttendeeViewModal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        attendee={selectedViewAttendee}
      />
      
      {resendingAttendee && (() => {
        // The Attendee model has NO ticketName field.
        // ticketId.ticketName is always the BASE name (e.g. "For Accompanying Person")
        // The "(Under X)" suffix is derived from: ticketPrice === 0 + age present + accompanying ticket
        const baseTicketName = resendingAttendee.ticketId?.ticketName || 'Event Ticket';
        const isUnderAge =
          resendingAttendee.ticketPrice === 0 &&
          resendingAttendee.age &&
          !isNaN(parseInt(resendingAttendee.age)) &&
          baseTicketName.toLowerCase().includes('accompanying');
        const safeTicketName = isUnderAge
          ? `${baseTicketName} (Under ${underAgeLimit})`
          : baseTicketName;

        return (
          <div style={{ position: "absolute", top: "-9999px", left: "-9999px", width: "800px" }}>
            <div id={`admin-attendee-list-ticket-${resendingAttendee._id || resendingAttendee.id}`}>
              <TicketTemplate 
                attendee={{
                  ...resendingAttendee,
                  ticketName: safeTicketName,
                  ticketPrice: resendingAttendee.ticketPrice || 0,
                  paymentStatus: resendingAttendee.paymentStatus || resendingAttendee.bookingId?.paymentStatus || 'Completed',
                  ticketStatus: resendingAttendee.status || resendingAttendee.ticketStatus || 'Unused',
                  ticketId: resendingAttendee.ticketId?._id || resendingAttendee.ticketId?.id || resendingAttendee.ticketId || ''
                }} 
                eventDetails={resendingEventDetails} 
                user={resendingAttendee.bookingId?.userId || resendingAttendee.bookingId?.billingInfo || { name: resendingAttendee.name || 'Guest' }} 
                bookingId={resendingAttendee.bookingId?._id || resendingAttendee.bookingId?.id || "N/A"} 
                pdfMode={true}
              />
            </div>
          </div>
        );
      })()}

      {downloadingTxn && (
        <div style={{ position: "absolute", top: "-9999px", left: "-9999px", width: "800px" }}>
          <InvoiceTemplate 
            transaction={downloadingTxn} 
            user={{ 
              name: downloadingTxn.user?.name || "", 
              email: downloadingTxn.user?.email, 
              phone: downloadingTxn.user?.phone,
              memberId: downloadingTxn.user?.memberId || ""
            }} 
            id={`admin-booking-invoice-template-${resendingAttendee?._id || resendingAttendee?.id}`} 
          />
        </div>
      )}
    </Card>
  );
};

export default AttendeeListContent;
