"use client";
import Customizer from "@/layouts/components/Customizer";
import Footer from "@/layouts/components/Footer";
import TopBar from "@/layouts/components/TopBar";
import { type ReactNode } from "react";
import { Container } from "react-bootstrap";
import ResponsiveNav from "./components/ResponsiveNav";

const HorizontalLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <div className="wrapper">
        <TopBar />
        <ResponsiveNav />
        <div className="content-page">
          <Container fluid>{children}</Container>
          <Footer />
        </div>
      </div>
      <Customizer />
    </>
  );
};

export default HorizontalLayout;
