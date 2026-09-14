"use client";
import User1 from "@/assets/images/users/user-1.jpg";
import Icon from "@/components/wrappers/Icon";
import { META_DATA } from "@/config/constants";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import {
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "react-bootstrap";
import Swal from "sweetalert2";

const UserDropdown = () => {
  const { user, logout } = useAuth();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to log out of your session?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Logout!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  return (
    <div id="simple-user-dropdown" className="topbar-item nav-user">
      <Dropdown>
        <DropdownToggle className="topbar-link drop-arrow-none" type="button">
          <Image
            src={User1}
            width={32}
            height={32}
            className="rounded-circle me-lg-2 d-flex object-fit-cover"
            alt="user-image"
          />
          <div className="d-lg-flex align-items-center gap-2 d-none">
            <div className="text-start">
              <h5 className="my-0 mb-0">{user?.name || "Administrator"}</h5>
              <span className="text-muted fs-12">{user?.groupName || "Admin"}</span>
            </div>
            <Icon icon="chevron-down" className="align-middle" />
          </div>
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <DropdownHeader className="noti-title">
            <h6 className="text-overflow m-0">Welcome back!</h6>
          </DropdownHeader>

          <DropdownItem href="/admin/users/profile">
            <Icon
              icon="circle-user-round"
              className="me-1 fs-lg align-middle"
            />
            <span className="align-middle">Profile</span>
          </DropdownItem>

          {/* <DropdownItem href="">
            <Icon icon="bell-ring" className="me-1 fs-lg align-middle" />
            <span className="align-middle">Notifications</span>
          </DropdownItem> */}

          <DropdownItem href="/admin/settings">
            <Icon icon="settings" className="me-1 fs-lg align-middle" />
            <span className="align-middle">Settings</span>
          </DropdownItem>

          <DropdownDivider />

          {/* <DropdownItem href="/auth/lock-screen">
            <Icon icon="lock-keyhole" className="me-1 fs-lg align-middle" />
            <span className="align-middle">Lock Screen</span>
          </DropdownItem> */}

          <DropdownItem
            as="button"
            type="button"
            onClick={handleLogout}
            className="text-danger fw-semibold"
          >
            <Icon icon="log-out" className="me-1 fs-lg align-middle" />
            <span className="align-middle">Log Out</span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default UserDropdown;
