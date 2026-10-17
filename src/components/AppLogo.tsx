"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { useSettingsContext } from "@/context/useSettingsContext";
import { useLayoutContext } from "@/context/useLayoutContext";

import logo from "@/assets/images/logo.png";

const AppLogo = () => {
  const { setting } = useSettingsContext();
  const { sidenavSize, sidenavColor, theme } = useLayoutContext();

  const isDarkMenu =
    sidenavColor === "dark" ||
    sidenavColor === "gradient" ||
    sidenavColor === "image" ||
    theme === "dark";

  const [imgError, setImgError] = useState(false);
  const logoLightSrc = setting("general.logo", logo);
  const logoDarkSrc = setting("general.logo_dark", logoLightSrc);
  const rawLogo = isDarkMenu ? logoLightSrc : logoDarkSrc;

  const currentLogo = useMemo(() => {
    if (imgError || !rawLogo) return logo;
    if (typeof rawLogo === "object" && rawLogo.src) return rawLogo;
    if (typeof rawLogo === "string") {
      const clean = rawLogo.trim();
      if (!clean || clean === "null" || clean === "undefined") return logo;
      if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("data:")) return clean;
      if (clean.startsWith("/")) return clean;
      return `/${clean}`;
    }
    return logo;
  }, [rawLogo, imgError]);

  const siteTitle = setting("general.title", "AISGWB");

  return (
    <Link href="/" className="logo d-flex align-items-center justify-content-center text-decoration-none" style={{ height: '70px' }}>
      {sidenavSize !== "condensed" ? (
        <span className="logo-lg d-flex align-items-center justify-content-center gap-2">
          <Image
            src={currentLogo}
            alt="logo"
            height={32}
            width={32}
            style={{ objectFit: 'contain' }}
            onError={() => setImgError(true)}
            unoptimized
          />
          <h5
            className={clsx("mb-0 fw-bold text-truncate", isDarkMenu ? "text-white" : "text-white")}
            style={{ maxWidth: '140px', fontSize: '15px' }}
          >
            {siteTitle}
          </h5>
        </span>
      ) : (
        <span className="logo-sm d-flex align-items-center justify-content-center">
          <Image
            src={currentLogo}
            alt="small logo"
            height={32}
            width={32}
            style={{ objectFit: 'contain' }}
            onError={() => setImgError(true)}
            unoptimized
          />
        </span>
      )}
    </Link>
  );
};

export default AppLogo;

