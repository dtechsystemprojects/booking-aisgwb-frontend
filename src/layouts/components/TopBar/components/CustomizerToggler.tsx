import Icon from "@/components/wrappers/Icon";
import { useLayoutContext } from "@/context/useLayoutContext";

const CustomizerToggler = () => {
  const { toggleCustomizer } = useLayoutContext();

  return (
    <div className="topbar-item d-none d-sm-flex btn-theme-setting">
      <button className="topbar-link" type="button" onClick={toggleCustomizer}>
        <span className="topbar-link-icon">
          <Icon icon="settings" />
        </span>
      </button>
    </div>
  );
};

export default CustomizerToggler;
