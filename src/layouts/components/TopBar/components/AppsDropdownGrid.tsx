"use client";
import dropboxLogo from "@/assets/images/logos/dropbox.svg";
import figmaLogo from "@/assets/images/logos/figma.svg";
import googleLogo from "@/assets/images/logos/google.svg";
import slackLogo from "@/assets/images/logos/slack.svg";
import Icon from "@/components/wrappers/Icon";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import {
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from "react-bootstrap";

type AppItemType = {
  name: string;
  img?: StaticImageData;
  icon?: string;
};

const appItems: AppItemType[] = [
  { name: "Google", img: googleLogo },
  { name: "Figma", img: figmaLogo },
  { name: "Slack", img: slackLogo },
  { name: "Dropbox", img: dropboxLogo },
  { name: "Calendar", icon: "calendar" },
  { name: "Chat", icon: "message-circle" },
  { name: "Files", icon: "folder" },
  { name: "Team", icon: "users" },
];

const AppsDropdown = () => {
  return (
    <div id="apps-dropdown-grid" className="topbar-item">
      <Dropdown align="end">
        <DropdownToggle className="topbar-link drop-arrow-none" as="button">
          <span className="topbar-link-icon">
            <Icon icon="layout-grid" />
          </span>
        </DropdownToggle>

        <DropdownMenu className="dropdown-menu-lg p-2 dropdown-menu-end">
          <Row className="align-items-center g-1">
            {appItems.slice(0, 4).map((item, index) => (
              <Col xs={4} key={index}>
                <DropdownItem
                  href=""
                  className="border border-dashed rounded text-center py-2"
                >
                  <span className="avatar-sm d-block mx-auto mb-1">
                    <span className="avatar-title text-bg-light rounded-circle">
                      {item.img ? (
                        <Image
                          src={item.img}
                          alt={`${item.name} Logo`}
                          height={18}
                        />
                      ) : (
                        item.icon && <Icon icon={item.icon} className="fs-18" />
                      )}
                    </span>
                  </span>
                  <span className="align-middle fw-medium">{item.name}</span>
                </DropdownItem>
              </Col>
            ))}

            <Col xs={4} className="text-center">
              <Link
                href=""
                className="btn btn-sm rounded-circle btn-icon btn-danger"
              >
                <Icon icon="circle-plus" className="fs-18" />
              </Link>
            </Col>

            {appItems.slice(4).map((item, index) => (
              <Col xs={4} key={index + 4}>
                <DropdownItem
                  href=""
                  className="border border-dashed rounded text-center py-2"
                >
                  <span className="avatar-sm d-block mx-auto mb-1">
                    <span className="avatar-title bg-primary-subtle text-primary rounded-circle">
                      {item.icon && <Icon icon={item.icon} className="fs-18" />}
                    </span>
                  </span>
                  <span className="align-middle fw-medium">{item.name}</span>
                </DropdownItem>
              </Col>
            ))}
          </Row>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default AppsDropdown;
