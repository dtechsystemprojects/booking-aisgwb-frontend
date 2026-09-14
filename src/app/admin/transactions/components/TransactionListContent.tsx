"use client";
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
  Table as TableType,
  useReactTable,
} from "@tanstack/react-table";
import React, { useMemo, useEffect, useState } from "react";
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
  fetchTransactions,
  Transaction
} from "@/redux/slices/admin/transactionSlice";
import dayjs from "dayjs";
import TransactionDetailsModal from "./TransactionDetailsModal";

const TransactionListContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { transactions, loading, error } = useAppSelector((state) => state.transactions);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  const columnHelper = createColumnHelper<Transaction>();

  const columns: ColumnDef<Transaction, any>[] = useMemo(
    () => [
      columnHelper.accessor("transactionRef", {
        header: "Transaction Ref",
        cell: (info) => (
          <div>
            <div className="fw-bold text-dark">{info.getValue() || 'Manual'}</div>
            <div className="text-muted small">{dayjs(info.row.original.createdAt).format("MMM DD, YYYY hh:mm A")}</div>
          </div>
        ),
      }),
      columnHelper.accessor((row) => row.userId, {
        id: "user",
        header: "User",
        cell: (info) => {
          const user = info.getValue();
          if (!user) return "-";
          return (
            <div>
              <div className="fw-medium">{user.name || user.firstName || "Unknown User"}</div>
              <div className="text-muted small">{user.email}</div>
            </div>
          );
        },
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => {
          const type = info.getValue();
          if (!type) return "-";
          let color = "primary";
          if (type === "MEMBERSHIP") color = "info";
          return (
            <Badge bg={color} className="rounded-pill px-2 py-1 fw-medium text-capitalize">
              {type.toLowerCase()}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("paymentMethod", {
        header: "Method",
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
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          let color = "secondary";
          if (status === "Success") color = "success";
          if (status === "Pending") color = "warning";
          if (status === "Failed") color = "danger";
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
        cell: (info) => (
          <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${info.row.id}`}>View Details</Tooltip>}>
            <Button variant="light" size="sm" className="btn-icon" onClick={() => {
              setSelectedTransaction(info.row.original);
              setShowModal(true);
            }}>
              <Icon icon="eye" className="fs-16" />
            </Button>
          </OverlayTrigger>
        ),
      }),
    ],
    []
  );

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        t.transactionRef?.toLowerCase().includes(searchLower) ||
        t.userId?.name?.toLowerCase().includes(searchLower) ||
        t.userId?.email?.toLowerCase().includes(searchLower) ||
        t.eventId?.title?.toLowerCase().includes(searchLower);
        
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      const matchesType = typeFilter === "All" || t.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [transactions, searchTerm, statusFilter, typeFilter]);

  const table = useReactTable({
    data: filteredTransactions,
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
    if (transactions.length === 0) return;
    const headers = ["Ref", "User", "Email", "Event", "Type", "Method", "Amount", "Status", "Date"];
    const csvContent = [
      headers.join(","),
      ...transactions.map((t) => {
        return `"${t.transactionRef || ''}","${t.userId?.name || t.userId?.firstName || ''} ${t.userId?.lastName || ''}","${t.userId?.email || ''}","${t.eventId?.title || ''}","${t.type || ''}","${t.paymentMethod || ''}",${t.amount},"${t.status || ''}","${dayjs(t.createdAt).format("YYYY-MM-DD")}"`;
      }),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Transactions_Export_${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalItems = filteredTransactions.length;
  const start = pagination.pageIndex * pagination.pageSize + 1;
  const end = Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalItems);

  return (
    <Card className="shadow-sm border-0">
      <div className="p-3 border-bottom">
        <h5 className="mb-1 fw-bold">Manage Transactions</h5>
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
                <Dropdown.Item active={statusFilter === "Success"} onClick={() => setStatusFilter("Success")}>Success</Dropdown.Item>
                <Dropdown.Item active={statusFilter === "Pending"} onClick={() => setStatusFilter("Pending")}>Pending</Dropdown.Item>
                <Dropdown.Item active={statusFilter === "Failed"} onClick={() => setStatusFilter("Failed")}>Failed</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Dropdown className="d-inline-block ms-2">
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
                <Dropdown.Item active={typeFilter === "All"} onClick={() => setTypeFilter("All")}>All Types</Dropdown.Item>
                <Dropdown.Item active={typeFilter === "EVENT"} onClick={() => setTypeFilter("EVENT")}>Event</Dropdown.Item>
                <Dropdown.Item active={typeFilter === "MEMBERSHIP"} onClick={() => setTypeFilter("MEMBERSHIP")}>Membership</Dropdown.Item>
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
                  setTypeFilter("All");
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
          <DataTable<Transaction> table={table} isLoading={loading} />
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
          itemsName="transactions"
        />
      </CardFooter>
      <TransactionDetailsModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />
    </Card>
  );
};

export default TransactionListContent;
