import Icon from "@/components/wrappers/Icon";
import {
  Dropdown as DropdownButton,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "react-bootstrap";

const Dropdown = () => {
  return (
    <div id="loot-box" className="topbar-item">
      <DropdownButton>
        <DropdownToggle className="topbar-link btn shadow-none btn-link drop-arrow-none">
          Loot Box <Icon icon="chevron-down" className="ms-1" />
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem>
            <Icon
              icon="circle-user-round"
              className="me-1 fs-lg align-middle"
            />
            <span className="align-middle">Secret Identity</span>
          </DropdownItem>

          <DropdownItem>
            <Icon icon="bolt" className="me-1 fs-lg align-middle" />
            <span className="align-middle">Control Panel</span>
          </DropdownItem>

          <DropdownItem>
            <Icon icon="headset" className="me-1 fs-lg align-middle" />
            <span className="align-middle">Help Squad</span>
          </DropdownItem>
        </DropdownMenu>
      </DropdownButton>
    </div>
  );
};

export default Dropdown;
