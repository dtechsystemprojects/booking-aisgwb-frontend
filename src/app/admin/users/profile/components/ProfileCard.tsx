import us from "@/assets/images/flags/us.svg";
import user3 from "@/assets/images/users/user-1.jpg";
import Icon from "@/components/wrappers/Icon";
import { META_DATA } from "@/config/constants";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardBody,
  CardTitle,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "react-bootstrap";
import { skillData } from "./data";

const ProfileCard = () => {
  return (
    <Card className="card-top-sticky">
      <CardBody>
        <div className="d-flex align-items-center mb-4">
          <div className="me-3 position-relative">
            <Image
              src={user3}
              alt="avatar"
              className="rounded-circle"
              width={72}
              height={72}
            />
          </div>
          <div>
            <h5 className="mb-0 d-flex align-items-center">
              <Link href="" className="link-reset">
                {META_DATA.username}
              </Link>
              <Image
                src={us}
                alt="US"
                className="ms-2 rounded-circle"
                height={16}
              />
            </h5>
            <p className="text-muted mb-2">Senior Developer</p>
            <span className="badge text-bg-light badge-label">Team Lead</span>
          </div>
          <div className="ms-auto">
            <Dropdown>
              <DropdownToggle className="content-none btn-icon btn-ghost-light text-muted">
                <Icon icon="ellipsis-vertical" className="fs-xl" />
              </DropdownToggle>
              <DropdownMenu align="end">
                <DropdownItem>Edit Profile</DropdownItem>
                <DropdownItem className="text-danger">Report</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="avatar-sm text-bg-light bg-opacity-75 d-flex align-items-center justify-content-center rounded-circle">
              <Icon icon="briefcase" className="fs-xl" />
            </div>
            <p className="mb-0 fs-sm">UI/UX Designer & Full-Stack Developer</p>
          </div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="avatar-sm text-bg-light bg-opacity-75 d-flex align-items-center justify-content-center rounded-circle">
              <Icon icon="graduation-cap" className="fs-xl" />
            </div>
            <p className="mb-0 fs-sm">
              Studied at{" "}
              <span className="text-dark fw-semibold">Stanford University</span>
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="avatar-sm text-bg-light bg-opacity-75 d-flex align-items-center justify-content-center rounded-circle">
              <Icon icon="map-pin" className="fs-xl" />
            </div>
            <p className="mb-0 fs-sm">
              Lives in{" "}
              <span className="text-dark fw-semibold">San Francisco, CA</span>
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="avatar-sm text-bg-light bg-opacity-75 d-flex align-items-center justify-content-center rounded-circle">
              <Icon icon="users" className="fs-xl" />
            </div>
            <p className="mb-0 fs-sm">
              Followed by{" "}
              <span className="text-dark fw-semibold">25.3k People</span>
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="avatar-sm text-bg-light bg-opacity-75 d-flex align-items-center justify-content-center rounded-circle">
              <Icon icon="mail" className="fs-xl" />
            </div>
            <p className="mb-0 fs-sm">
              Email{" "}
              <a
                href="mailto:hello@example.com"
                className="text-primary fw-semibold"
              >
                hello@example.com
              </a>
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="avatar-sm text-bg-light bg-opacity-75 d-flex align-items-center justify-content-center rounded-circle">
              <Icon icon="link" className="fs-xl" />
            </div>
            <p className="mb-0 fs-sm">
              Website{" "}
              <a
                href="https://www.example.dev"
                className="text-primary fw-semibold"
              >
                www.example.dev
              </a>
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="avatar-sm text-bg-light bg-opacity-75 d-flex align-items-center justify-content-center rounded-circle">
              <Icon icon="earth" className="fs-xl" />
            </div>
            <p className="mb-0 fs-sm">
              Languages{" "}
              <span className="text-dark fw-semibold">English, Japanese</span>
            </p>
          </div>

          <div className="d-flex justify-content-center gap-2 mt-4 mb-2">
            <Link
              href=""
              className="btn btn-icon rounded-circle btn-primary"
              title="Facebook"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-brand-facebook"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" />
              </svg>
            </Link>
            <Link
              href=""
              className="btn btn-icon rounded-circle btn-info"
              title="Twitter-x"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-brand-x"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
              </svg>
            </Link>
            <Link
              href=""
              className="btn btn-icon rounded-circle btn-danger"
              title="Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-brand-instagram"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
                <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                <path d="M16.5 7.5v.01" />
              </svg>
            </Link>
            <Link
              href=""
              className="btn btn-icon rounded-circle btn-success"
              title="Dribbble"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-brand-dribbble"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                <path d="M9 3.6c5 6 7 10.5 7.5 16.2" />
                <path d="M6.4 19c3.5 -3.5 6 -6.5 14.5 -6.4" />
                <path d="M3.1 10.75c5 0 9.814 -.38 15.314 -5" />
              </svg>
            </Link>
            <Link
              href=""
              className="btn btn-icon rounded-circle btn-secondary"
              title="LinkedIn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-brand-linkedin"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M8 11v5" />
                <path d="M8 8v.01" />
                <path d="M12 16v-5" />
                <path d="M16 16v-3a2 2 0 1 0 -4 0" />
                <path d="M3 7a4 4 0 0 1 4 -4h10a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-10a4 4 0 0 1 -4 -4z" />
              </svg>
            </Link>
            <Link
              href=""
              className="btn btn-icon rounded-circle btn-danger"
              title="YouTube"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-brand-youtube"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M2 8a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4v-8z" />
                <path d="M10 9l5 3l-5 3z" />
              </svg>
            </Link>
          </div>
        </div>
        <CardTitle as="h4" className="mb-3 mt-4">
          Skills
        </CardTitle>

        <div className="d-flex flex-wrap gap-1">
          {skillData.map((skill, index) => (
            <Link key={index} className="btn btn-light btn-sm" href="">
              {skill}
            </Link>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default ProfileCard;
