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
  CardFooter,
  CardHeader,
  Col,
  Dropdown,
  FormSelect,
  OverlayTrigger,
  Row,
  Tooltip,
  Spinner,
} from "react-bootstrap";
import { initialUserGroups, UserRecord } from "@/app/admin/dataStore";
import UserModal from "./UserModal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchUsers,
  addUser,
  updateUser,
  deleteUser,
  clearUserError,
} from "@/redux/slices/admin/userSlice";
import { fetchGroups } from "@/redux/slices/admin/groupSlice";
import { useAccess } from "@/hooks/useAccess";

const getBadgeVariant = (groupId: string, groups: any[]) => {
  const grp = groups.find((g) => g.id === groupId);
  return grp?.badgeVariant || "secondary";
};

const UserListContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    users,
    pagination: reduxPagination,
    loading,
    error,
  } = useAppSelector((state) => state.users);
  const { groups } = useAppSelector((state) => state.groups);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const {
    read: canRead,
    write: canWrite,
    delete: canDelete,
    export: canExport,
  } = useAccess("Users");

  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 8 });
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    if (canRead) {
      dispatch(fetchUsers());
      dispatch(fetchGroups());
    }
  }, [dispatch, canRead]);

  useEffect(() => {
    if (error) {
      Swal.fire("Error", error, "error");
      dispatch(clearUserError());
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

  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (user: UserRecord) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleSaveUser = async (record: UserRecord) => {
    try {
      if (selectedUser && record.id) {
        await dispatch(updateUser(record)).unwrap();
        setAlertMsg(`Updated user "${record.name}" successfully.`);
      } else {
        const payload: any = { ...record };
        if (payload.id && payload.id.startsWith("USR-")) {
          delete payload.id; // Let MongoDB create it
        }
        await dispatch(addUser(payload)).unwrap();
        setAlertMsg(`Added user "${record.name}" successfully.`);
      }
      dispatch(fetchGroups()); // Refresh group counts
      setModalOpen(false);
    } catch (err) {
      throw err;
    }
  };

  const handleConfirmDeleteSingle = (user: UserRecord) => {
    Swal.fire({
      title: "Delete User?",
      text: `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await dispatch(deleteUser(user.id));
        if (deleteUser.fulfilled.match(res)) {
          setAlertMsg(`User "${user.name}" has been deleted.`);
          dispatch(fetchGroups()); // Refresh group counts
          Swal.fire({
            title: "Deleted!",
            text: `User "${user.name}" has been deleted.`,
            icon: "success",
            timer: 1200,
            showConfirmButton: false,
          });
        }
      }
    });
  };

  const handleConfirmBulkDelete = () => {
    const selectedIds = Object.keys(selectedRowIds);
    if (selectedIds.length === 0) return;

    Swal.fire({
      title: "Delete Selected Users?",
      text: `Are you sure you want to delete ${selectedIds.length} user${selectedIds.length > 1 ? "s" : ""}? This action cannot be undone.`,
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
          const user = filteredUsers.find((u) => u.id === id);
          if (
            user &&
            (user.name === "Administrator" ||
              user.email === "admin@gmail.com" ||
              (currentUser &&
                (user.id === currentUser.id ||
                  user.id === currentUser._id ||
                  user.email === currentUser.email)))
          ) {
            continue;
          }
          const res = await dispatch(deleteUser(id));
          if (deleteUser.fulfilled.match(res)) {
            deletedCount++;
          }
        }

        setAlertMsg(
          `Successfully deleted ${deletedCount} user${deletedCount > 1 ? "s" : ""}.`,
        );
        dispatch(fetchGroups()); // Refresh group counts once at end
        setSelectedRowIds({}); // Clear selection
        Swal.fire({
          title: "Deleted!",
          text: `${deletedCount} user${deletedCount > 1 ? "s have" : " has"} been deleted.`,
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.mobile || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGroup = groupFilter === "All" || u.groupId === groupFilter;
      const matchesStatus = statusFilter === "All" || u.status === statusFilter;

      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [users, searchTerm, groupFilter, statusFilter]);

  const columnHelper = createColumnHelper<UserRecord>();

  const columns: ColumnDef<UserRecord, any>[] = [
    columnHelper.display({
      id: "selection",
      header: ({ table }: { table: TableType<UserRecord> }) => (
        <input
          type="checkbox"
          className="form-check-input form-check-input-light fs-14"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }: { row: TableRow<UserRecord> }) => {
        const isProtected =
          row.original.name === "Administrator" ||
          row.original.email === "admin@gmail.com" ||
          (currentUser &&
            (row.original.id === currentUser.id ||
              row.original.id === currentUser._id ||
              row.original.email === currentUser.email));
        return (
          <input
            type="checkbox"
            className="form-check-input form-check-input-light fs-14"
            checked={row.getIsSelected()}
            disabled={isProtected || !row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    }),
    columnHelper.accessor("name", {
      header: "User & Email",
      cell: ({ row }) => (
        <div className="d-flex align-items-center gap-3">
          <div className="avatar-sm flex-shrink-0">
            <img
              src={row.original.avatar || "/images/users/avatar-1.jpg"}
              alt=""
              className="img-fluid rounded-circle border"
            />
          </div>
          <div>
            <div className="fw-semibold text-dark fs-14">
              {row.original.name}
            </div>
            <div className="text-muted fs-12">{row.original.email}</div>
          </div>
        </div>
      ),
    }),
    columnHelper.display({
      id: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <div>
          <div className="text-dark fs-13 d-flex align-items-center gap-1">
            <Icon icon="phone" className="fs-13 text-muted" />{" "}
            {row.original.mobile || "N/A"}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("groupId", {
      header: "Assigned Group",
      cell: ({ row }) => {
        const variant = getBadgeVariant(row.original.groupId || "", groups);
        const grpName = groups.find(g => g.id === row.original.groupId)?.name || row.original.groupId;
        return (
          <Badge
            bg={`${variant}-subtle`}
            className={`text-${variant} px-2 py-1 fs-12`}
          >
            {grpName}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("status", {
      header: "Account Status",
      cell: ({ row }) => {
        const s = row.original.status;
        let variant = "secondary";
        if (s === "Active") variant = "success";
        if (s === "Pending") variant = "warning";
        if (s === "Inactive") variant = "danger";
        return (
          <div className="d-inline-flex align-items-center gap-1">
            <span
              className={`badge bg-${variant}-subtle text-${variant} badge-label d-inline-flex align-items-center gap-1`}
            >
              <Icon
                icon={
                  s === "Active"
                    ? "check-circle"
                    : s === "Pending"
                      ? "clock"
                      : "alert-triangle"
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
      id: "2fa",
      header: "2FA",
      cell: ({ row }) =>
        row.original.twoFactorEnabled ? (
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`2fa-true-${row.original.id}`}>2FA Enabled</Tooltip>
            }
          >
            <div className="d-inline-flex align-items-center justify-content-center bg-success-subtle text-success rounded-circle p-1">
              <Icon icon="shield-check" className="fs-14" />
            </div>
          </OverlayTrigger>
        ) : (
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`2fa-false-${row.original.id}`}>
                2FA Disabled
              </Tooltip>
            }
          >
            <div className="d-inline-flex align-items-center justify-content-center bg-light text-muted rounded-circle p-1">
              <Icon icon="shield-off" className="fs-14" />
            </div>
          </OverlayTrigger>
        ),
    }),
    columnHelper.accessor("joinedDate", {
      header: "Joined Date",
      cell: ({ row }) => (
        <span className="fs-13">
          {row.original.joinedDate
            ? new Date(row.original.joinedDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A"}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: TableRow<UserRecord> }) => {
        const isProtected =
          row.original.name === "Administrator" ||
          row.original.email === "admin@gmail.com" ||
          (currentUser &&
            (row.original.id === currentUser.id ||
              row.original.id === currentUser._id ||
              row.original.email === currentUser.email));
        return (
          <div className="d-flex align-items-center gap-1">
            {canWrite && (
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id={`edit-${row.original.id}`}>Edit</Tooltip>}
              >
                <Button
                  size="sm"
                  className="btn-default btn-icon rounded-circle"
                  onClick={() => handleOpenEditModal(row.original)}
                >
                  <Icon icon="square-pen" className="fs-lg text-secondary" />
                </Button>
              </OverlayTrigger>
            )}
            {canDelete && !isProtected && (
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id={`del-${row.original.id}`}>Delete</Tooltip>
                }
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
    data: filteredUsers,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection: selectedRowIds,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setSelectedRowIds,
    enableRowSelection: (row) => {
      const isProtected =
        row.original.name === "Administrator" ||
        row.original.email === "admin@gmail.com" ||
        (currentUser &&
          (row.original.id === currentUser.id ||
            row.original.id === currentUser._id ||
            row.original.email === currentUser.email));
      return !isProtected;
    },
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalItems = filteredUsers.length;
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
          <h5 className="mb-1 fw-bold">Manage Users</h5>
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
                {[5, 8, 10, 15, 20].map((size) => (
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
                <Dropdown.Item
                  active={statusFilter === "All"}
                  onClick={() => setStatusFilter("All")}
                >
                  All Statuses
                </Dropdown.Item>
                <Dropdown.Item
                  active={statusFilter === "Active"}
                  onClick={() => setStatusFilter("Active")}
                >
                  Active
                </Dropdown.Item>
                {/* <Dropdown.Item active={statusFilter === 'Pending'} onClick={() => setStatusFilter('Pending')}>
                  Pending
                </Dropdown.Item> */}
                <Dropdown.Item
                  active={statusFilter === "Inactive"}
                  onClick={() => setStatusFilter("Inactive")}
                >
                  Inactive
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
                  {groupFilter === "All" 
                    ? "All Groups" 
                    : groups.find(g => g.id === groupFilter)?.name || groupFilter}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  active={groupFilter === "All"}
                  onClick={() => setGroupFilter("All")}
                >
                  All Groups
                </Dropdown.Item>
                {groups.map((g) => (
                  <Dropdown.Item
                    key={g.id}
                    active={groupFilter === g.id}
                    onClick={() => setGroupFilter(g.id)}
                  >
                    {g.name}
                  </Dropdown.Item>
                ))}
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
                        ? filteredUsers.filter((u) =>
                            selectedIds.includes(u.id),
                          )
                        : filteredUsers;

                    const csvRows = [
                      [
                        "Name",
                        "Username",
                        "Email",
                        "Mobile",
                        "Sex",
                        "Group",
                        "Status",
                        "2FA",
                        "Joined",
                      ],
                      ...dataToExport.map((u) => [
                        u.name,
                        u.username || "",
                        u.email,
                        u.mobile || "",
                        u.sex || "",
                        groups.find(g => g.id === u.groupId)?.name || u.groupId || "",
                        u.status,
                        u.twoFactorEnabled ? "Yes" : "No",
                        u.joinedDate ? new Date(u.joinedDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "",
                      ]),
                    ];
                    const csvString = csvRows
                      .map((r) =>
                        r
                          .map((c) => `"${String(c).replace(/"/g, '""')}"`)
                          .join(","),
                      )
                      .join("\n");
                    const blob = new Blob([csvString], {
                      type: "text/csv;charset=utf-8;",
                    });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = `users_export.csv`;
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
                  setGroupFilter("All");
                  setStatusFilter("All");
                  table.setPageSize(8);
                }}
                title="Reset"
              >
                <Icon icon="rotate-ccw" className="fs-sm" />
              </Button>
            </OverlayTrigger>

            {canWrite && (
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="tooltip-add-new">Add New</Tooltip>}
              >
                <Button
                  variant="primary"
                  size="sm"
                  className="d-flex align-items-center gap-1 fw-semibold"
                  onClick={handleOpenAddModal}
                >
                  <Icon icon="plus" className="fs-sm" /> Add New
                </Button>
              </OverlayTrigger>
            )}
          </div>
        </CardHeader>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            <DataTable<UserRecord>
              table={table}
              emptyMessage="No users found matching your criteria."
            />
            {filteredUsers.length > 0 && reduxPagination && (
              <CardFooter className="border-0 bg-white pt-2 pb-4 px-4">
                <TablePagination
                  totalItems={reduxPagination.total}
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
                  itemsName="users"
                />
              </CardFooter>
            )}
          </>
        )}
      </Card>

      <UserModal
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
      />
    </>
  );
};

export default UserListContent;
