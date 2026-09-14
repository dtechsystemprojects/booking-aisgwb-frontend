import Icon from "@/components/wrappers/Icon";
import { useState } from "react";

const Fullscreen = () => {
  const [fullScreenOn, setFullScreenOn] = useState(false);

  const toggleFullScreen = () => {
    const doc: any = document;
    const isFS = !!(
      doc.fullscreenElement ||
      doc.mozFullScreenElement ||
      doc.webkitFullscreenElement
    );
    if (isFS) {
      (
        doc.exitFullscreen ||
        doc.cancelFullScreen ||
        doc.mozCancelFullScreen ||
        doc.webkitExitFullscreen ||
        doc.msExitFullscreen
      )?.call(doc);
    } else {
      const element = doc.documentElement;
      (
        element.requestFullscreen ||
        element.mozRequestFullScreen ||
        element.webkitRequestFullscreen ||
        element.msRequestFullscreen
      )?.call(element);
    }
    setFullScreenOn(!isFS);
  };

  return (
    <div id="fullscreen-toggler" className="topbar-item d-none d-sm-flex">
      <button className="topbar-link" type="button" onClick={toggleFullScreen}>
        {fullScreenOn ? (
          <span className="topbar-link-icon">
            <Icon icon="minimize" />
          </span>
        ) : (
          <span className="topbar-link-icon">
            <Icon icon="maximize" />
          </span>
        )}
      </button>
    </div>
  );
};

export default Fullscreen;
