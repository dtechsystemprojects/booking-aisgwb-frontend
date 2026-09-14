import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import GroupListContent from "./components/GroupListContent";
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata: Metadata = { title: "Groups | Admin" };

const Page = () => {
  return (
    <ProtectedRoute moduleName="Groups">
      <PageBreadcrumb title="Groups" subtitle="Manage Groups" />
      <Row>
        <Col xs={12}>
          <GroupListContent />
        </Col>
      </Row>
    </ProtectedRoute>
  );
};

export default Page;
