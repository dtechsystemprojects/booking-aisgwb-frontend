import authcard from "@/assets/images/auth-card-bg.svg";
import AuthLogo from "@/components/AuthLogo";
import { currentYear, META_DATA } from "@/config/constants";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Card, Col, Container, Row } from "react-bootstrap";
import Forms from "./components/Forms";

export const metadata: Metadata = { title: "New Password" };

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
                <div className="auth-brand text-center mb-4">
                  <AuthLogo />
                  <p className="text-muted w-lg-75 mx-auto mt-3">
                    We&apos;ve emailed you a 6-digit verification code. Please
                    enter it below to confirm your email address
                  </p>
                </div>
                <Forms />
                <p className="mt-4 text-muted text-center mb-4">
                  Don&apos;t have a code?&nbsp;
                  <Link
                    href=""
                    className="text-decoration-underline link-offset-2 fw-semibold"
                  >
                    Resend
                  </Link>
                  &nbsp;or&nbsp;
                  <Link
                    href=""
                    className="text-decoration-underline link-offset-2 fw-semibold"
                  >
                    Call Us
                  </Link>
                </p>
                <p className="text-muted text-center mb-0">
                  Return to&nbsp;
                  <Link
                    href="/auth/sign-in"
                    className="text-decoration-underline link-offset-3 fw-semibold"
                  >
                    Sign in
                  </Link>
                </p>
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
