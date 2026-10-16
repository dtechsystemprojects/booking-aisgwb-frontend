"use client";
import useScrollEvent from "@/hooks/useScrollEvent";
import clsx from "clsx";
import Link from "next/link";
import { Container } from "react-bootstrap";
import { useSettingsContext } from "@/context/useSettingsContext";

import CustomizerToggler from "./components/CustomizerToggler";
import FullscreenToggler from "./components/FullscreenToggler";
import MenuToggler from "./components/MenuToggler";
import MonochromeToggler from "./components/MonochromeToggler";
import NotificationDropdownPeople from "./components/NotificationDropdownPeople";
import SearchBoxRoundedRight from "./components/SearchBoxRoundedRight";
import SimpleUserDropdown from "./components/SimpleUserDropdown";
import ThemeDropdown from "./components/ThemeDropdown";
import { useLayoutContext } from "@/context/useLayoutContext";

import logoBlack from "@/assets/images/logo-black.png";
import logoSm from "@/assets/images/logo-sm.png";
import logo from "@/assets/images/logo.png";

const TopBar = () => {
  const { scrollY } = useScrollEvent();
  const { setting } = useSettingsContext();
  const { sidenavSize, topbarColor, theme } = useLayoutContext();

  const isDarkTopbar = topbarColor === "dark" || topbarColor === "gradient" || theme === "dark";
  const logoLightSrc = setting("general.logo", logo.src);
  const logoDarkSrc = setting("general.logo_dark", logoLightSrc);
  const currentLogoSrc = isDarkTopbar ? logoLightSrc : logoDarkSrc;
  const siteTitle = setting("general.title", "AISGWB");

  return (
    <header className={clsx("app-topbar", { "topbar-active": scrollY > 50 })}>
      <Container fluid className="topbar-menu">
        <div className="d-flex align-items-center gap-2">
          {/* Show logo on mobile screens (< md) or whenever sidenav is offcanvas */}
          <div className={clsx("logo-topbar align-items-center", sidenavSize === "offcanvas" ? "d-flex" : "d-flex d-md-none")}>
            <Link href="/" className="d-flex align-items-center gap-2 text-decoration-none h-100">
              <img
                src={currentLogoSrc}
                alt="logo"
                height={32}
                width={32}
                style={{ objectFit: 'contain' }}
              />
              <h5
                className={clsx("mb-0 fw-bold text-truncate", isDarkTopbar ? "text-white" : "text-dark")}
                style={{ maxWidth: '140px', fontSize: '15px' }}
              >
                {siteTitle}
              </h5>
            </Link>
          </div>

          <MenuToggler />

          {/* <div className="d-none d-md-flex align-items-center ms-2 ps-3 border-start border-secondary border-opacity-25">
            <h6 className="mb-0 fw-bold fs-15 text-dark tracking-wide d-flex align-items-center gap-2">
              <span className="text-primary">•</span>
              <span>{setting('general.title')}</span>
            </h6>
          </div> */}
        </div>
        <div className="d-flex align-items-center gap-2">
          {/* <SearchBoxRoundedRight /> */}

          <ThemeDropdown />

          {/* <NotificationDropdownPeople /> */}

          <FullscreenToggler />

          {/* <MonochromeToggler /> */}

          {/* <CustomizerToggler /> */}

          <SimpleUserDropdown />
        </div>
      </Container>
    </header>
  );
};

export default TopBar;
