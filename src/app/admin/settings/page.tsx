import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import WebsiteSettingsContent from "./components/WebsiteSettingsContent";
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata: Metadata = {
  title: "Website Settings",
};

const SettingsPage = () => {
  return (
    <ProtectedRoute moduleName="Settings">
      <PageBreadcrumb title="Settings" subtitle="Website Configuration" />

      <Row>
        <Col xs={12}>
          <WebsiteSettingsContent />
        </Col>
      </Row>
    </ProtectedRoute>
  );
};

export default SettingsPage;
