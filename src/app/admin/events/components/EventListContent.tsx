"use client";
import DataTable from "@/components/table/DataTable";
import Swal from "sweetalert2";
import TablePagination from "@/components/table/TablePagination";
import Icon from "@/components/wrappers/Icon";
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  Row as TableRow,
  Table as TableType,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import React, { useMemo, useState, useEffect } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Dropdown,
  FormSelect,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import { EventRecord } from "@/app/admin/dataStore";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchEvents,
  deleteEvent,
  clearEventError,
} from "@/redux/slices/admin/eventSlice";
import { fetchBookings } from "@/redux/slices/admin/bookingSlice";
import { useAccess } from "@/hooks/useAccess";

const EventListContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    events,
    pagination: reduxPagination,
    loading,
    error,
  } = useAppSelector((state) => state.events);

  const {
    read: canRead,
    write: canWrite,
    delete: canDelete,
    export: canExport,
  } = useAccess("Events");

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 8 });
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (canRead) {
      dispatch(fetchEvents());
    }
    const successMsg = sessionStorage.getItem("eventSuccessMsg");
    if (successMsg) {
      setAlertMsg(successMsg);
      sessionStorage.removeItem("eventSuccessMsg");
    }
  }, [dispatch, canRead]);

  useEffect(() => {
    if (error) {
      Swal.fire("Error", error, "error");
      dispatch(clearEventError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (alertMsg) {
      const timer = setTimeout(() => {
        setAlertMsg(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMsg]);

  const handleConfirmDeleteSingle = (event: EventRecord) => {
    Swal.fire({
      title: "Are you sure delete this event?",
      text: `Event - "${event.title}" can not be retrieved after deletion!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const eventId = event._id || event.id;
          if (eventId) {
            const bookingsRes = await dispatch(fetchBookings()).unwrap();
            const isUsed = bookingsRes.some((b: any) => 
              b.eventId?._id === eventId || b.eventId?.id === eventId || b.eventId === eventId
            );

            if (isUsed) {
              Swal.fire("Delete Failed", "Events module delete failed. This event is currently in use in the booking module.", "error");
              return;
            }

            await dispatch(deleteEvent(eventId)).unwrap();
            setAlertMsg(`Event "${event.title}" has been deleted.`);
            Swal.fire({
              title: "Deleted!",
              text: `Event "${event.title}" has been deleted.`,
              icon: "success",
              timer: 1200,
              showConfirmButton: false,
            });
          }
        } catch (err: any) {
          Swal.fire("Error!", err || "Failed to delete event.", "error");
        }
      }
    });
  };

  const handleConfirmBulkDelete = () => {
    const selectedIds = Object.keys(selectedRowIds);
    if (selectedIds.length === 0) return;

    Swal.fire({
      title: "Delete Selected Events?",
      text: `Are you sure you want to delete ${selectedIds.length} event${selectedIds.length > 1 ? "s" : ""}? This action cannot be undone.`,
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
        let usedCount = 0;
        try {
          const bookingsRes = await dispatch(fetchBookings()).unwrap();

          for (const id of selectedIds) {
            const isUsed = bookingsRes.some((b: any) => 
              b.eventId?._id === id || b.eventId?.id === id || b.eventId === id
            );

            if (isUsed) {
              usedCount++;
              continue;
            }

            await dispatch(deleteEvent(id)).unwrap();
            deletedCount++;
          }
          
          if (usedCount > 0 && deletedCount === 0) {
            Swal.fire(
              "Delete Failed",
              "Events module delete failed. Selected events are currently in use in the booking module.",
              "error"
            );
          } else if (usedCount > 0) {
            Swal.fire(
              "Partial Deletion",
              `Successfully deleted ${deletedCount} event(s). Failed to delete ${usedCount} event(s) because they are in use in the booking module.`,
              "warning"
            );
          } else {
            setAlertMsg(
              `Successfully deleted ${deletedCount} event${deletedCount > 1 ? "s" : ""}.`
            );
            Swal.fire({
              title: "Deleted!",
              text: `${deletedCount} event${deletedCount > 1 ? "s have" : " has"} been deleted.`,
              icon: "success",
              timer: 1200,
              showConfirmButton: false,
            });
          }
          setSelectedRowIds({});
        } catch (err: any) {
          Swal.fire("Error!", err || "Failed to delete some events.", "error");
        }
      }
    });
  };

  const exportToCSV = () => {
    if (events.length === 0) return;
    const headers = ["ID", "Title", "Type", "Status", "StartDate", "EndDate"];
    const csvContent = [
      headers.join(","),
      ...events.map(
        (e) =>
          `${e._id || e.id},"${e.title}","${e.eventType}","${e.status}","${e.startDate}","${e.endDate}"`,
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Events_Export_${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || e.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "All" || e.eventType === typeFilter;
      const matchesStatus = statusFilter === "All" || e.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [events, searchTerm, typeFilter, statusFilter]);

  const columnHelper = createColumnHelper<EventRecord>();

  const columns: ColumnDef<EventRecord, any>[] = [
    columnHelper.display({
      id: "selection",
      header: ({ table }: { table: TableType<EventRecord> }) => (
        <input
          type="checkbox"
          className="form-check-input form-check-input-light fs-14"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }: { row: TableRow<EventRecord> }) => {
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
    columnHelper.accessor("title", {
      header: "Title & Slug",
      cell: ({ row }) => (
        <div className="d-flex align-items-center gap-3">
          <div className="avatar-sm flex-shrink-0">
            {row.original.logo ? (
              <img
                src={row.original.logo}
                alt=""
                className="img-fluid rounded-circle border"
              />
            ) : (
              <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-primary fw-bold" style={{ width: "32px", height: "32px" }}>
                {row.original.title?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="fw-semibold text-dark fs-14">{row.original.title}</div>
            <div className="text-muted fs-12">{row.original.slug}</div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("startDate", {
      header: "Date Range",
      cell: ({ row }) => {
        const sd = row.original.startDate ? new Date(row.original.startDate).toLocaleDateString() : 'N/A';
        const ed = row.original.endDate ? new Date(row.original.endDate).toLocaleDateString() : 'N/A';
        return (
          <div>
            <div className="text-dark fs-13">{sd}</div>
            <div className="text-muted fs-12 d-flex align-items-center gap-1 mt-1">
              <Icon icon="arrow-right" className="fs-12" /> {ed}
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("eventType", {
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.eventType;
        let variant = "secondary";
        if (type === "Online") variant = "info";
        else if (type === "Offline") variant = "primary";
        else if (type === "Hybrid") variant = "warning";
        return (
          <Badge bg={`${variant}-subtle`} className={`text-${variant} px-2 py-1 fs-12`}>
            {type}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        let variant = "secondary";
        if (s === "Ongoing") variant = "success";
        else if (s === "Upcoming") variant = "info";
        else if (s === "Draft") variant = "warning";
        else if (s === "Expired") variant = "danger";
        return (
          <div className="d-inline-flex align-items-center gap-1">
            <span className={`badge bg-${variant}-subtle text-${variant} badge-label d-inline-flex align-items-center gap-1`}>
              <Icon
                icon={
                  s === "Ongoing" ? "play-circle" : s === "Upcoming" ? "calendar" : s === "Draft" ? "edit-2" : "x-circle"
                }
                className="fs-xs"
              />
              <span>{s}</span>
            </span>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: TableRow<EventRecord> }) => {
        return (
          <div className="d-flex align-items-center gap-1">
            {canWrite && (
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id={`edit-${row.original._id || row.original.id}`}>Edit</Tooltip>}
              >
                <Link href={`/admin/events/edit?id=${row.original._id || row.original.id}`}>
                  <Button size="sm" className="btn-default btn-icon rounded-circle">
                    <Icon icon="square-pen" className="fs-lg text-secondary" />
                  </Button>
                </Link>
              </OverlayTrigger>
            )}
            {canDelete && (
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id={`del-${row.original._id || row.original.id}`}>Delete</Tooltip>}
              >
                <Button
                  size="sm"
                  className="btn-default btn-icon rounded-circle"
                  onClick={() => handleConfirmDeleteSingle(row.original)}
                >
                  <Icon icon="trash-2" className="fs-lg text-danger" />
                </Button>
              </OverlayTrigger>
            )}
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: filteredEvents,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection: selectedRowIds,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setSelectedRowIds,
    getRowId: (row) => row._id || row.id || "",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalItems = filteredEvents.length;
  const start = pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, totalItems);

  return (
    <>
      {alertMsg && (
        <Alert
          variant="success"
          onClose={() => setAlertMsg(null)}
          dismissible
          className="d-flex align-items-center gap-2 mb-3"
        >
          <Icon icon="check-circle" className="fs-18 flex-shrink-0" />
          <span>{alertMsg}</span>
        </Alert>
      )}

      <Card className="shadow-sm border-0">
        <div className="p-3 border-bottom">
          <h5 className="mb-1 fw-bold">Manage Events</h5>
        </div>
        <CardHeader className="border-light justify-content-between align-items-center flex-wrap gap-2 py-3">          
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="d-flex align-items-center gap-1">
              <span className="text-muted fw-semibold fs-xs">Show</span>
              <FormSelect
                className="form-select form-select-sm my-1 my-md-0"
                style={{ width: "auto" }}
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
              >
                {[10, 15, 20].map((size) => (
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
                <Dropdown.Item active={statusFilter === "Ongoing"} onClick={() => setStatusFilter("Ongoing")}>
                  Ongoing
                </Dropdown.Item>
                <Dropdown.Item active={statusFilter === "Upcoming"} onClick={() => setStatusFilter("Upcoming")}>
                  Upcoming
                </Dropdown.Item>
                <Dropdown.Item active={statusFilter === "Draft"} onClick={() => setStatusFilter("Draft")}>
                  Draft
                </Dropdown.Item>
                <Dropdown.Item active={statusFilter === "Expired"} onClick={() => setStatusFilter("Expired")}>
                  Expired
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Dropdown className="d-inline-block ms-1">
              <Dropdown.Toggle
                variant="outline-secondary"
                size="sm"
                className="d-flex align-items-center gap-1 my-1 my-md-0"
              >
                <span className="fw-semibold">
                  {typeFilter === "All" ? "All Types" : typeFilter}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item active={typeFilter === "All"} onClick={() => setTypeFilter("All")}>
                  All Types
                </Dropdown.Item>
                <Dropdown.Item active={typeFilter === "Offline"} onClick={() => setTypeFilter("Offline")}>
                  Offline
                </Dropdown.Item>
                <Dropdown.Item active={typeFilter === "Online"} onClick={() => setTypeFilter("Online")}>
                  Online
                </Dropdown.Item>
                <Dropdown.Item active={typeFilter === "Hybrid"} onClick={() => setTypeFilter("Hybrid")}>
                  Hybrid
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
                  setTypeFilter("All");
                  setStatusFilter("All");
                  table.setPageSize(8);
                }}
                title="Reset"
              >
                <Icon icon="rotate-ccw" className="fs-sm" />
              </Button>
            </OverlayTrigger>

            {canWrite && (
              <Link href="/admin/events/edit">
                <Button variant="primary" size="sm" className="d-flex align-items-center gap-1">
                  <Icon icon="plus" className="fs-16" />
                  <span className="d-none d-sm-inline">Add Event</span>
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>

        <CardBody className="p-0">
          <div className="table-responsive">
            <DataTable table={table} />
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
            itemsName="events"
          />
        </CardFooter>
      </Card>
    </>
  );
};

export default EventListContent;
