import Icon from "@/components/wrappers/Icon";
import { menuItems } from "@/layouts/components/data";
import type { MenuItemType } from "@/types";
import { scrollToElement } from "@/utils/layout";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useCallback, useEffect, useState, useMemo } from "react";
import { Collapse } from "react-bootstrap";
import { useAppSelector } from "@/redux/hooks";

const MenuItemWithChildren = ({
  item,
  openMenuKey,
  setOpenMenuKey,
  level = 0,
}: {
  item: MenuItemType;
  openMenuKey: string | null;
  setOpenMenuKey: (key: string | null) => void;
  level?: number;
}) => {
  const pathname = usePathname();
  const isTopLevel = level === 0;
  const [localOpen, setLocalOpen] = useState(false);
  const [didAutoOpen, setDidAutoOpen] = useState(false);

  const isChildActive = useCallback(
    (children: MenuItemType[] = []): boolean =>
      children.some(
        (child) =>
          (child.url && pathname.startsWith(child.url)) ||
          (child.children && isChildActive(child.children)),
      ),
    [pathname],
  );

  const isActive =
    (item.url && pathname.startsWith(item.url)) || isChildActive(item.children);

  const isOpen = isTopLevel ? openMenuKey === item.slug : localOpen;

  useEffect(() => {
    if (isActive && !didAutoOpen) {
      if (isTopLevel) {
        setOpenMenuKey(item.slug);
      } else {
        setLocalOpen(true);
      }
      setDidAutoOpen(true);
    }
  }, [isActive, didAutoOpen, isTopLevel, item.slug, setOpenMenuKey]);

  const toggleOpen = (e: React.MouseEvent) => {
    if (item.children?.length) e.preventDefault();
    if (isTopLevel) {
      setOpenMenuKey(isOpen ? null : item.slug);
    } else {
      setLocalOpen((prev) => !prev);
    }
  };

  return (
    <li
      className={clsx("side-nav-item", {
        active: isActive,
      })}
    >
      <Link
        href={item.url ?? "#"}
        onClick={toggleOpen}
        className={clsx("side-nav-link", isActive && "active")}
        aria-expanded={isOpen}
      >
        {item.icon && isTopLevel && (
          <span className="menu-icon">
            <Icon icon={item.icon} />
          </span>
        )}

        <span className="menu-text">{item.label}</span>
        {item.badge ? (
          <span className={clsx("badge", item.badge.className)}>
            {item.badge.text}
          </span>
        ) : (
          <span className="menu-arrow" />
        )}
      </Link>

      <Collapse in={isOpen}>
        <div>
          <ul className="sub-menu">
            {(item.children || []).map((child) =>
              child.children ? (
                <MenuItemWithChildren
                  key={child.slug}
                  item={child}
                  openMenuKey={openMenuKey}
                  setOpenMenuKey={setOpenMenuKey}
                  level={level + 1}
                />
              ) : (
                <MenuItem key={child.slug} item={child} level={level + 1} />
              ),
            )}
          </ul>
        </div>
      </Collapse>
    </li>
  );
};

const MenuItem = ({
  item,
  level = 0,
}: {
  item: MenuItemType;
  level?: number;
}) => {
  const pathname = usePathname();
  const isTopLevel = level === 0;
  const isActive = item.url && pathname.startsWith(item.url);

  return (
    <li className={clsx("side-nav-item", isActive && "active")}>
      <Link
        href={item.url ?? "/"}
        className={clsx(
          "side-nav-link",
          isActive && "active",
          item.isDisabled && "disabled",
          item.isSpecial && "special-menu",
        )}
      >
        {item.icon && isTopLevel && (
          <span className="menu-icon">
            <Icon icon={item.icon} />
          </span>
        )}
        <span className="menu-text">{item.label}</span>
        {item.badge && (
          <span className={clsx("badge", item.badge.className)}>
            {item.badge.text}
          </span>
        )}
      </Link>
    </li>
  );
};

const AppMenu = () => {
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const scrollToActiveLink = () => {
    const activeItem: HTMLAnchorElement | null = document.querySelector(
      ".side-nav-link.active",
    );
    if (activeItem) {
      const simpleBarContent = document.querySelector(
        "#sidenav .simplebar-content-wrapper",
      );
      if (simpleBarContent) {
        const offset = activeItem.offsetTop - window.innerHeight * 0.4;
        scrollToElement(simpleBarContent, offset, 500);
      }
    }
  };
  useEffect(() => {
    setTimeout(scrollToActiveLink, 150);
  }, []);

  const { user } = useAppSelector((state) => state.auth);

  const filteredMenuItems = useMemo(() => {
    const accessRules = user?.accessRules || [];

    const categories: Record<string, MenuItemType[]> = {};

    accessRules.forEach((rule: any) => {
      if (rule.read) {
        const cat = rule.category || "Management";
        if (!categories[cat]) categories[cat] = [];

        let foundUrl = "";
        let foundIcon = "";
        const searchItems = (items: MenuItemType[]) => {
          for (const item of items) {
            if (item.label === rule.moduleName) {
              foundUrl = item.url || "";
              foundIcon = item.icon || "";
            }
            if (item.children) searchItems(item.children);
          }
        };
        searchItems(menuItems);

        categories[cat].push({
          label: rule.moduleName,
          slug: rule.id || rule.moduleName,
          url:
            foundUrl ||
            rule.url ||
            `/admin/${rule.moduleName.toLowerCase().replace(/\s+/g, "-")}`,
          icon: foundIcon || rule.icon || "file-text",
        });
      }
    });

    const dynamicMenu: MenuItemType[] = [];

    // 1. Ensure 'Main' category is displayed at the very top without duplication
    let mainChildren = categories["Main"] || [];

    const hasDashboard = mainChildren.some(
      (item) => item.label === "Dashboard",
    );
    if (!hasDashboard) {
      mainChildren = [
        {
          url: "/admin/dashboard",
          icon: "layout-dashboard",
          slug: "pages:dashboard-admin",
          label: "Dashboard",
        },
        ...mainChildren,
      ];
    }

    dynamicMenu.push({
      icon: "layout-dashboard",
      slug: "main",
      label: "Main",
      isTitle: true,
      children: mainChildren,
    });

    delete categories["Main"];

    // 2. Append remaining categories in a clean, predictable order (Management -> Application -> Administration)
    const remainingCats = Object.keys(categories);

    remainingCats.forEach((cat) => {
      if (categories[cat] && categories[cat].length > 0) {
        dynamicMenu.push({
          isTitle: true,
          label: cat,
          slug: cat.toLowerCase().replace(/\s+/g, "-"),
          children: categories[cat],
        });
      }
    });

    return dynamicMenu;
  }, [user]);

  return (
    <ul className="side-nav">
      {filteredMenuItems.map((item: MenuItemType, idx: number) => (
        <Fragment key={idx}>
          {item.isTitle && (
            <li className="side-nav-title mt-2">{item.label}</li>
          )}
          {(item.children || [item]).map((item, idx) => (
            <Fragment key={idx}>
              {item.children ? (
                <MenuItemWithChildren
                  key={item.slug}
                  item={item}
                  openMenuKey={openMenuKey}
                  setOpenMenuKey={setOpenMenuKey}
                />
              ) : (
                <MenuItem key={item.slug} item={item} />
              )}
            </Fragment>
          ))}
        </Fragment>
      ))}
    </ul>
  );
};

export default AppMenu;
