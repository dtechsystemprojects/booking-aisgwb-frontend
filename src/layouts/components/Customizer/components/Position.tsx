import { useLayoutContext } from "@/context/useLayoutContext";

const Position = () => {
  const { updateSettings, position } = useLayoutContext();

  const handlePositionChange = (value: string) => {
    updateSettings({ position: value });
  };

  return (
    <div id="position" className="p-3 border-bottom border-dashed">
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="fw-bold mb-0">Layout Position</h5>
        <div className="d-flex gap-1">
          <div id="position-fixed">
            <input
              type="radio"
              className="btn-check"
              name="data-layout-position"
              id="layout-position-fixed"
              checked={position === "fixed"}
              onChange={() => handlePositionChange("fixed")}
            />
            <label
              className="btn btn-sm btn-soft-warning w-sm"
              htmlFor="layout-position-fixed"
            >
              Fixed
            </label>
          </div>
          <div id="position-scrollable">
            <input
              type="radio"
              className="btn-check"
              name="data-layout-position"
              id="layout-position-scrollable"
              checked={position === "scrollable"}
              onChange={() => handlePositionChange("scrollable")}
            />
            <label
              className="btn btn-sm btn-soft-warning w-sm ms-0"
              htmlFor="layout-position-scrollable"
            >
              Scrollable
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Position;
