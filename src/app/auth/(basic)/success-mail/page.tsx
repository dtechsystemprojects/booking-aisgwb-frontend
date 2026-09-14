import authcard from "@/assets/images/auth-card-bg.svg";
import icon from "@/assets/images/checkmark.png";
import AuthLogo from "@/components/AuthLogo";
import { currentYear, META_DATA } from "@/config/constants";
import { Metadata } from "next";
import Image from "next/image";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";

export const metadata: Metadata = { title: "Success Mail" };

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
                <div className="auth-brand text-center mb-3">
                  <AuthLogo />
                  <p className="text-muted w-lg-75 mt-3 mx-auto">
                    Awesome! You&apos;ve read the important message like a pro.
                  </p>
                </div>
                <Form>
                  <div className="mb-4">
                    <div className="avatar-xxl mx-auto mt-2">
                      <div className="avatar-title bg-light-subtle border border-light border-dashed rounded-circle">
                        <Image src={icon} alt="dark logo" height={64} />
                      </div>
                    </div>
                  </div>
                  <h4 className="fw-bold text-center mb-4">
                    Well Done! Email verified Successfully
                  </h4>
                  <div className="d-grid">
                    <Button
                      variant="primary"
                      type="submit"
                      className="fw-semibold py-2"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </Form>
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
