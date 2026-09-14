import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import PermissionTable from "./components/PermissionTable";
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata: Metadata = { title: "User Permissions" };

const Page = () => {
  return (
    <ProtectedRoute moduleName="Permissions">
      <PageBreadcrumb title="Permissions" subtitle="Groups" />
      <Row className="justify-content-center">
        <Col xs={12}>
          <PermissionTable />
        </Col>
      </Row>
    </ProtectedRoute>
  );
};

export default Page;
