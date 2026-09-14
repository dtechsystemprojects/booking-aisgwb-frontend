import Customizer from "@/layouts/components/Customizer";
import Footer from "@/layouts/components/Footer";
import Sidenav from "@/layouts/components/Sidenav";
import TopBar from "@/layouts/components/TopBar";
import { type ReactNode } from "react";
import { Container } from "react-bootstrap";

const VerticalLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <div className="wrapper">
        <Sidenav />
        <TopBar />
        <div className="content-page">
          <Container fluid>{children}</Container>
          <Footer />
        </div>
      </div>
      <Customizer />
    </>
  );
};

export default VerticalLayout;
