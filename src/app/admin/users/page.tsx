import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import UserListContent from "./components/UserListContent";
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata: Metadata = { title: "User List" };

const Page = () => {
  return (
    <ProtectedRoute moduleName="Users">
      <PageBreadcrumb title="User List" subtitle="User Management" />
      <Row>
        <Col xs={12}>
          <UserListContent />
        </Col>
      </Row>
    </ProtectedRoute>
  );
};

export default Page;
