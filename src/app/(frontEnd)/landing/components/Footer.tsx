import logo from "@/assets/images/logo.png";
import { currentYear, META_DATA } from "@/config/constants";
import { Icon as IconifyIcon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { Col, Container, Row } from "react-bootstrap";
import { footerLinks, socialLinks } from "./data";

const Footer = () => {
  return (
    <footer className="section-custom section-footer pb-2">
      <Container>
        <Row className="g-4 justify-content-between">
          <Col lg={3}>
            <Image src={logo} alt="logo" height={24} />
            <p className="mt-3 fs-sm">
              UBold is a best-selling admin dashboard template on ThemeForest,
              recognized for its clean design, versatility, and robust features.
              Create modern, responsive web applications effortlessly with this
              top-tier solution!
            </p>
            <div className="d-flex gap-2 mt-4 mb-2">
              {socialLinks.map((link, idx) => (
                <Link
                  href={link.url}
                  className="btn btn-sm btn-icon rounded-circle btn-dark"
                  title={link.title}
                  key={idx}
                >
                  <IconifyIcon icon={link.icon} className="fs-sm" />
                </Link>
              ))}
            </div>
          </Col>
          <Col lg={8} xxl={7}>
            <Row className="g-4">
              {footerLinks.map((section, index) => (
                <Col key={index} xs={6} md={4}>
                  <h5 className="text-white mb-4 ps-2">{section.title}</h5>
                  <ul className="nav flex-column">
                    {section.links.map((link, i) => (
                      <li className="nav-item" key={i}>
                        <Link
                          href={link.url}
                          className={`nav-link ${i === 0 && "pt-0"}`}
                        >
                          {link.name}
                          {link.badge && (
                            <span
                              className={`ms-2 badge text-bg-${link.badge.variant}`}
                            >
                              {link.badge.title}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
        <Row className="mt-5">
          <Col xs={12} className="text-center">
            <p className="mb-4">
              © {currentYear} <span className="fw-semibold">{META_DATA.name}</span>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
