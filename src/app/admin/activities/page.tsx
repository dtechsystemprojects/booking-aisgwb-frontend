import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import ActivityListContent from "./components/ActivityListContent";
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata: Metadata = { title: "Activity Logs" };

const Page = () => {
  return (
    <ProtectedRoute moduleName="Activities">
      <PageBreadcrumb title="Activity Logs" subtitle="Admin Logs" />
      <Row>
        <Col xs={12}>
          <ActivityListContent />
        </Col>
      </Row>
    </ProtectedRoute>
  );
};

export default Page;
