import Icon from "@/components/wrappers/Icon";
import { FormControl } from "react-bootstrap";

const SearchBoxRoundedRight = () => {
  return (
    <div id="search-box-rounded-right" className="app-search d-none d-xl-flex">
      <FormControl
        type="search"
        className="rounded-pill topbar-search"
        name="search"
        placeholder="Quick Search..."
      />
      <Icon icon="search" className="app-search-icon text-muted" />
    </div>
  );
};

export default SearchBoxRoundedRight;
