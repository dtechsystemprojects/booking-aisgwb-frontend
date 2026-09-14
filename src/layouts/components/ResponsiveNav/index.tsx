"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Sidenav = dynamic(() => import("../Sidenav"));
const HorizontalNav = dynamic(() => import("../HorizontalNav"));

const ResponsiveNav = () => {
  const [isMobile, setIsMobile] = useState<null | boolean>(null);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.outerWidth < 992);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  if (isMobile === null) return null;

  return isMobile ? <Sidenav /> : <HorizontalNav />;
};

export default ResponsiveNav;
