import { useLayoutContext } from "@/context/useLayoutContext";
import { toTitleCase } from "@/utils/helpers";
import Image from "next/image";
import type { CustomizationOptionType } from "../index";

import horizontalImg from "@/assets/images/layouts/orientation-horizontal.png";
import verticalImg from "@/assets/images/layouts/orientation-vertical.png";

const orientationOptions: CustomizationOptionType[] = [
  { value: "vertical", image: verticalImg },
  { value: "horizontal", image: horizontalImg },
];

const Orientation = () => {
  const { updateSettings, orientation } = useLayoutContext();

  const handleOrientationChange = (value: string) => {
    updateSettings({ orientation: value });
  };

  return (
    <div id="orientation" className="p-3 border-bottom border-dashed">
      <h5 className="mb-3 fw-bold">Orientation</h5>
      <div className="row g-3">
        {orientationOptions &&
          orientationOptions.map((option) => (
            <div
              className="col-4"
              id={`orientation-${option.value}`}
              key={option.value}
            >
              <div className="form-check card-radio">
                <input
                  className="form-check-input"
                  type="radio"
                  name="data-orientation"
                  id={`layout-orientation-${option.value}`}
                  checked={orientation === option.value}
                  onChange={() => handleOrientationChange(option.value)}
                />
                <label
                  className="form-check-label p-0 w-100"
                  htmlFor={`layout-orientation-${option.value}`}
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

export default Orientation;
