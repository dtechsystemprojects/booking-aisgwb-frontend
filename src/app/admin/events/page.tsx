import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import EventListContent from "./components/EventListContent";
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata: Metadata = { title: "Event List" };

const Page = () => {
  return (
    <ProtectedRoute moduleName="Events">
      <PageBreadcrumb title="Event List" subtitle="Event Management" />
      <Row>
        <Col xs={12}>
          <EventListContent />
        </Col>
      </Row>
    </ProtectedRoute>
  );
};

export default Page;
