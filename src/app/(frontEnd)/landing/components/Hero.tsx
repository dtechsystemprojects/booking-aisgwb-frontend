import dashboardImg from "@/assets/images/banner01.webp";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="event-hero-bg bg-dark position-relative">
      <Image src={dashboardImg} className="img-fluid" alt="AISGWB Banner" />
    </section>
  );
};

export default Hero;
