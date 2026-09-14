import type { Metadata } from "next";
import Footer from "../common/Footer";
import Header from "../common/Header";
import Hero from "./components/Hero";
import Events from "./components/Events";

export const metadata: Metadata = { title: "AISGWB" };

const Landing = () => {
  return (
    <div className="bg-body-secondary">
      <Header />
      <Hero />
      <Events />
      <Footer />
    </div>
  );
};

export default Landing;
