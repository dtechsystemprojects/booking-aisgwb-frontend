import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Metadata } from "next";
import { Col, Row, Spinner } from "react-bootstrap";
import ScannerContent from "./components/ScannerContent";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Ticket Scanner" };

const Page = () => {
  return (
    <ProtectedRoute moduleName="Attendees">
      <PageBreadcrumb title="Ticket Scanner" subtitle="Verify and update ticket status" />
      <Row className="justify-content-center mt-4">
        <Col xs={12} md={10} lg={8}>
          <Suspense fallback={<div className="text-center p-5"><Spinner animation="border" /></div>}>
            <ScannerContent />
          </Suspense>
        </Col>
      </Row>
    </ProtectedRoute>
  );
};

export default Page;
