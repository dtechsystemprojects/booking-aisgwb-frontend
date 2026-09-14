import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import BookingListContent from "./components/BookingListContent";
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata: Metadata = { title: "Bookings List" };

const Page = () => {
  return (
    <ProtectedRoute moduleName="Bookings">
      <PageBreadcrumb title="Bookings" subtitle="Bookings Management" />
      <Row>
        <Col xs={12}>
          <BookingListContent />
        </Col>
      </Row>
    </ProtectedRoute>
  );
};

export default Page;
