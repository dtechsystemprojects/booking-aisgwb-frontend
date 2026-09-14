"use client";
import DataTable from "@/components/table/DataTable";
import TablePagination from "@/components/table/TablePagination";
import Icon from "@/components/wrappers/Icon";
import { Icon as IconifyIcon } from "@iconify/react";
import { useReactTable } from "@tanstack/react-table";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/table-core";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "react-bootstrap";
import { orderData, OrderType } from "./data";

const columnHelper = createColumnHelper<OrderType>();

const RecentOrders = () => {
  const [data] = useState<OrderType[]>(orderData);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 7,
  });

  const columns = [
    columnHelper.accessor("userImage", {
      header: "",
      cell: ({ row }) => (
        <div className="d-flex align-items-center">
          <Image
            src={row.original.userImage}
            className="avatar-sm rounded-circle me-2"
            alt={row.original.userName}
          />
          <div>
            <span className="text-muted fs-xs">{row.original.userName}</span>

            <h5 className="fs-base mb-0">
              <Link href="/orders/1" className="text-body">
                #{row.original.id}
              </Link>
            </h5>
          </div>
        </div>
      ),
      enableSorting: false,
    }),

    columnHelper.accessor("userName", {
      header: "userName",
      cell: ({ row }) => (
        <>
          <span className="text-muted fs-xs">Product</span>
          <h5 className="fs-base mb-0 fw-normal">{row.original.product}</h5>
        </>
      ),
    }),

    columnHelper.accessor("date", {
      header: "Date",
      cell: ({ row }) => (
        <>
          <span className="text-muted fs-xs">Date</span>
          <h5 className="fs-base mb-0 fw-normal">{row.original.date}</h5>
        </>
      ),
    }),

    columnHelper.accessor("amount", {
      header: "Amount",
      cell: ({ row }) => (
        <>
          <span className="text-muted fs-xs">Amount</span>
          <h5 className="fs-base mb-0 fw-normal">{row.original.amount}</h5>
        </>
      ),
    }),

    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ row }) => (
        <>
          <span className="text-muted fs-xs ">Status</span>
          <h5 className="fs-base mb-0 fw-normal">
            <IconifyIcon
              icon="tabler:circle-filled"
              className={`fs-xs text-${row.original.statusVariant}`}
            />{" "}
            {row.original.status}
          </h5>
        </>
      ),
    }),

    {
      id: "actions",
      header: "",
      cell: () => (
        <Dropdown>
          <DropdownToggle
            as="div"
            className="text-muted drop-arrow-none card-drop p-0 cursor-pointer"
          >
            <Icon icon="ellipsis-vertical" className="fs-lg" />
          </DropdownToggle>
          <DropdownMenu align="end">
            <DropdownItem>View Details</DropdownItem>
            <DropdownItem>Cancel Order</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalItems = table.getFilteredRowModel().rows.length;

  const start = pageIndex * pageSize + 1;
  const end = Math.min(start + pageSize - 1, totalItems);

  return (
    <Card>
      <CardHeader className="justify-content-between align-items-center border-dashed">
        <CardTitle as="h4" className="mb-0">
          Recent Orders
        </CardTitle>
        <div className="d-flex gap-2">
          <Button href="" variant="soft-secondary" size="sm">
            <IconifyIcon icon="tabler:plus" className="me-1" /> Add Order
          </Button>
          <Button href="" variant="primary" size="sm">
            <IconifyIcon icon="tabler:file-export" className="me-1" /> Export
            CSV
          </Button>
        </div>
      </CardHeader>
      <DataTable<OrderType>
        table={table}
        emptyMessage="No products found"
        className="table-centered table-hover"
        showHeaders={false}
      />
      <CardFooter className="border-0">
        <TablePagination
          totalItems={totalItems}
          start={start}
          end={end}
          itemsName="orders"
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
    </Card>
  );
};

export default RecentOrders;
