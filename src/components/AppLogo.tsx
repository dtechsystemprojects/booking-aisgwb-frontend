"use client";
import Link from "next/link";
import Image from "next/image";
import { useSettingsContext } from "@/context/useSettingsContext";
import { useLayoutContext } from "@/context/useLayoutContext";

import logoBlack from "@/assets/images/logo-black.png";
import logoSm from "@/assets/images/logo-sm.png";
import logo from "@/assets/images/logo.png";

const AppLogo = () => {
  const { setting } = useSettingsContext();
  const { sidenavSize } = useLayoutContext();

  return (
    <Link href="/" className="logo">
      <span className="logo logo-light">
        {sidenavSize !== "condensed" ? (
          <span className="logo-lg d-flex align-items-center justify-content-center gap-2" style={{ height: '70px' }}>
            <Image src={setting("general.logo", logo.src)} alt="logo" height={32} width={32} style={{ objectFit: 'contain' }} />
            <h5 className="mb-0 text-white fw-bold text-truncate" style={{ maxWidth: '140px', fontSize: '15px' }}>{setting("general.title", "AISGWB")}</h5>
          </span>
        ) : (
          <span className="logo-sm">
            <Image src={setting("general.favicon", logoSm.src)} alt="small logo" height={32} width={32} />
          </span>
        )}
      </span>
      <span className="logo logo-dark">
        {sidenavSize !== "condensed" ? (
          <span className="logo-lg d-flex align-items-center justify-content-center gap-2" style={{ height: '70px' }}>
            <Image
              src={setting(
                "general.logo_dark",
                setting("general.logo", logoBlack.src),
              )}
              alt="dark logo"
              height={32}
              width={32}
              style={{ objectFit: 'contain' }}
            />
            <h5 className="mb-0 text-dark fw-bold text-truncate" style={{ maxWidth: '140px', fontSize: '15px' }}>{setting("general.title", "AISGWB")}</h5>
          </span>
        ) : (
          <span className="logo-sm">
            <Image src={setting("general.favicon", logoSm.src)} alt="small logo" width={32} height={32} />
          </span>
        )}
      </span>
    </Link>
  );
};

export default AppLogo;
