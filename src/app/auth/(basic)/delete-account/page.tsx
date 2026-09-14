import authcard from "@/assets/images/auth-card-bg.svg";
import deleteImg from "@/assets/images/delete.png";
import AuthLogo from "@/components/AuthLogo";
import { currentYear, META_DATA } from "@/config/constants";
import { Metadata } from "next";
import Image from "next/image";
import { Button, Card, Col, Container, Row } from "react-bootstrap";

export const metadata: Metadata = { title: "Delete Account" };

const Page = () => {
  return (
    <>
      <div className="auth-box overflow-hidden align-items-center d-flex">
        <Container>
          <Row className="justify-content-center">
            <Col xxl={4} md={6} sm={8}>
              <Card className="p-4">
                <div
                  className="position-absolute top-0 end-0"
                  style={{ width: "180px" }}
                >
                  <Image
                    src={authcard}
                    className="auth-card-bg-img"
                    alt="auth-card-bg"
                  />
                </div>
                <div className="auth-brand text-center mb-3 position-relative">
                  <AuthLogo />
                </div>
                <div className="mb-4">
                  <div className="avatar-xxl mx-auto mt-2">
                    <div className="avatar-title bg-light-subtle border border-light border-dashed rounded-circle">
                      <Image src={deleteImg} alt="dark logo" height={64} />
                    </div>
                  </div>
                </div>
                <h4 className="fw-bold text-center mb-3">
                  Account Deactivated
                </h4>
                <p className="text-muted text-center mb-4">
                  Your account is currently inactive. Reactivate now to regain
                  access to all features and opportunities.
                </p>
                <div className="d-grid">
                  <Button
                    variant="primary"
                    type="submit"
                    className="fw-semibold py-2"
                  >
                    Reactivate Now
                  </Button>
                </div>
              </Card>
              <p className="text-center text-muted mt-4 mb-0">
                © {currentYear} {META_DATA.name} — by
                <span className="fw-semibold">&nbsp;{META_DATA.author}</span>
              </p>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Page;
