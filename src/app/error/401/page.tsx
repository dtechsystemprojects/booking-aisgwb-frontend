import AuthImage from "@/assets/images/auth-card-bg.svg";
import AuthLogo from "@/components/AuthLogo";
import { currentYear, META_DATA } from "@/config/constants";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Card, Col, Container, Row } from "react-bootstrap";

export const metadata: Metadata = { title: "401 Error" };

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
                    src={AuthImage}
                    className="auth-card-bg-img"
                    alt="auth-card-bg"
                  />
                </div>
                <div className="auth-brand text-center mb-2">
                  <AuthLogo />
                </div>
                <div className="p-2 text-center">
                  <div className="error-text-alt fs-72">401</div>
                  <h3 className="fw-bold text-uppercase">Unauthorized</h3>
                  <p className="text-muted">
                    You are not authorized to access this page.
                  </p>
                  <Link className="btn btn-primary mt-3 rounded-pill" href="/">
                    Go Home
                  </Link>
                </div>
              </Card>
              <p className="text-center text-muted mt-4 mb-0">
                © {currentYear} {META_DATA.name} — by{" "}
                <span className="fw-semibold">{META_DATA.author}</span>
              </p>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Page;
