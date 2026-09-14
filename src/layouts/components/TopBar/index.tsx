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
  const { sidenavSize } = useLayoutContext();

  return (
    <header className={clsx("app-topbar", { "topbar-active": scrollY > 50 })}>
      <Container fluid className="topbar-menu">
        <div className="d-flex align-items-center gap-2">
          {sidenavSize === "offcanvas" && (
            <div className="logo-topbar">
              <Link href="/" className="logo-light d-flex align-items-center h-100">
                <span className="logo-lg d-flex align-items-center gap-2">
                  <img src={setting("general.logo", logo.src)} alt="logo" height={32} style={{ objectFit: 'contain' }} />
                  <h5 className="mb-0 text-white fw-bold text-truncate" style={{ maxWidth: '140px', fontSize: '15px' }}>{setting("general.title", "AISGWB")}</h5>
                </span>
                <span className="logo-sm">
                  <img
                    src={setting("general.favicon", logoSm.src)}
                    alt="small logo"
                  />
                </span>
              </Link>
              <Link href="/" className="logo-dark d-flex align-items-center h-100">
                <span className="logo-lg d-flex align-items-center gap-2">
                  <img
                    src={setting(
                      "general.logo_dark",
                      setting("general.logo", logoBlack.src),
                    )}
                    alt="dark logo"
                    height={32}
                    style={{ objectFit: 'contain' }}
                  />
                  <h5 className="mb-0 text-dark fw-bold text-truncate" style={{ maxWidth: '140px', fontSize: '15px' }}>{setting("general.title", "AISGWB")}</h5>
                </span>
                <span className="logo-sm">
                  <img
                    src={setting("general.favicon", logoSm.src)}
                    alt="small logo"
                  />
                </span>
              </Link>
            </div>
          )}

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
