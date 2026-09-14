import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import BookingWizard from "../components/BookingWizard";
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata: Metadata = { title: "Create Booking" };

const Page = () => {
  return (
    <ProtectedRoute moduleName="Bookings">
      <PageBreadcrumb title="Add New" subtitle="Bookings Management" />
      <Row>
        <Col xs={12}>
          <BookingWizard />
        </Col>
      </Row>
    </ProtectedRoute>
  );
};

export default Page;
