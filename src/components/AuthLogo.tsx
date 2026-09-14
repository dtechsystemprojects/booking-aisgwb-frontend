  "use client";
  import Link from "next/link";
  import Image from "next/image";
  import { useSettingsContext } from "@/context/useSettingsContext";

  import logoBlack from "@/assets/images/logo-black.png";
  import logo from "@/assets/images/logo.png";

  const AuthLogo = () => {
    const { setting } = useSettingsContext();

    return (
      <>
        <Link href="/" className="logo-dark">
          <Image 
            src={setting("general.logo_dark", setting("general.logo", logoBlack.src))} 
            alt="dark logo" 
            width={120}
            height={32} 
            style={{ objectFit: 'contain', width: 'auto' }}
          />
        </Link>
        <Link href="/" className="logo-light">
          <Image 
            src={setting("general.logo", logo.src)} 
            alt="logo" 
            width={120}
            height={32} 
            style={{ objectFit: 'contain', width: 'auto' }}
          />
        </Link>
      </>
    );
  };

  export default AuthLogo;
