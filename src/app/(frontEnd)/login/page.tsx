import { currentYear, META_DATA } from "@/config/constants";
import { Metadata } from "next";
import Link from "next/link";
import { Card, Col, Container, Row } from "react-bootstrap";
import LoginForm from "./components/Form";
import Header from "../common/Header";
import Footer from "../common/Footer";
import FrontendProtectedRoute from "@/components/FrontendProtectedRoute";

export const metadata: Metadata = { title: "Sign In" };

const Page = () => {
  return (
    <>
      <FrontendProtectedRoute requireAuth={false}>
      <Header />
      <div className="auth-box overflow-hidden align-items-center d-flex">
        <Container>
          <Row className="justify-content-center">
            <Col xxl={4} md={6} sm={8}>
              <Card className="p-4">
                <div className="auth-brand text-center mb-4">
                  <h3 className="fw-bold fs-24">Sign In</h3>
                  <p className="text-muted w-lg-75 mx-auto mt-3">
                    Welcome back! Please enter your details to sign in.
                  </p>
                </div>
                <LoginForm />
                <p className="text-muted text-center mt-4 mb-0">
                  Not a member yet?&nbsp;
                  <Link
                    href="/register"
                    className="text-decoration-underline link-offset-3 fw-semibold"
                  >
                    Register now
                  </Link>
                </p>
              </Card>
              <p className="text-center text-muted mt-4 mb-0">
                © {currentYear} {META_DATA.name} — by{" "}
                <span className="fw-semibold">{META_DATA.author}</span>
              </p>
            </Col>
          </Row>
        </Container>
      </div>
      <Footer />
      </FrontendProtectedRoute>
    </>
  );
};

export default Page;
