"use client";

import React, { useEffect } from "react";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import Hero from "./Hero";
import Events from "./Events";
import { useSettingsContext } from "@/context/useSettingsContext";

const LandingClient = () => {
  const { setting, isLoading } = useSettingsContext();
  const enableEvent = setting("general.enable_event");

  const isEventDisabled =
    !isLoading &&
    (enableEvent === false ||
      enableEvent === "false" ||
      enableEvent === 0 ||
      enableEvent === "0");

  useEffect(() => {
    if (isEventDisabled) {
      window.location.href = "https://aisgwb.org/events/";
    }
  }, [isEventDisabled]);

  if (isEventDisabled) {
    return null;
  }

  return (
    <div className="bg-body-secondary">
      <Header />
      <Hero />
      <Events />
      <Footer />
    </div>
  );
};

export default LandingClient;
