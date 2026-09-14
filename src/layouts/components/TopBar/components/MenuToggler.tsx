"use client";
import Icon from "@/components/wrappers/Icon";
import { showBackdrop, useLayoutContext } from "@/context/useLayoutContext";
import { Button } from "react-bootstrap";

const MenuToggler = () => {
  const { updateSettings, sidenavSize } = useLayoutContext();

  const toggleSideNav = () => {
    const currentSize = sidenavSize;

    if (currentSize === "offcanvas") {
      showBackdrop();
    } else if (sidenavSize === "compact") {
      updateSettings({
        sidenavSize: currentSize === "compact" ? "condensed" : "compact",
      });
    } else {
      updateSettings({
        sidenavSize: currentSize === "condensed" ? "default" : "condensed",
      });
    }
  };

  return (
    <>
      <Button
        variant="default"
        className="sidenav-toggle-button btn-icon"
        onClick={toggleSideNav}
      >
        <Icon icon="menu" />
      </Button>
      <button onClick={showBackdrop} className="topnav-toggle-button px-2">
        <Icon icon="menu" />
      </button>
    </>
  );
};

export default MenuToggler;
