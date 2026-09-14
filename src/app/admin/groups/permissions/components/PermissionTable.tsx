"use client";
import DataTable from "@/components/table/DataTable";
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
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardFooter,
  CardHeader,
  FormControl,
  FormSelect,
  OverlayTrigger,
  Tooltip,
  Spinner,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { ManagementType } from "./data";
import PermissionModal from "./PermissionModal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchPermissions,
  addPermission,
  updatePermission,
  deletePermission,
  clearPermissionError,
} from "@/redux/slices/admin/permissionSlice";
import { useEffect } from "react";
import { usePageAccess, useAccess } from "@/hooks/useAccess";

const PermissionTable = () => {
  const access = usePageAccess("Permissions");
  const { read: canReadGroupAccess } = useAccess("Group Access");
  const dispatch = useAppDispatch();
  const {
    permissions: data,
    loading,
    error,
  } = useAppSelector((state) => state.permissions);
  const { groups } = useAppSelector((state) => state.groups);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 8 });
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>(
    {},
  );
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<ManagementType | null>(null);

  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Swal.fire("Error", error, "error");
      dispatch(clearPermissionError());
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

  const handleOpenAdd = () => {
    setSelectedPermission(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (perm: ManagementType) => {
    setSelectedPermission(perm);
    setModalOpen(true);
  };

  const handleSavePermission = async (record: ManagementType) => {
    try {
      if (selectedPermission) {
        await dispatch(updatePermission(record)).unwrap();
        setAlertMsg(`Permission "${record.name}" updated.`);
      } else {
        await dispatch(addPermission(record)).unwrap();
        setAlertMsg(`Permission "${record.name}" added successfully.`);
      }
    } catch (err: any) {
      console.error("Error saving permission:", err);
      Swal.fire("Error", err || "Failed to save permission", "error");
      throw err;
    }
  };

  const columnHelper = createColumnHelper<ManagementType>();

  const columns: ColumnDef<ManagementType, any>[] = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({ row }) => (
        <span className="fw-semibold text-dark">{row.original.name}</span>
      ),
    }),
    columnHelper.accessor("category", {
      header: "Category",
      cell: ({ row }) => (
        <span className="text-muted">
          {row.original.category || "Management"}
        </span>
      ),
    }),
    columnHelper.accessor("roles", {
      header: "Assign To",
      cell: ({ row }) => (
        <div className="d-flex gap-1 flex-wrap">
          {row.original.roles.map((role: any, idx) => {
            const grpName = groups.find(g => g.id === role.groupId)?.name || role.groupId;
            return (
              <span
                key={idx}
                className={clsx(
                  "badge badge-label fs-xxs fw-semibold",
                  role.className,
                )}
              >
                {grpName}
              </span>
            );
          })}
        </div>
      ),
      enableSorting: false,
    }),
    columnHelper.accessor("date", {
      header: "Last Modified",
      cell: ({ row }) => (
        <>
          {row.original.date},{" "}
          <span className="text-muted">{row.original.time}</span>
        </>
      ),
    }),
    columnHelper.accessor("users", {
      header: "Users",
      cell: ({ row }) => (
        <span className="badge bg-light text-dark border px-2 py-1">
          {row.original.users} Users
        </span>
      ),
    }),
    {
      header: "Actions",
      cell: ({ row }: { row: TableRow<ManagementType> }) => (
        <div className="d-flex gap-1">
          {access.write && (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id={`tooltip-edit-${row.id}`}>Edit</Tooltip>}
            >
              <Button
                variant="light"
                size="sm"
                className="btn-icon rounded-circle"
                onClick={() => handleOpenEdit(row.original)}
              >
                <Icon icon="edit" className="fs-14 text-primary" />
              </Button>
            </OverlayTrigger>
          )}
          {access.delete && (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id={`tooltip-delete-${row.id}`}>
                  Delete Permission
                </Tooltip>
              }
            >
              <Button
                variant="light"
                size="sm"
                className="btn-icon rounded-circle"
                onClick={() => handleConfirmDeleteSingle(row.original)}
              >
                <Icon icon="trash-2" className="fs-14 text-danger" />
              </Button>
            </OverlayTrigger>
          )}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination, rowSelection: selectedRowIds },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onRowSelectionChange: setSelectedRowIds,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
    enableRowSelection: true,
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalItems = table.getFilteredRowModel().rows.length;

  const start = pageIndex * pageSize + 1;
  const end = Math.min(start + pageSize - 1, totalItems);

  const handleConfirmDeleteSingle = (perm: ManagementType) => {
    Swal.fire({
      title: "Delete Permission?",
      text: `Are you sure you want to delete permission "${perm.name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const actionResult = await dispatch(
          deletePermission(perm.id || perm.name),
        );
        if (deletePermission.fulfilled.match(actionResult)) {
          setAlertMsg(`Permission "${perm.name}" has been deleted.`);
          Swal.fire({
            title: "Deleted!",
            text: `Permission "${perm.name}" has been deleted.`,
            icon: "success",
            timer: 1200,
            showConfirmButton: false,
          });
        }
      }
    });
  };

  const handleConfirmDeleteBulk = () => {
    const count = Object.keys(selectedRowIds).length;
    Swal.fire({
      title: "Delete Selected Permissions?",
      text: `Are you sure you want to delete ${count} selected permission(s)? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const selectedIds = new Set(Object.keys(selectedRowIds));
        const itemsToDelete = data.filter((_, idx) =>
          selectedIds.has(idx.toString()),
        );

        for (const item of itemsToDelete) {
          await dispatch(deletePermission(item.id || item.name));
        }

        setSelectedRowIds({});
        setPagination({ ...pagination, pageIndex: 0 });
        setAlertMsg(`${count} permission(s) have been deleted.`);
        Swal.fire({
          title: "Deleted!",
          text: `${count} permission(s) have been deleted.`,
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  };

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

      <Card>
        <div className="p-3 border-bottom">
          <h5 className="mb-1 fw-bold">Manage Permissions</h5>
        </div>
        <CardHeader className="border-light justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex gap-2 align-items-center">
            <div className="d-flex align-items-center gap-1">
              <span className="text-muted fs-12">Show</span>
              <FormSelect
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="form-select-sm"
                style={{ width: "75px" }}
              >
                {[5, 8, 10, 15, 20].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </FormSelect>
            </div>

            {access.delete && Object.keys(selectedRowIds).length > 0 && (
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="tooltip-delete-selected">
                    Delete Selected Permissions
                  </Tooltip>
                }
              >
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleConfirmDeleteBulk}
                >
                  Delete Selected
                </Button>
              </OverlayTrigger>
            )}
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="app-search" style={{ width: "220px" }}>
              <FormControl
                type="search"
                placeholder="Search permissions..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="form-control-sm"
              />
              <Icon icon="search" className="app-search-icon text-muted" />
            </div>

            {access.write && (
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="tooltip-add-permission">
                    Add Permission
                  </Tooltip>
                }
              >
                <Button
                  variant="primary"
                  size="sm"
                  className="d-flex align-items-center gap-1 fw-semibold"
                  onClick={handleOpenAdd}
                >
                  <Icon icon="plus" /> Add Permission
                </Button>
              </OverlayTrigger>
            )}

            {canReadGroupAccess && (
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="tooltip-matrix">View Access</Tooltip>
                }
              >
                <Link
                  href="/admin/group-access"
                  className="btn btn-dark btn-sm d-flex align-items-center gap-1 fw-semibold"
                >
                  <Icon icon="shield" /> Group Access
                </Link>
              </OverlayTrigger>
            )}
          </div>
        </CardHeader>
        <DataTable<ManagementType>
          table={table}
          emptyMessage="No records found"
        />
        {table.getRowModel().rows.length > 0 && (
          <CardFooter className="border-0">
            <TablePagination
              totalItems={totalItems}
              start={start}
              end={end}
              itemsName="permissions"
              showInfo
              previousPage={table.previousPage}
              canPreviousPage={table.getCanPreviousPage()}
              pageCount={table.getPageCount()}
              pageIndex={table.getState().pagination.pageIndex}
              setPageIndex={table.setPageIndex}
              nextPage={table.nextPage}
              canNextPage={table.getCanNextPage()}
            />
          </CardFooter>
        )}
      </Card>

      <PermissionModal
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        permission={selectedPermission}
        onSave={handleSavePermission}
      />
    </>
  );
};

export default PermissionTable;
