"use client";

import logo from "@/assets/images/logo.png";
import logoSm from "@/assets/images/logo-sm.png";
import Icon from "@/components/wrappers/Icon";
import { useLayoutContext } from "@/context/useLayoutContext";
import useScrollEvent from "@/hooks/useScrollEvent";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSettingsContext } from "@/context/useSettingsContext";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  Button,
  Container,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  Navbar,
  NavbarCollapse,
  NavbarToggle,
  NavDropdown,
  Spinner,
} from "react-bootstrap";

interface MenuItem {
  id: number;
  title: string;
  url: string;
  parent: number;
  order: number;
  target: string;
  classes: string[];
  type: string;
  object: string;
  slug: string;
  children?: MenuItem[];
}

export default function Header() {
  const { theme, updateSettings } = useLayoutContext();
  const { user } = useSelector((state: RootState) => state.frontendUser);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [imgError, setImgError] = useState(false);

  const [isAuth, setIsAuth] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = getCookie("user");
      if (userStr) {
        try {
          const userObj = JSON.parse(decodeURIComponent(userStr));
          if (userObj.isFrontEnd === true) {
            setIsAuth(true);
          }
        } catch (e) {
          console.error("Failed to parse user data from cookie", e);
        }
      }
    }
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("frontend_token");
          localStorage.removeItem("frontend_user");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("frontend_token");
          sessionStorage.removeItem("frontend_user");
          document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
          document.cookie = "user=; path=/; max-age=0; SameSite=Lax";
          sessionStorage.setItem("show_frontend_logout_toast", "true");
          window.location.href = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        }
      }
    });
  };

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

  const [menuLoading, setMenuLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(
          "https://dtechsystem.co.in/aisgwb/wp-json/aisgwb/v1/header-menu?location=primary_menu"
        );
        const data = await res.json();

        const itemMap = new Map();
        const roots: MenuItem[] = [];

        data.forEach((item: any) => {
          itemMap.set(item.id, { ...item, children: [] });
        });

        data.forEach((item: any) => {
          const node = itemMap.get(item.id);
          if (item.parent === 0) {
            roots.push(node);
          } else {
            const parentNode = itemMap.get(item.parent);
            if (parentNode) {
              parentNode.children.push(node);
            }
          }
        });

        const sortNodes = (nodes: MenuItem[]) => {
          nodes.sort((a, b) => a.order - b.order);
          nodes.forEach((node) => {
            if (node.children && node.children.length > 0) {
              sortNodes(node.children);
            }
          });
        };

        sortNodes(roots);
        setMenuItems(roots);
      } catch (error) {
        console.error("Failed to fetch menu:", error);
      } finally {
        setMenuLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return (
    <>
      <header>
        <Navbar
          expand="lg"
          className={`py-3 sticky-top ${scrollY > 100 && "top-scroll-up top-fixed"}`}
          id="landing-navbar"
        >
          <Container>
            <div className="nav-inner">
              <div className="auth-brand mb-0">
                <Link href="/" className="logo-dark d-flex align-items-center gap-2 text-decoration-none">
                  {isMounted ? (
                    <Image src={setting("general.logo", logo.src)} alt="dark logo" height={32} width={150} style={{ objectFit: 'contain' }} />
                  ) : (
                    <Image src={logo.src} alt="dark logo" height={32} width={150} style={{ objectFit: 'contain' }} />
                  )}
                </Link>
              </div>
              <div className="right-side">
                <NavbarCollapse in={!isCollapsed} id="navbarSupportedContent">
                  <Nav className="text-uppercase fw-bold gap-2 fs-sm mt-2 mt-lg-0">
                    {menuLoading ? (
                      <li className="nav-item d-flex align-items-center">
                        <Spinner animation="border" size="sm" className="text-primary" />
                      </li>
                    ) : menuItems.length > 0 ? (
                      menuItems.map((item) => (
                        item.children && item.children.length > 0 ? (
                          <NavDropdown
                            key={item.id}
                            title={item.title}
                            id={`nav-dropdown-${item.id}`}
                            className="nav-item fs-xs"
                          >
                            {item.children.map((child) => (
                              <NavDropdown.Item
                                key={child.id}
                                href={child.url}
                                as={Link}
                                className="fs-xs"
                              >
                                {child.title}
                              </NavDropdown.Item>
                            ))}
                          </NavDropdown>
                        ) : (
                          <li className="nav-item" key={item.id}>
                            <Link
                              className={`nav-link fs-xs ${item.classes.join(" ")}`}
                              href={item.url}
                            >
                              {item.title}
                            </Link>
                          </li>
                        )
                      ))
                    ) : (
                      <>
                        <li className="nav-item">
                          <Link className="nav-link fs-xs" href={'https://dtechsystem.co.in/aisgwb/'}>
                            Home
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link fs-xs" href={process.env.AISGWB_MENU_URL + "/about"}>
                            About Us
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link fs-xs" href={process.env.AISGWB_MENU_URL + "/goal"}>
                            Goal
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link fs-xs" href={process.env.AISGWB_MENU_URL + "/contact"}>
                            Contact
                          </Link>
                        </li>
                      </>
                    )}
                  </Nav>
                </NavbarCollapse>

                <div className="d-flex align-items-center gap-2">
                  <Dropdown>
                    <DropdownToggle as={'button'} className="btn btn-light btn-account" style={{ padding: (user?.avatar && isAuth && !imgError) ? '2px' : undefined }}>
                      {(user?.avatar && isAuth && !imgError) ? (
                        <Image
                          src={user.avatar.startsWith("/") ? user.avatar : `/uploads/profile/${user.avatar}`}
                          alt="Profile"
                          width={28}
                          height={28}
                          style={{ borderRadius: "50%", objectFit: "cover" }}
                          unoptimized
                          onError={() => setImgError(true)}
                        />
                      ) : (
                        <Icon icon="user" className="fs-14" />
                      )}
                    </DropdownToggle>
                    <DropdownMenu align={'end'}>
                      {isAuth ? (
                        <>
                          <DropdownItem href="/profile">Profile</DropdownItem>
                          <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
                        </>
                      ) : (
                        <>
                          <DropdownItem href="/login">Login</DropdownItem>
                          <DropdownItem href="/register">Register</DropdownItem>
                        </>
                      )}
                    </DropdownMenu>
                  </Dropdown>
                  {/* <Button
                      variant="link"
                      className="btn-icon fw-semibold nav-link"
                      onClick={toggleTheme}
                      title="Toggle Theme"
                    >
                      <Icon icon="contrast" className="fs-22" />
                    </Button>
                    <Link
                      href="/auth/sign-in"
                      className="btn btn-outline-primary btn-sm fw-semibold d-flex align-items-center gap-1"
                    >
                      <Icon icon="log-in" className="fs-14" /> Sign In (OTP)
                    </Link> */}
                  {/* <Link
                      href="/auth/sign-up"
                      className="btn btn-primary btn-sm fw-semibold d-flex align-items-center gap-1"
                    >
                      <Icon icon="user-plus" className="fs-14" /> Register
                    </Link> */}
                </div>

                {/* For responsive design */}
                <NavbarToggle
                  aria-controls="navbarSupportedContent"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                />
              </div>
            </div>
          </Container>
        </Navbar>
      </header>
    </>
  );
}
