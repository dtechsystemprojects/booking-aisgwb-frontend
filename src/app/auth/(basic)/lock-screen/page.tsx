import authcard from "@/assets/images/auth-card-bg.svg";
import user1 from "@/assets/images/users/user-1.jpg";
import AuthLogo from "@/components/AuthLogo";
import { currentYear, META_DATA } from "@/config/constants";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Card, Col, Container, Row } from "react-bootstrap";
import Forms from "./components/Forms";

export const metadata: Metadata = { title: "Lock Screen" };

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
                <div className="text-center mb-4">
                  <Image
                    src={user1}
                    className="rounded-circle img-thumbnail avatar-xxl mb-2"
                    alt="thumbnail"
                  />
                  <h5 className="fs-md">{META_DATA.username}</h5>
                </div>
                <Forms />
                <p className="text-muted text-center mt-4 mb-0">
                  Not you? Return to&nbsp;
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
