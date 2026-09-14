"use client";
import { useLayoutContext } from "@/context/useLayoutContext";

const OnHoverToggle = () => {
  const { sidenavSize, updateSettings } = useLayoutContext();

  const handleToggle = () => {
    updateSettings({
      sidenavSize:
        sidenavSize === "on-hover-active" ? "on-hover" : "on-hover-active",
    });
  };

  return (
    <button className="button-on-hover" onClick={handleToggle}>
      <span className="btn-on-hover-icon" />
    </button>
  );
};

export default OnHoverToggle;
