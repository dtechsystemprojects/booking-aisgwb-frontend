"use client";

import { flexRender, type Table as TableType } from "@tanstack/react-table";
import clsx from "clsx";
import { Table, Spinner } from "react-bootstrap";
import Icon from "../wrappers/Icon";

type DataTableProps<TData> = {
  /**
   * The table instance from useReactTable
   */
  table: TableType<TData>;
  /**
   * Optional class name for the table container
   */
  className?: string;
  /**
   * Optional message to display when no data is available
   * @default 'Nothing found.'
   */
  emptyMessage?: React.ReactNode;

  /**
   * Optional boolean to display headers
   * @default true
   */
  showHeaders?: boolean;
  /**
   * Optional boolean to indicate loading state
   * @default false
   */
  isLoading?: boolean;
};

const DataTable = <TData,>({
  table,
  className = "",
  emptyMessage = "Nothing found.",
  showHeaders = true,
  isLoading = false,
}: DataTableProps<TData>) => {
  const columns = table.getAllColumns();

  return (
    <div className={clsx("table-responsive", className)}>
      <Table
        hover
        className="table table-custom table-centered table-select w-100 mb-0"
      >
        {showHeaders && (
          <thead className="bg-light align-middle bg-opacity-25 thead-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="text-uppercase fs-xxs">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      cursor: header.column.getCanSort()
                        ? "pointer"
                        : "default",
                      userSelect: "none",
                    }}
                  >
                    <div className="d-flex align-items-center">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getCanSort() &&
                        ({
                          asc: <Icon icon="arrow-up" className="ms-1" />,
                          desc: <Icon icon="arrow-down" className="ms-1" />,
                        }[header.column.getIsSorted() as string] ??
                          null)}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
        )}
        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-4 text-muted"
              >
                <Spinner animation="border" size="sm" className="me-2 mb-1" /> Loading...
              </td>
            </tr>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td suppressHydrationWarning key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-3 text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default DataTable;
