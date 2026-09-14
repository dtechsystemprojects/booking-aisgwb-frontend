import bgPattern from "@/assets/images/bg-pattern.png";
import { Icon as IconifyIcon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardBody, Col, Row } from "react-bootstrap";
import { testimonials, TestimonialType } from "./data";

import client1 from "@/assets/images/clients/01.svg";
import client2 from "@/assets/images/clients/02.svg";
import client3 from "@/assets/images/clients/03.svg";
import client4 from "@/assets/images/clients/04.svg";
import client5 from "@/assets/images/clients/05.svg";
import client6 from "@/assets/images/clients/06.svg";
import client7 from "@/assets/images/clients/07.svg";

const TestimonialCard = ({ testimonial }: { testimonial: TestimonialType }) => {
  return (
    <Card className="border border-dashed shadow-none rounded-4 p-3 card-h-100">
      <CardBody className="pb-0 text-center">
        <div className="avatar avatar-xl mx-auto mb-3">
          <Image
            src={testimonial.avatar}
            alt={testimonial.name}
            className="img-fluid rounded-circle"
          />
        </div>
        <span className="text-warning fs-lg mb-3 d-flex align-items-center justify-content-center gap-1">
          {Array(5)
            .fill(5)
            .map((_star, idx) => (
              <span key={idx}>
                <IconifyIcon icon="tabler:star-filled" />
              </span>
            ))}
        </span>
        <h4 className="mb-2 fs-md">{testimonial.title}</h4>
        <p className="text-muted mb-3 fst-italic fs-sm">
          "{testimonial.description}"
        </p>
      </CardBody>
    </Card>
  );
};

const Testimonials = () => {
  const clients = [
    client1,
    client2,
    client3,
    client4,
    client5,
    client6,
    client7,
  ];
  return (
    <section
      className="section-custom position-relative overflow-hidden"
      id="reviews"
    >
      <div className="position-absolute top-0 start-50 translate-middle-x mt-5 opacity-50">
        <Image src={bgPattern} alt="" />
      </div>

      <div className="container position-relative">
        <Row>
          <Col xs={12} className="text-center">
            <span className="text-muted rounded-3 d-inline-block">
              💬 Honest & Verified Feedback
            </span>
            <h2 className="mt-3 fw-bold mb-5">
              Read Our <span className="text-primary">Admin Reviews</span> and
              Ratings
            </h2>
          </Col>
        </Row>

        <Row className="justify-content-center">
          {testimonials.map((testimonial, idx) => (
            <Col lg={4} key={idx} className="mb-4">
              <TestimonialCard testimonial={testimonial} />
            </Col>
          ))}
        </Row>

        <Row className="justify-content-center mt-5">
          <Col xxl={9}>
            <div className="d-flex justify-content-center align-items-center flex-wrap gap-5 mt-4">
              {clients.map((logo, i) => (
                <div key={i}>
                  <Link href="" className="d-block">
                    <Image src={logo} alt="logo" height="42" />
                  </Link>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default Testimonials;
