"use client";
import Icon from "@/components/wrappers/Icon";

const MonochromeMode = () => {
  const toggleMonochromeMode = () => {
    const htmlEl = document.getElementsByTagName("html")[0];
    htmlEl.classList.toggle("monochrome");
  };
  return (
    <div id="monochrome-toggler" className="topbar-item d-none d-sm-flex">
      <button
        className="topbar-link"
        type="button"
        onClick={toggleMonochromeMode}
      >
        <span className="topbar-link-icon">
          <Icon icon="palette" />
        </span>
      </button>
    </div>
  );
};

export default MonochromeMode;
