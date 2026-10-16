import dashboardImg from "@/assets/images/banner01.webp";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="event-hero-bg bg-dark position-relative">
      <Image
        src={dashboardImg}
        className="img-fluid w-100"
        alt="AISGWB Banner"
        priority
        unoptimized
      />
    </section>
  );
};

export default Hero;
