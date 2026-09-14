"use client";

import logo from "@/assets/images/logo.png";
import logoSm from "@/assets/images/logo-sm.png";
import Icon from "@/components/wrappers/Icon";
import { useLayoutContext } from "@/context/useLayoutContext";
import useScrollEvent from "@/hooks/useScrollEvent";
import Link from "next/link";
import { useState } from "react";
import { useSettingsContext } from "@/context/useSettingsContext";
import {
  Button,
  Container,
  Nav,
  Navbar,
  NavbarCollapse,
  NavbarToggle,
} from "react-bootstrap";

export default function Header() {
  const { theme, updateSettings } = useLayoutContext();

  const toggleTheme = () => {
    if (theme === "dark") {
      updateSettings({ theme: "light" });
      return;
    }
    updateSettings({ theme: "dark" });
    return;
  };
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { scrollY } = useScrollEvent();
  const { setting } = useSettingsContext();

  return (
    <>
      <header>
        <Navbar
          expand="lg"
          className={`py-2 sticky-top ${scrollY > 100 && "top-scroll-up top-fixed"}`}
          id="landing-navbar"
        >
          <Container>
            <div className="auth-brand mb-0">
              <Link href="/" className="logo-light d-flex align-items-center gap-2 text-decoration-none">
                <img src={setting("general.logo", logo.src)} alt="logo" height={32} style={{ objectFit: 'contain' }} />
                <h5 className="mb-0 text-white fw-bold text-truncate" style={{ maxWidth: '200px', fontSize: '16px' }}>{setting("general.title", "AISGWB")}</h5>
              </Link>
            </div>

            <NavbarToggle
              aria-controls="navbarSupportedContent"
              onClick={() => setIsCollapsed(!isCollapsed)}
            />
            <NavbarCollapse in={!isCollapsed} id="navbarSupportedContent">
              <Nav className="text-uppercase fw-bold gap-3 fs-sm mx-auto mt-2 mt-lg-0">
                <li className="nav-item">
                  <Link className="nav-link fs-xs" href="/">
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fs-xs" href="/about">
                    About Us
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fs-xs" href="/goal">
                    Goal
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fs-xs" href="/contact">
                    Goal
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fs-xs" href="/contact">
                    Contact
                  </Link>
                </li>
              </Nav>
              <div className="d-flex align-items-center gap-2">
                {/* <Button
                  variant="link"
                  className="btn-icon fw-semibold nav-link"
                  onClick={toggleTheme}
                  title="Toggle Theme"
                >
                  <Icon icon="contrast" className="fs-22" />
                </Button> */}
                {/* <Link
                  href="/auth/sign-in"
                  className="btn btn-outline-primary btn-sm fw-semibold d-flex align-items-center gap-1"
                >
                  <Icon icon="log-in" className="fs-14" /> Sign In (OTP)
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="btn btn-primary btn-sm fw-semibold d-flex align-items-center gap-1"
                >
                  <Icon icon="user-plus" className="fs-14" /> Register
                </Link> */}
              </div>
            </NavbarCollapse>
          </Container>
        </Navbar>
      </header>
    </>
  );
}
