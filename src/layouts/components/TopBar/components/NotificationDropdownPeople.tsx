"use client";
import Icon from "@/components/wrappers/Icon";
import { SimpleBar } from "@/components/wrappers/SimpleBar";
import Image, { StaticImageData } from "next/image";
import {
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from "react-bootstrap";

import User4 from "@/assets/images/users/user-4.jpg";
import User5 from "@/assets/images/users/user-5.jpg";
import User6 from "@/assets/images/users/user-6.jpg";
import User7 from "@/assets/images/users/user-7.jpg";
import User8 from "@/assets/images/users/user-8.jpg";
import Link from "next/link";

type NotificationType = {
  id: string;
  name: string;
  message: string;
  project: string;
  time: string;
  avatarType: "image" | "icon";
  avatarSrc?: StaticImageData;
  icon?: string;
  avatarBg?: string;
  badgeBg: string;
  badgeIcon: string;
  badgeLabel: string;
};

const notifications: NotificationType[] = [
  {
    id: "message-1",
    name: "Emily Johnson",
    message: "commented on a task in",
    project: "Design Sprint",
    time: "12 minutes ago",
    avatarType: "image",
    avatarSrc: User4,
    badgeBg: "bg-success",
    badgeIcon: "bell",
    badgeLabel: "unread notification",
  },
  {
    id: "message-2",
    name: "Michael Lee",
    message: "uploaded files to",
    project: "Marketing Assets",
    time: "25 minutes ago",
    avatarType: "image",
    avatarSrc: User5,
    badgeBg: "bg-info",
    badgeIcon: "cloud-upload",
    badgeLabel: "upload notification",
  },
  {
    id: "message-6",
    name: "Server #3",
    message: "CPU usage exceeded 90%",
    project: "",
    time: "Just now",
    avatarType: "icon",
    icon: "database",
    avatarBg: "bg-light",
    badgeBg: "bg-danger",
    badgeIcon: "alert-circle",
    badgeLabel: "server alert",
  },
  {
    id: "message-3",
    name: "Sophia Ray",
    message: "flagged an issue in",
    project: "Bug Tracker",
    time: "40 minutes ago",
    avatarType: "image",
    avatarSrc: User6,
    badgeBg: "bg-warning",
    badgeIcon: "alert-triangle",
    badgeLabel: "alert",
  },
  {
    id: "message-4",
    name: "David Kim",
    message: "scheduled a meeting for",
    project: "UX Review",
    time: "1 hour ago",
    avatarType: "image",
    avatarSrc: User7,
    badgeBg: "bg-primary",
    badgeIcon: "calendar-event",
    badgeLabel: "event notification",
  },
  {
    id: "message-5",
    name: "Isabella White",
    message: "updated the document in",
    project: "Product Specs",
    time: "2 hours ago",
    avatarType: "image",
    avatarSrc: User8,
    badgeBg: "bg-secondary",
    badgeIcon: "edit",
    badgeLabel: "edit",
  },
  {
    id: "message-7",
    name: "Production Server",
    message: "deployment completed successfully",
    project: "",
    time: "30 minutes ago",
    avatarType: "icon",
    icon: "rocket",
    avatarBg: "bg-light",
    badgeBg: "bg-success",
    badgeIcon: "check",
    badgeLabel: "deployment",
  },
];
const NotificationDropdown = () => {
  return (
    <div id="notification-dropdown-people" className="topbar-item">
      <Dropdown align="end">
        <DropdownToggle className="topbar-link drop-arrow-none" as="button">
          <span className="topbar-link-icon">
            <Icon icon="bell" className="animate-ring" />
          </span>
          <span className="badge text-bg-danger badge-circle topbar-badge">
            {notifications.length}
          </span>
        </DropdownToggle>

        <DropdownMenu className="p-0 dropdown-menu-end dropdown-menu-lg">
          <div className="px-3 py-2 border-bottom">
            <Row className="align-items-center">
              <Col>
                <h6 className="m-0 fs-md fw-semibold">Notifications</h6>
              </Col>
              <Col className="text-end">
                <Link
                  href=""
                  className="badge badge-soft-success badge-label py-1"
                >
                  {notifications.length.toString().padStart(2, "0")}{" "}
                  Notifications
                </Link>
              </Col>
            </Row>
          </div>

          <SimpleBar style={{ maxHeight: 300 }}>
            {notifications.map((notif) => (
              <DropdownItem
                key={notif.id}
                id={notif.id}
                className="notification-item py-2 text-wrap"
              >
                <span className="d-flex align-items-center gap-3">
                  <span className="flex-shrink-0 position-relative">
                    {notif.avatarType === "image" && notif.avatarSrc ? (
                      <Image
                        src={notif.avatarSrc}
                        alt={`${notif.name} Avatar`}
                        className="avatar-md rounded-circle"
                        width={48}
                        height={48}
                      />
                    ) : (
                      <span
                        className={`avatar-md rounded-circle ${notif.avatarBg} d-flex align-items-center justify-content-center`}
                      >
                        {notif.icon && (
                          <Icon icon={notif.icon} className="fs-4" />
                        )}
                      </span>
                    )}

                    <span
                      className={`position-absolute rounded-pill ${notif.badgeBg} notification-badge`}
                    >
                      <Icon icon={notif.badgeIcon} className="align-middle" />
                      <span className="visually-hidden">
                        {notif.badgeLabel}
                      </span>
                    </span>
                  </span>

                  <span className="flex-grow-1 text-muted">
                    <span className="fw-medium text-body">{notif.name}</span>{" "}
                    {notif.message}{" "}
                    {notif.project && (
                      <span className="fw-medium text-body">
                        {notif.project}
                      </span>
                    )}
                    <br />
                    <span className="fs-xs">{notif.time}</span>
                  </span>

                  <button
                    type="button"
                    className="flex-shrink-0 text-muted btn btn-link p-0 position-absolute end-0 me-2 d-none noti-close-btn"
                    data-dismissible={`#${notif.id}`}
                  >
                    <Icon icon="x-square" className="fs-xxl" />
                  </button>
                </span>
              </DropdownItem>
            ))}
          </SimpleBar>

          <DropdownItem
            href=""
            className="text-center text-reset text-decoration-underline link-offset-2 fw-bold notify-item border-top border-light py-2"
          >
            Read All Messages
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default NotificationDropdown;
