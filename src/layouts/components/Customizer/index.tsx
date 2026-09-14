import settingsBg from "@/assets/images/settings-bg.png";
import Icon from "@/components/wrappers/Icon";
import { SimpleBar } from "@/components/wrappers/SimpleBar";
import { META_DATA } from "@/config/constants";
import { useLayoutContext } from "@/context/useLayoutContext";
import { type StaticImageData } from "next/image";
import { Button, Col, Offcanvas, Row } from "react-bootstrap";
import Dir from "./components/Dir";
import Orientation from "./components/Orientation";
import Position from "./components/Position";
import SidenavColor from "./components/SidenavColor";
import SidenavSize from "./components/SidenavSize";
import SidenavUser from "./components/SidenavUser";
import Skin from "./components/Skin";
import Theme from "./components/Theme";
import TopbarColor from "./components/TopbarColor";
import Width from "./components/Width";

export type CustomizationOptionType = {
  value: string;
  image: StaticImageData;
};

const Customizer = () => {
  const { isCustomizerOpen, toggleCustomizer, reset } = useLayoutContext();

  return (
    <Offcanvas
      show={isCustomizerOpen}
      onHide={toggleCustomizer}
      placement="end"
      className="overflow-hidden"
      tabIndex={-1}
      id="theme-settings-offcanvas"
    >
      <div
        className="d-flex justify-content-between text-bg-primary gap-2 p-3"
        style={{ backgroundImage: `url("${settingsBg.src}")` }}
      >
        <div>
          <h5 className="mb-1 fw-bold text-white text-uppercase">
            Admin Customizer
          </h5>
          <p className="text-white text-opacity-75 fst-italic fw-medium mb-0">
            Easily configure layout, styles, and preferences for your admin
            interface.
          </p>
        </div>
        <div className="flex-grow-0">
          <button
            type="button"
            onClick={toggleCustomizer}
            className="d-block btn btn-sm bg-white bg-opacity-25 text-white rounded-circle btn-icon"
            data-bs-dismiss="offcanvas"
          >
            <Icon icon="x" className="fs-lg" />
          </button>
        </div>
      </div>
      <SimpleBar className="offcanvas-body theme-customizer-bar p-0 h-100">
        <Skin />

        <Theme />

        <TopbarColor />

        <Orientation />

        <SidenavColor />

        <SidenavSize />

        <Width />

        <Dir />

        <Position />

        <SidenavUser />
      </SimpleBar>
      <div className="offcanvas-footer border-top p-3 text-center">
        <Row className="justify-content-end">
          <Col xs={6}>
            <a
              href={META_DATA.buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-success fw-semibold py-2 w-100"
            >
              <Icon icon="shopping-basket" className="me-2 fs-md" /> Buy Now
            </a>
          </Col>
          <Col xs={6}>
            <Button
              onClick={reset}
              variant="danger"
              type="button"
              className="fw-semibold py-2 w-100"
              id="reset-layout"
            >
              <Icon icon="refresh-ccw" className="me-2 fs-md" /> Reset
            </Button>
          </Col>
        </Row>
      </div>
    </Offcanvas>
  );
};

export default Customizer;
