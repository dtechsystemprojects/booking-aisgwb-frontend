"use client";
import FlagDe from "@/assets/images/flags/de.svg";
import FlagEs from "@/assets/images/flags/es.svg";
import FlagIn from "@/assets/images/flags/in.svg";
import FlagIt from "@/assets/images/flags/it.svg";
import FlagRu from "@/assets/images/flags/ru.svg";
import FlagSa from "@/assets/images/flags/sa.svg";
import FlagUs from "@/assets/images/flags/us.svg";
import { useLayoutContext } from "@/context/useLayoutContext";
import Image, { StaticImageData } from "next/image";
import { useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "react-bootstrap";

type Language = {
  code: string;
  name: string;
  flag: StaticImageData;
  title: string;
};

const languages: Language[] = [
  { code: "EN", name: "English", flag: FlagUs, title: "English" },
  { code: "DE", name: "Deutsch", flag: FlagDe, title: "German" },
  { code: "IT", name: "Italiano", flag: FlagIt, title: "Italian" },
  { code: "ES", name: "Español", flag: FlagEs, title: "Spanish" },
  { code: "RU", name: "Русский", flag: FlagRu, title: "Russian" },
  { code: "HI", name: "हिन्दी", flag: FlagIn, title: "Hindi" },
  { code: "SA", name: "عربي", flag: FlagSa, title: "Arabic" },
];

const LanguageDropdown = () => {
  const [selected, setSelected] = useState<Language>(languages[0]);
  const { updateSettings, dir } = useLayoutContext();
  const handleLanguageChange = (lang: Language) => {
    setSelected(lang);
    if (lang.code === "SA" && dir === "ltr") {
      updateSettings({ dir: "rtl" });
    } else if (lang.code !== "SA" && dir === "rtl") {
      updateSettings({ dir: "ltr" });
    }
  };
  return (
    <div id="language-selector-rounded" className="topbar-item">
      <Dropdown align="end">
        <DropdownToggle
          className="topbar-link fw-bold drop-arrow-none"
          type="button"
        >
          <Image
            src={selected.flag}
            alt={selected.name}
            className="rounded-circle me-2"
            height={18}
            id="selected-language-image"
          />
          <span id="selected-language-code">{selected.code}</span>
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          {languages.map((lang) => (
            <DropdownItem
              key={lang.code}
              href="#"
              onClick={() => handleLanguageChange(lang)}
              title={lang.title}
            >
              <Image
                src={lang.flag}
                alt={lang.title}
                className="me-1 rounded-circle"
                height={18}
              />
              <span className="align-middle">{lang.name}</span>
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default LanguageDropdown;
