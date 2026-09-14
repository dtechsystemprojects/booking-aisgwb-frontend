"use client";
import Rating from "@/components/Rating";
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
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "react-bootstrap";
import { productData, ProductType } from "./data";

const columnHelper = createColumnHelper<ProductType>();

const ProductInventory = () => {
  const [data] = useState<ProductType[]>(productData);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 7,
  });

  const columns = [
    columnHelper.accessor("image", {
      header: "",
      cell: ({ row }) => (
        <>
          <div className="d-flex align-items-center">
            <Image
              src={row.original.image}
              className="avatar-sm rounded-circle me-2"
              alt={row.original.name}
            />
            <div>
              <span className="text-muted fs-xs">{row.original.category}</span>

              <h5 className="fs-base mb-0">
                <Link href="/apps/ecommerce/product-add" className="text-body">
                  {row.original.name}
                </Link>
              </h5>
            </div>
          </div>
        </>
      ),
    }),

    columnHelper.accessor("name", {
      header: "Product",
      cell: ({ row }) => (
        <>
          <span className="text-muted fs-xs">Stock</span>
          <h5 className="fs-base mb-0 fw-normal">{row.original.stock}</h5>
        </>
      ),
    }),

    columnHelper.accessor("price", {
      header: "Price",
      cell: ({ row }) => (
        <>
          <span className="text-muted fs-xs">Price</span>
          <h5 className="fs-base mb-0 fw-normal">{row.original.price}</h5>
        </>
      ),
    }),

    columnHelper.accessor("ratings", {
      header: "Quantity",
      cell: ({ row }) => (
        <>
          <span className="text-muted fs-xs">Ratings</span>
          <h5 className="fs-base mb-0 fw-normal">
            <Rating
              rating={row.original.ratings}
              className={"d-inline-flex align-items-center gap-1"}
            />
            <span className="ms-1">
              <Link
                href="/apps/ecommerce/reviews"
                className="link-reset fw-semibold"
              >
                ({row.original.reviews})
              </Link>
            </span>
          </h5>
        </>
      ),
    }),

    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ row }) => (
        <>
          <span className="text-muted fs-xs">Status</span>
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
          Product Inventory
        </CardTitle>
        <div className="d-flex gap-2">
          <Link href="/apps/ecommerce/product-add" passHref>
            <Button variant="soft-secondary" size="sm">
              <IconifyIcon icon="tabler:plus" className="me-1" /> Add Product
            </Button>
          </Link>
          <Button href="" variant="primary" size="sm">
            <IconifyIcon icon="tabler:file-export" className="me-1" /> Export
            CSV
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        <DataTable<ProductType>
          table={table}
          emptyMessage="No products found"
          className=" table-centered table-custom table-sm table-nowrap table-hover mb-0"
          showHeaders={false}
        />
      </CardBody>
      <CardFooter className="border-0">
        <TablePagination
          totalItems={totalItems}
          start={start}
          end={end}
          itemsName="products"
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

export default ProductInventory;
