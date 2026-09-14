import profile from "@/assets/images/profile-bg.jpg";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Metadata } from "next";
import { Card, Col, Row } from "react-bootstrap";
import Account from "./components/Account";
import ProfileCard from "./components/ProfileCard";
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata: Metadata = { title: "Profile" };

const Page = () => {
  return (
    <ProtectedRoute moduleName="Users">
      <PageBreadcrumb title="Profile" subtitle="Users" />
      <Row>
        <Col xs={12}>
          <Card className="overflow-hidden mb-0">
            <div
              className="position-relative card-side-img overflow-hidden"
              style={{ minHeight: 300, backgroundImage: `url(${profile.src})` }}
            >
              <div className="p-4 card-img-overlay rounded-start-0 auth-overlay d-flex align-items-center flex-column justify-content-center">
                <h3 className="text-white mb-1 fst-italic">
                  &quot;Crafting innovation through clean design&quot;
                </h3>
                <p className="text-white mb-4">– MyStatus</p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      <div className="px-3 mt-n4">
        <Row>
          <Col xl={4}>
            <ProfileCard />
          </Col>
          <Col xl={8}>
            <Account />
          </Col>
        </Row>
      </div>
    </ProtectedRoute>
  );
};

export default Page;
