import AppMenu from "./components/AppMenu";

const HorizontalNav = () => {
  return (
    <header className="topnav">
      <nav className="navbar navbar-expand-lg">
        <nav className="container-fluid">
          <div className="collapse navbar-collapse" id="topnav-menu">
            <AppMenu />
          </div>
        </nav>
      </nav>
    </header>
  );
};

export default HorizontalNav;
