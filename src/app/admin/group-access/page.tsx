import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import GroupAccessContent from "./components/GroupAccessContent";
import { Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata: Metadata = {
  title: "Group Access Policy & Permissions",
};

const Page = () => {
  return (
    <ProtectedRoute moduleName="Group Access">
      <PageBreadcrumb title="Access" subtitle="Groups" />

      <Row>
        <Col xs={12}>
          <Suspense fallback={<div>Loading...</div>}>
            <GroupAccessContent />
          </Suspense>
        </Col>
      </Row>
    </ProtectedRoute>
  );
};

export default Page;
