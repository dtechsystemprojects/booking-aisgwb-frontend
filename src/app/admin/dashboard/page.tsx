import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import { stateData } from "./components/data";
import EcomStats from "./components/EcomStats";

export const metadata: Metadata = { title: "Admin Dashboard" };

const Page = () => {
  return (
    <>
      <PageBreadcrumb title="Overview" subtitle="Dashboard" />

      <Row className="row-cols-xxl-4 row-cols-md-2 row-cols-1 g-3">
        {stateData.map((item, index) => (
          <Col key={index}>
            <EcomStats item={item} />
          </Col>
        ))}
      </Row>
    </>
  );
};

export default Page;
