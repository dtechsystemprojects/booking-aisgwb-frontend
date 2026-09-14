import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import TransactionListContent from "./components/TransactionListContent";
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata: Metadata = { title: "Transactions List" };

const Page = () => {
  return (
    <ProtectedRoute moduleName="Transactions">
      <PageBreadcrumb title="Transactions" subtitle="Transactions Management" />
      <Row>
        <Col xs={12}>
          <TransactionListContent />
        </Col>
      </Row>
    </ProtectedRoute>
  );
};

export default Page;
