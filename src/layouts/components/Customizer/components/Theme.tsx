import darkImg from "@/assets/images/layouts/theme-dark.png";
import lightImg from "@/assets/images/layouts/theme-light.png";
import systemImg from "@/assets/images/layouts/theme-system.png";
import { useLayoutContext } from "@/context/useLayoutContext";
import { toTitleCase } from "@/utils/helpers";
import Image from "next/image";
import type { CustomizationOptionType } from "../index";

const themeOptions: CustomizationOptionType[] = [
  { value: "light", image: lightImg },
  { value: "dark", image: darkImg },
  { value: "system", image: systemImg },
];

const Theme = () => {
  const { updateSettings, theme } = useLayoutContext();

  const handleThemeChange = (value: string) => {
    updateSettings({ theme: value });
  };

  return (
    <div id="theme" className="p-3 border-bottom border-dashed">
      <h5 className="mb-3 fw-bold">Color Scheme</h5>
      <div className="row">
        {themeOptions.map((item) => (
          <div className="col-4" id={`theme-${item.value}`} key={item.value}>
            <div className="form-check card-radio">
              <input
                className="form-check-input"
                type="radio"
                name="data-bs-theme"
                id={`layout-color-${item.value}`}
                checked={theme === item.value}
                onChange={() => handleThemeChange(item.value)}
              />
              <label
                className="form-check-label p-0 w-100"
                htmlFor={`layout-color-${item.value}`}
              >
                <Image
                  src={item.image}
                  alt="layout-img"
                  className="img-fluid"
                />
              </label>
            </div>
            <h5 className="text-center text-muted mt-2 mb-0">
              {toTitleCase(item.value)}
            </h5>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Theme;
