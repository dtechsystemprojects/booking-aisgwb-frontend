import { useLayoutContext } from "@/context/useLayoutContext";

const SidenavUser = () => {
  const { updateSettings, sidenavUser } = useLayoutContext();

  const handleSidenavUserChange = (value: boolean) => {
    updateSettings({ sidenavUser: value });
  };

  return (
    <div id="sidenav-user" className="p-3">
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <label className="fw-bold m-0" htmlFor="sidebaruser-check">
            Sidebar User Info
          </label>
        </h5>
        <div className="form-check form-switch fs-lg">
          <input
            type="checkbox"
            className="form-check-input"
            name="sidebar-user"
            id="sidebaruser-check"
            checked={sidenavUser}
            onChange={(e) => handleSidenavUserChange(e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
};

export default SidenavUser;
