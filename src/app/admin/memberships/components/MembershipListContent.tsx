'use client';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import DataTable from "@/components/table/DataTable";
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
  useReactTable,
} from "@tanstack/react-table";
import React, { useMemo, useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchMemberships, updateMembershipStatus } from '@/redux/slices/admin/membershipSlice';
import { RootState } from '@/redux/store';
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
  Tooltip,
  Modal
} from "react-bootstrap";
import { toast } from 'react-hot-toast';

const MySwal = withReactContent(Swal);

const MembershipListContent = () => {
  const dispatch = useDispatch<any>();
  const { data, loading, error } = useSelector((state: RootState) => (state as any).adminMembership || (state as any).memberships || { data: [], loading: false, error: null });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  
  const [showModal, setShowModal] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<any>(null);

  useEffect(() => {
    // Fetch with a large limit for client-side pagination/filtering to match Transactions behavior
    dispatch(fetchMemberships({ page: 1, limit: 1000 }));
  }, [dispatch]);

  const handleStatusChange = async (id: string, status: string) => {
    if (status === 'Approved') {
      const result = await MySwal.fire({
        title: 'Approve Membership?',
        text: 'Are you sure you want to approve this membership? An email will be sent to the user.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Approve',
        cancelButtonText: 'Cancel'
      });
      if (result.isConfirmed) {
        try {
          await dispatch(updateMembershipStatus({ id, status })).unwrap();
          toast.success('Membership approved successfully');
        } catch (err: any) {
          toast.error(err || 'Failed to update status');
        }
      }
    } else if (status === 'Rejected') {
      const result = await MySwal.fire({
        title: 'Reject Membership',
        text: 'Please enter a reason for rejection (this will be sent to the user):',
        input: 'textarea',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Reject',
        cancelButtonText: 'Cancel',
        inputValidator: (value) => {
          if (!value) {
            return 'You need to write a reason!';
          }
        }
      });
      
      if (result.isConfirmed) {
        try {
          await dispatch(updateMembershipStatus({ id, status, rejectReason: result.value })).unwrap();
          toast.success('Membership rejected successfully');
        } catch (err: any) {
          toast.error(err || 'Failed to update status');
        }
      }
    } else if (status === 'Suspended') {
      const result = await MySwal.fire({
        title: 'Suspend Membership',
        text: 'Please enter a reason for suspension (this will be sent to the user):',
        input: 'textarea',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Suspend',
        cancelButtonText: 'Cancel',
        inputValidator: (value) => {
          if (!value) {
            return 'You need to write a reason!';
          }
        }
      });
      
      if (result.isConfirmed) {
        try {
          await dispatch(updateMembershipStatus({ id, status, rejectReason: result.value })).unwrap();
          toast.success('Membership suspended successfully');
        } catch (err: any) {
          toast.error(err || 'Failed to update status');
        }
      }
    }
  };

  const handleView = (membership: any) => {
    setSelectedMembership(membership);
    setShowModal(true);
  };

  const columnHelper = createColumnHelper<any>();

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      columnHelper.accessor((row) => row, {
        id: "user",
        header: "User",
        cell: (info) => {
          const user = info.getValue();
          const name = user.name || user.userId?.name || user.userId?.firstName || "Unknown User";
          const email = user.email || user.userId?.email || "-";
          return (
            <div>
              <div className="fw-medium">{name}</div>
              <div className="text-muted small">{email}</div>
            </div>
          );
        },
      }),
      columnHelper.accessor("phone", {
        header: "Phone",
        cell: (info) => info.getValue() || info.row.original.userId?.mobile || "-",
      }),
      columnHelper.accessor("centralMembershipId", {
        header: "Central ID",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("stateMembershipId", {
        header: "State ID",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("amount", {
        header: "Amount",
        cell: (info) => (
          <span className="fw-bold text-dark">
            ₹{info.getValue()?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
          </span>
        ),
      }),
      columnHelper.accessor("paymentStatus", {
        header: "Payment",
        cell: (info) => {
          const status = info.getValue();
          let color = "secondary";
          if (status === "Completed" || status === "Success") color = "success";
          if (status === "Pending") color = "warning";
          if (status === "Failed") color = "danger";
          return (
            <Badge bg={color} className="rounded-pill px-3 py-2 fw-medium">
              {status}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          let color = "secondary";
          if (status === "Approved" || status === "Success") color = "success";
          if (status === "Pending") color = "warning";
          if (status === "Rejected" || status === "Failed") color = "danger";
          if (status === "Suspended") color = "secondary";
          return (
            <Badge bg={color} className="rounded-pill px-3 py-2 fw-medium">
              {status}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: "action",
        header: "Action",
        cell: (info) => {
          const status = info.row.original.status;
          return (
            <div className="d-flex gap-2">
              <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-view-${info.row.id}`}>View Details</Tooltip>}>
                <Button variant="light" size="sm" className="btn-icon text-primary" onClick={() => handleView(info.row.original)}>
                  <Icon icon="eye" className="fs-16" />
                </Button>
              </OverlayTrigger>
              {(status === 'Pending' || status === 'Suspended') && (
                <>
                  <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-approve-${info.row.id}`}>Approve</Tooltip>}>
                    <Button variant="light" size="sm" className="btn-icon text-success" onClick={() => handleStatusChange(info.row.original._id, 'Approved')}>
                      <Icon icon="check-circle" className="fs-16" />
                    </Button>
                  </OverlayTrigger>
                  {status === 'Pending' && (
                    <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-reject-${info.row.id}`}>Reject</Tooltip>}>
                      <Button variant="light" size="sm" className="btn-icon text-danger" onClick={() => handleStatusChange(info.row.original._id, 'Rejected')}>
                        <Icon icon="x-circle" className="fs-16" />
                      </Button>
                    </OverlayTrigger>
                  )}
                </>
              )}
              {status === 'Approved' && (
                <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-suspend-${info.row.id}`}>Suspend</Tooltip>}>
                  <Button variant="light" size="sm" className="btn-icon text-warning" onClick={() => handleStatusChange(info.row.original._id, 'Suspended')}>
                    <Icon icon="pause-circle" className="fs-16" />
                  </Button>
                </OverlayTrigger>
              )}
            </div>
          );
        },
      }),
    ],
    []
  );

  const membershipsList = useMemo(() => Array.isArray(data) ? data : (data?.data || []), [data]);

  const filteredMemberships = useMemo(() => {
    return membershipsList.filter((m: any) => {
      const searchLower = searchTerm.toLowerCase();
      const name = m.name || m.userId?.name || m.userId?.firstName || "";
      const email = m.email || m.userId?.email || "";
      const phone = m.phone || m.userId?.mobile || "";
      const centralId = m.centralMembershipId || "";
      const stateId = m.stateMembershipId || "";
      
      const matchesSearch = 
        name.toLowerCase().includes(searchLower) ||
        email.toLowerCase().includes(searchLower) ||
        phone.toLowerCase().includes(searchLower) ||
        centralId.toLowerCase().includes(searchLower) ||
        stateId.toLowerCase().includes(searchLower);
        
      const matchesStatus = statusFilter === "All" || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [membershipsList, searchTerm, statusFilter]);

  const table = useReactTable({
    data: filteredMemberships,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  });

  const exportToCSV = () => {
    if (membershipsList.length === 0) return;
    const headers = ["Name", "Email", "Phone", "Central ID", "State ID", "Amount", "Payment Status", "Status"];
    const csvContent = [
      headers.join(","),
      ...membershipsList.map((m: any) => {
        const name = m.name || m.userId?.name || m.userId?.firstName || "";
        const email = m.email || m.userId?.email || "";
        const phone = m.phone || m.userId?.mobile || "";
        return `"${name}","${email}","${phone}","${m.centralMembershipId || ''}","${m.stateMembershipId || ''}",${m.amount},"${m.paymentStatus || ''}","${m.status || ''}"`;
      }),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Memberships_Export_${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalItems = filteredMemberships.length;
  const start = pagination.pageIndex * pagination.pageSize + 1;
  const end = Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalItems);

  return (
    <>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Membership Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMembership && (
            <div className="row">
              <div className="col-md-6 mb-3">
                <strong>Name:</strong> {selectedMembership.name || selectedMembership.userId?.name || selectedMembership.userId?.firstName || '-'}
              </div>
              <div className="col-md-6 mb-3">
                <strong>Email:</strong> {selectedMembership.email || selectedMembership.userId?.email || '-'}
              </div>
              <div className="col-md-6 mb-3">
                <strong>Phone:</strong> {selectedMembership.phone || selectedMembership.userId?.mobile || '-'}
              </div>
              <div className="col-md-6 mb-3">
                <strong>Gender:</strong> {selectedMembership.gender || '-'}
              </div>
              <div className="col-md-6 mb-3">
                <strong>Central ID:</strong> {selectedMembership.centralMembershipId || '-'}
              </div>
              <div className="col-md-6 mb-3">
                <strong>State ID:</strong> {selectedMembership.stateMembershipId || '-'}
              </div>
              <div className="col-md-6 mb-3">
                <strong>Amount:</strong> ₹{selectedMembership.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
              </div>
              <div className="col-md-6 mb-3">
                <strong>Payment Status:</strong> {selectedMembership.paymentStatus || '-'}
              </div>
              <div className="col-md-6 mb-3">
                <strong>Status:</strong> {selectedMembership.status || '-'}
              </div>
              {(selectedMembership.status === 'Rejected' || selectedMembership.status === 'Suspended') && selectedMembership.rejectReason && (
                <div className="col-md-12 mb-3">
                  <strong>Reason:</strong> <span className={selectedMembership.status === 'Rejected' ? 'text-danger' : 'text-warning'}>{selectedMembership.rejectReason}</span>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      <Card className="shadow-sm border-0">
        <div className="p-3 border-bottom">
        <h5 className="mb-1 fw-bold">Manage Memberships</h5>
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
                <Dropdown.Item active={statusFilter === "All"} onClick={() => setStatusFilter("All")}>All Statuses</Dropdown.Item>
                <Dropdown.Item active={statusFilter === "Approved"} onClick={() => setStatusFilter("Approved")}>Approved</Dropdown.Item>
                <Dropdown.Item active={statusFilter === "Pending"} onClick={() => setStatusFilter("Pending")}>Pending</Dropdown.Item>
                <Dropdown.Item active={statusFilter === "Rejected"} onClick={() => setStatusFilter("Rejected")}>Rejected</Dropdown.Item>
                <Dropdown.Item active={statusFilter === "Suspended"} onClick={() => setStatusFilter("Suspended")}>Suspended</Dropdown.Item>
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

            <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-export">Export to CSV</Tooltip>}>
              <Button variant="light" size="sm" onClick={exportToCSV} className="d-flex align-items-center gap-1">
                <Icon icon="download" className="fs-sm" /> Export
              </Button>
            </OverlayTrigger>

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
              >
                <Icon icon="rotate-ccw" className="fs-sm" />
              </Button>
            </OverlayTrigger>
          </div>
      </CardHeader>
      <CardBody className="p-0">
        {error && (
          <Alert variant="danger" className="m-3 border-0">
            {error}
          </Alert>
        )}
        <div className="table-responsive">
          <DataTable<any> table={table} isLoading={loading} emptyMessage="No memberships found" />
        </div>
      </CardBody>
      {totalItems > 0 && (
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
            itemsName="memberships"
          />
        </CardFooter>
      )}
    </Card>
    </>
  );
};

export default MembershipListContent;
