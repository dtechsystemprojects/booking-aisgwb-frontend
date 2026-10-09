import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import ProfileForm from "./components/ProfileForm";
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata: Metadata = { title: "Edit Profile" };

const Page = () => {
  return (
    <ProtectedRoute moduleName="Users">
      <PageBreadcrumb title="Edit Profile" subtitle="Users" />
      <div className="px-3">
        <Row className="justify-content-center">
          <Col xl={12} lg={12}>
            <ProfileForm />
          </Col>
        </Row>
      </div>
    </ProtectedRoute>
  );
};

export default Page;
