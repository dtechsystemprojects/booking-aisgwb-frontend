"use client";
import AuthImage from "@/assets/images/auth-card-bg.svg";
import maintenanceImg from "@/assets/images/maintenance.svg";
import AuthLogo from "@/components/AuthLogo";
import { currentYear, META_DATA } from "@/config/constants";
import { useSettingsContext } from "@/context/useSettingsContext";
import Image from "next/image";
import Link from "next/link";
import { Button, Card, CardBody, Col, Container, Row } from "react-bootstrap";

const Page = () => {
  const { setting } = useSettingsContext();

  return (
    <>
      <div className="auth-box d-flex align-items-center">
        <Container fluid="xxl">
          <Row className="align-items-center justify-content-center">
            <Col xl={6}>
              <Card className="mb-0 shadow-lg border-0">
                <div
                  className="position-absolute top-0 end-0"
                  style={{ width: "280px" }}
                >
                  <Image
                    src={AuthImage}
                    className="auth-card-bg-img"
                    alt="auth-card-bg"
                  />
                </div>
                <CardBody className="p-4 p-md-5">
                  <div className="auth-brand text-center mb-0">
                    <AuthLogo />
                  </div>
                  <div className="p-2 text-center">
                    <div className="w-md-50 mx-auto my-3">
                      <Image
                        src={maintenanceImg}
                        alt="Maintenance"
                        className="img-fluid"
                      />
                    </div>
                    <h3 className="fw-bold text-uppercase mt-2">
                      {setting("general.title")} Under Maintenance
                    </h3>
                    <p className="text-muted fs-15">
                      We’re currently performing scheduled system updates and
                      maintenance.
                      <br />
                      Please check back shortly.
                    </p>
                    <div className="d-flex align-items-center justify-content-center gap-2 mt-3">
                      <Button variant="primary" className="px-4 fw-semibold">
                        Call Support
                      </Button>
                      <Button
                        variant="info"
                        className="px-4 fw-semibold text-white"
                      >
                        Email Us
                      </Button>
                    </div>
                    <div className="mt-4 pt-3 border-top border-light-subtle">
                      <Link
                        href="/auth/sign-in"
                        className="btn btn-outline-dark btn-sm rounded-pill px-3 py-1 fs-12 fw-semibold"
                      >
                        Sign In as Administrator →
                      </Link>
                    </div>
                  </div>
                  <p className="text-center text-muted mt-4 mb-0 fs-13">
                    © {currentYear} {setting("general.title")} — by{" "}
                    <span className="fw-semibold">{META_DATA.author}</span>
                  </p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Page;
