import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import AttendeeListContent from "./components/AttendeeListContent";
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata: Metadata = { title: "Attendees List" };

const Page = () => {
  return (
    <ProtectedRoute moduleName="Attendees">
      <PageBreadcrumb title="Attendees" subtitle="Attendees Management" />
      <Row>
        <Col xs={12}>
          <AttendeeListContent />
        </Col>
      </Row>
    </ProtectedRoute>
  );
};

export default Page;
