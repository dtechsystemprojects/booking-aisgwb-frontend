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
import React, { useMemo, useState, useEffect } from "react";
import {
  Alert,
  Button,
  Card,
  CardFooter,
  CardHeader,
  Col,
  Dropdown,
  FormSelect,
  OverlayTrigger,
  Row,
  Tooltip,
  Spinner,
  Modal,
} from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchActivities,
  deleteActivity,
  clearActivityError,
  ActivityRecord,
} from "@/redux/slices/admin/activitySlice";
import { useAccess } from "@/hooks/useAccess";

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  const time = d.toLocaleTimeString("en-US");
  return `${day}/${month}/${year} ${time}`;
};

const ActivityListContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activities, loading, error } = useAppSelector(
    (state) => state.activities
  );

  const {
    read: canRead,
    delete: canDelete,
    export: canExport,
  } = useAccess("Activities");

  const [searchTerm, setSearchTerm] = useState("");
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityRecord | null>(null);

  useEffect(() => {
    if (canRead) {
      dispatch(fetchActivities());
    }
  }, [dispatch, canRead]);

  useEffect(() => {
    if (error) {
      Swal.fire("Error", error, "error");
      dispatch(clearActivityError());
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

  const handleConfirmBulkDelete = () => {
    const selectedIds = Object.keys(selectedRowIds);
    if (selectedIds.length === 0) return;

    Swal.fire({
      title: "Delete Selected Activities?",
      text: `Are you sure you want to delete ${selectedIds.length} log${
        selectedIds.length > 1 ? "s" : ""
      }? This action cannot be undone.`,
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
          const res = await dispatch(deleteActivity(id));
          if (deleteActivity.fulfilled.match(res)) {
            deletedCount++;
          }
        }

        setAlertMsg(
          `Successfully deleted ${deletedCount} log${
            deletedCount > 1 ? "s" : ""
          }.`
        );
        setSelectedRowIds({}); // Clear selection
        Swal.fire({
          title: "Deleted!",
          text: `${deletedCount} log${
            deletedCount > 1 ? "s have" : " has"
          } been deleted.`,
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  };

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const s = searchTerm.toLowerCase();
      const matchesSearch =
        (a.module_name || "").toLowerCase().includes(s) ||
        (a.action || "").toLowerCase().includes(s) ||
        (a.ip || "").toLowerCase().includes(s);
      return matchesSearch;
    });
  }, [activities, searchTerm]);

  const columnHelper = createColumnHelper<ActivityRecord>();

  const columns: ColumnDef<ActivityRecord, any>[] = [
    columnHelper.display({
      id: "selection",
      header: ({ table }: { table: TableType<ActivityRecord> }) => (
        <input
          type="checkbox"
          className="form-check-input form-check-input-light fs-14"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }: { row: TableRow<ActivityRecord> }) => (
        <input
          type="checkbox"
          className="form-check-input form-check-input-light fs-14"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      enableSorting: false,
      enableColumnFilter: false,
    }),
    columnHelper.accessor("module_name", {
      header: "Module",
      cell: ({ row }) => (
        <div className="fw-semibold text-dark fs-14">
          {row.original.module_name}
        </div>
      ),
    }),
    columnHelper.accessor("action", {
      header: "Action",
      cell: ({ row }) => {
        let variant = "secondary";
        const actionStr = (row.original.action || "").toUpperCase();
        if (actionStr.includes("CREATE")) variant = "success";
        else if (actionStr.includes("UPDATE")) variant = "warning";
        else if (actionStr.includes("DELETE")) variant = "danger";
        else if (actionStr.includes("LOGIN")) variant = "info";

        return (
          <span className={`badge bg-${variant}-subtle text-${variant} px-2 py-1 fs-12`}>
            {row.original.action}
          </span>
        );
      },
    }),
    columnHelper.accessor("ip", {
      header: "IP Address",
      cell: ({ row }) => <span className="fs-13">{row.original.ip}</span>,
    }),
    columnHelper.accessor("createdAt", {
      header: "Date",
      cell: ({ row }) => {
        const dateStr = formatDate(row.original.createdAt);
        return <span className="fs-13 text-muted">{dateStr}</span>;
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: TableRow<ActivityRecord> }) => (
        <div className="d-flex align-items-center gap-1">
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id={`view-${row.original.id}`}>View Details</Tooltip>}
          >
            <Button
              size="sm"
              className="btn-default btn-icon rounded-circle"
              onClick={() => {
                setSelectedActivity(row.original);
                setViewModalOpen(true);
              }}
            >
              <Icon icon="eye" className="fs-lg text-primary" />
            </Button>
          </OverlayTrigger>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: filteredActivities,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection: selectedRowIds,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setSelectedRowIds,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalItems = filteredActivities.length;
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
          <h5 className="mb-1 fw-bold">Activity Logs</h5>
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
                {[10, 15, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </FormSelect>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="app-search">
              <input
                type="text"
                className="form-control"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Icon icon="search" className="app-search-icon text-muted" />
            </div>

            {canDelete && Object.keys(selectedRowIds).length > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmBulkDelete}
              >
                Delete ({Object.keys(selectedRowIds).length})
              </Button>
            )}

            {canExport && (
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="tooltip-export-csv">Export to CSV</Tooltip>
                }
              >
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => {
                    const selectedIds = Object.keys(selectedRowIds);
                    const dataToExport =
                      selectedIds.length > 0
                        ? filteredActivities.filter((a) =>
                            selectedIds.includes(a.id)
                          )
                        : filteredActivities;

                    const csvRows = [
                      [
                        "Module",
                        "Action",
                        "User ID",
                        "IP",
                        "Date",
                        "Description",
                      ],
                      ...dataToExport.map((a) => [
                        a.module_name,
                        a.action,
                        a.user_id,
                        a.ip,
                        formatDate(a.createdAt),
                        JSON.stringify(a.description || {}),
                      ]),
                    ];
                    const csvString = csvRows
                      .map((r) =>
                        r
                          .map((c) => `"${String(c).replace(/"/g, '""')}"`)
                          .join(",")
                      )
                      .join("\n");
                    const blob = new Blob([csvString], {
                      type: "text/csv;charset=utf-8;",
                    });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = `activities_export.csv`;
                    link.click();
                  }}
                  className="d-flex align-items-center gap-1"
                >
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
                  table.setPageSize(15);
                }}
                title="Reset"
              >
                <Icon icon="rotate-ccw" className="fs-sm" />
              </Button>
            </OverlayTrigger>
          </div>
        </CardHeader>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            <DataTable<ActivityRecord>
              table={table}
              emptyMessage="No activity logs found matching your criteria."
            />
            {filteredActivities.length > 0 && (
              <CardFooter className="border-0 bg-white pt-2 pb-4 px-4">
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
                  itemsName="logs"
                />
              </CardFooter>
            )}
          </>
        )}
      </Card>

      <Modal show={viewModalOpen} onHide={() => setViewModalOpen(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Activity Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedActivity && (
            <Row>
              <Col md={6} className="mb-3">
                <strong>Module:</strong>
                <div>{selectedActivity.module_name}</div>
              </Col>
              <Col md={6} className="mb-3">
                <strong>Action:</strong>
                <div>{selectedActivity.action}</div>
              </Col>
              <Col md={6} className="mb-3">
                <strong>User ID:</strong>
                <div>{selectedActivity.user_id}</div>
              </Col>
              <Col md={6} className="mb-3">
                <strong>IP Address:</strong>
                <div>{selectedActivity.ip}</div>
              </Col>
              <Col md={6} className="mb-3">
                <strong>Date:</strong>
                <div>{formatDate(selectedActivity.createdAt)}</div>
              </Col>
              <Col xs={12} className="mb-3">
                <strong>Details:</strong>
                <pre className="bg-light p-3 rounded mt-2" style={{ maxHeight: "300px", overflow: "auto" }}>
                  {JSON.stringify(selectedActivity.description || {}, null, 2)}
                </pre>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ActivityListContent;
