"use client";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Nav,
  NavItem,
  NavLink,
  TabContainer,
  TabContent,
  TabPane,
} from "react-bootstrap";
import About from "./About";
import Settings from "./Settings";
import TimeLine from "./TimeLine";

const Account = () => {
  return (
    <TabContainer defaultActiveKey="timeline">
      <Card>
        <CardHeader className="card-tabs d-flex align-items-center">
          <div className="flex-grow-1">
            <CardTitle as="h4">My Account</CardTitle>
          </div>
          <Nav as="ul" className="nav-tabs card-header-tabs nav-bordered">
            <NavItem as="li">
              <NavLink eventKey="about-me">
                <span className="fw-bold">About Me</span>
              </NavLink>
            </NavItem>
            <NavItem as="li">
              <NavLink eventKey="timeline">
                <span className="fw-bold">Timeline</span>
              </NavLink>
            </NavItem>
            <NavItem as="li">
              <NavLink eventKey="settings">
                <span className="fw-bold">Settings</span>
              </NavLink>
            </NavItem>
          </Nav>
        </CardHeader>
        <CardBody>
          <TabContent>
            <TabPane eventKey="about-me">
              <About />
            </TabPane>
            <TabPane eventKey="timeline">
              <TimeLine />
            </TabPane>
            <TabPane eventKey="settings">
              <Settings />
            </TabPane>
          </TabContent>
        </CardBody>
      </Card>
    </TabContainer>
  );
};

export default Account;
