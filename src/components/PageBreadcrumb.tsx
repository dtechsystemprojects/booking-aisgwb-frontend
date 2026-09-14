import Icon from "@/components/wrappers/Icon";
import Link from "next/link";

type PageBreadcrumbProps = {
  title: string;
  subtitle?: string;
};

const PageBreadcrumb = ({ title, subtitle }: PageBreadcrumbProps) => {
  return (
    <div className="page-title-head d-flex align-items-center">
      <div className="flex-grow-1">
        {/* <h4 className="page-main-title m-0">{title}</h4> */}
      </div>
      <div className="text-end">
        <ol className="breadcrumb m-0 py-0">
          <li className="breadcrumb-item">
            <Link
              href="/admin/dashboard"
              className="d-flex align-items-center gap-1"
            >
              <Icon icon="home" className="fs-14" /> Home
            </Link>
          </li>
          {subtitle && (
            <li className="breadcrumb-item">
              <span>{subtitle}</span>
            </li>
          )}
          <li className="breadcrumb-item active">{title}</li>
        </ol>
      </div>
    </div>
  );
};

export default PageBreadcrumb;
