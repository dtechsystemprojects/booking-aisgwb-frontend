import { useLayoutContext } from "@/context/useLayoutContext";
import { toPascalCase } from "@/utils/helpers";
import Image from "next/image";
import { Col } from "react-bootstrap";
import type { CustomizationOptionType } from "../index";

import boxedImg from "@/assets/images/layouts/width-boxed.png";
import fluidImg from "@/assets/images/layouts/width-fluid.png";

const widthOptions: CustomizationOptionType[] = [
  { value: "fluid", image: fluidImg },
  { value: "boxed", image: boxedImg },
];

const Width = () => {
  const { updateSettings, width } = useLayoutContext();

  const handleWidthChange = (value: string) => {
    updateSettings({ width: value });
  };

  return (
    <div id="width" className="p-3 border-bottom border-dashed">
      <h5 className="mb-3 fw-bold">Layout Width</h5>
      <div className="row g-3">
        {widthOptions.map((option) => (
          <Col xs={4} id={`width-${option.value}`} key={option.value}>
            <div className="form-check sidebar-setting card-radio">
              <input
                className="form-check-input"
                type="radio"
                name="data-layout-width"
                id={`layout-width-${option.value}`}
                checked={width === option.value}
                onChange={() => handleWidthChange(option.value)}
              />
              <label
                className="form-check-label p-0 w-100"
                htmlFor={`layout-width-${option.value}`}
              >
                <Image
                  src={option.image}
                  alt="layout-img"
                  className="img-fluid"
                />
              </label>
            </div>
            <h5 className="mb-0 text-center text-muted mt-2">
              {toPascalCase(option.value)}
            </h5>
          </Col>
        ))}
      </div>
    </div>
  );
};

export default Width;
