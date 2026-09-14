import Icon from "@/components/wrappers/Icon";
import { SimpleBar } from "@/components/wrappers/SimpleBar";
import {
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from "react-bootstrap";

const Megamenu = () => {
  return (
    <div id="megamenu-pages" className="topbar-item d-none d-md-flex">
      <Dropdown>
        <DropdownToggle
          className="topbar-link btn fw-medium btn-link drop-arrow-none"
          type="button"
        >
          Quick Navigation <Icon icon="chevron-down" className="ms-1" />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-xl p-0">
          <SimpleBar className="h-100" style={{ maxHeight: 380 }}>
            <Row className="g-0">
              <Col md={6}>
                <div className="p-2">
                  <h5 className="mb-1 fw-semibold fs-sm dropdown-header">
                    Dashboard &amp; Overview
                  </h5>
                  <ul className="list-unstyled megamenu-list">
                    <li>
                      <DropdownItem href="/admin/dashboard">
                        <Icon
                          icon="layout-dashboard"
                          className="align-middle me-2 fs-16"
                        />{" "}
                        Admin Dashboard
                      </DropdownItem>
                    </li>
                    <li>
                      <DropdownItem href="/landing">
                        <Icon
                          icon="rocket"
                          className="align-middle me-2 fs-16"
                        />{" "}
                        Landing Page
                      </DropdownItem>
                    </li>
                    <li>
                      <DropdownItem href="/about">
                        <Icon icon="info" className="align-middle me-2 fs-16" />{" "}
                        About Us
                      </DropdownItem>
                    </li>
                  </ul>
                </div>
              </Col>

              <Col md={6}>
                <div className="p-2">
                  <h5 className="mb-1 fw-semibold fs-sm dropdown-header">
                    User &amp; Access Management
                  </h5>
                  <ul className="list-unstyled megamenu-list">
                    <li>
                      <DropdownItem href="/admin/users">
                        <Icon
                          icon="users"
                          className="align-middle me-2 fs-16"
                        />{" "}
                        Users
                      </DropdownItem>
                    </li>
                    <li>
                      <DropdownItem href="/admin/groups">
                        <Icon
                          icon="shield"
                          className="align-middle me-2 fs-16"
                        />{" "}
                        User Groups &amp; Roles
                      </DropdownItem>
                    </li>
                    <li>
                      <DropdownItem href="/admin/group-access">
                        <Icon icon="key" className="align-middle me-2 fs-16" />{" "}
                        Group Access Matrix
                      </DropdownItem>
                    </li>
                    <li>
                      <DropdownItem href="/admin/invoice">
                        <Icon
                          icon="file-text"
                          className="align-middle me-2 fs-16"
                        />{" "}
                        Invoices &amp; Billing
                      </DropdownItem>
                    </li>
                  </ul>
                </div>
              </Col>
            </Row>
          </SimpleBar>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default Megamenu;
