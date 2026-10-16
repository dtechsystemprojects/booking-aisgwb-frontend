import type { Metadata } from "next";
import LandingClient from "./components/LandingClient";

export const metadata: Metadata = { title: "AISGWB" };

const Landing = () => {
  return <LandingClient />;
};

export default Landing;

