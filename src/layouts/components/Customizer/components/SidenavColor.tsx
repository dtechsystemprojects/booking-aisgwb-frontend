import darkImg from "@/assets/images/layouts/sidenav-color-dark.png";
import gradientImg from "@/assets/images/layouts/sidenav-color-gradient.png";
import grayImg from "@/assets/images/layouts/sidenav-color-gray.png";
import imageImg from "@/assets/images/layouts/sidenav-color-image.png";
import lightImg from "@/assets/images/layouts/sidenav-color-light.png";
import { useLayoutContext } from "@/context/useLayoutContext";
import { toTitleCase } from "@/utils/helpers";
import Image from "next/image";
import type { CustomizationOptionType } from "../index";

const sidenavColorOptions: CustomizationOptionType[] = [
  { value: "light", image: lightImg },
  { value: "dark", image: darkImg },
  { value: "gray", image: grayImg },
  { value: "gradient", image: gradientImg },
  { value: "image", image: imageImg },
];

const SidenavColor = () => {
  const { updateSettings, sidenavColor } = useLayoutContext();

  const handleSidenavColorChange = (value: string) => {
    updateSettings({ sidenavColor: value });
  };

  return (
    <div id="sidenav-color" className="p-3 border-bottom border-dashed">
      <h5 className="mb-3 fw-bold">Sidenav Color</h5>
      <div className="row g-3">
        {sidenavColorOptions &&
          sidenavColorOptions.map((option) => (
            <div
              className="col-4"
              id={`sidenav-color-${option.value}`}
              key={option.value}
            >
              <div className="form-check sidebar-setting card-radio">
                <input
                  className="form-check-input"
                  type="radio"
                  name="data-menu-color"
                  id={`layout-sidenav-color-${option.value}`}
                  checked={sidenavColor === option.value}
                  onChange={() => handleSidenavColorChange(option.value)}
                />
                <label
                  className="form-check-label p-0 w-100"
                  htmlFor={`layout-sidenav-color-${option.value}`}
                >
                  <Image
                    src={option.image}
                    alt="layout-img"
                    className="img-fluid"
                  />
                </label>
              </div>
              <h5 className="fs-sm text-center text-muted mt-2 mb-0">
                {toTitleCase(option.value)}
              </h5>
            </div>
          ))}
      </div>
    </div>
  );
};

export default SidenavColor;
