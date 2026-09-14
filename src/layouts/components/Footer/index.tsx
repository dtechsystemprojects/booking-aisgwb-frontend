"use client";
import { currentYear } from "@/config/constants";
import { useSettingsContext } from "@/context/useSettingsContext";
import { Col, Container, Row } from "react-bootstrap";

const Footer = () => {
  const { setting } = useSettingsContext();

  return (
    <>
      <footer className="footer">
        <Container fluid>
          <Row>
            <Col xs={12} className="text-center">
              © {currentYear}{" "}
              <span className="fw-semibold">{setting("general.title")}</span>
            </Col>
          </Row>
        </Container>
      </footer>
    </>
  );
};

export default Footer;
