"use client";
import clsx from "clsx";
import { Col, Row } from "react-bootstrap";
import Icon from "../wrappers/Icon";

export type TablePaginationProps = {
  totalItems: number;
  start: number;
  end: number;
  itemsName?: string;
  showInfo?: boolean;
  // Pagination control props
  previousPage: () => void;
  canPreviousPage: boolean;
  pageCount: number;
  pageIndex: number;
  setPageIndex: (index: number) => void;
  nextPage: () => void;
  canNextPage: boolean;
};

const TablePagination = ({
  totalItems,
  start,
  end,
  itemsName = "items",
  showInfo,
  previousPage,
  canPreviousPage,
  pageCount,
  pageIndex,
  setPageIndex,
  nextPage,
  canNextPage,
}: TablePaginationProps) => {
  return (
    <Row
      className={clsx(
        "align-items-center text-center text-sm-start",
        showInfo ? "justify-content-between" : "justify-content-end",
      )}
    >
      {showInfo && (
        <Col sm>
          <div className="text-muted">
            Showing <span className="fw-semibold">{start}</span> to{" "}
            <span className="fw-semibold">{end}</span> of{" "}
            <span className="fw-semibold">{totalItems}</span> {itemsName}
          </div>
        </Col>
      )}
      <Col sm="auto" className="mt-3 mt-sm-0">
        <div>
          <ul className="pagination pagination-sm pagination-boxed pagination-rounded mb-0 justify-content-center">
            <li className="page-item">
              <button
                className="page-link"
                onClick={() => setPageIndex(0)}
                disabled={pageIndex === 0}
              >
                <Icon icon="chevron-first" />
              </button>
            </li>
            <li className="page-item">
              <button
                className="page-link"
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
              >
                <Icon icon="chevron-left" />
              </button>
            </li>

            {Array.from({ length: pageCount }).map((_, index) => {
              // Show a sliding window of 3 pages (e.g., active page and its neighbors)
              // or just keep the original behavior if you want all pages.
              // Adding logic to match exactly '1 2 3' if page is large:
              if (
                pageCount > 5 &&
                index !== 0 &&
                index !== pageCount - 1 &&
                Math.abs(pageIndex - index) > 1
              ) {
                if (index === 1 && pageIndex > 2) return <li key={index} className="page-item disabled"><span className="page-link">...</span></li>;
                if (index === pageCount - 2 && pageIndex < pageCount - 3) return <li key={index} className="page-item disabled"><span className="page-link">...</span></li>;
                return null;
              }

              return (
                <li
                  key={index}
                  className={`page-item ${pageIndex === index ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setPageIndex(index)}
                  >
                    {index + 1}
                  </button>
                </li>
              );
            })}

            <li className="page-item">
              <button
                className="page-link"
                onClick={() => nextPage()}
                disabled={!canNextPage}
              >
                <Icon icon="chevron-right" />
              </button>
            </li>
            <li className="page-item">
              <button
                className="page-link"
                onClick={() => setPageIndex(pageCount > 0 ? pageCount - 1 : 0)}
                disabled={pageCount === 0 || pageIndex === pageCount - 1}
              >
                <Icon icon="chevron-last" />
              </button>
            </li>
          </ul>
        </div>
      </Col>
    </Row>
  );
};

export default TablePagination;
