import {
  Navbar,
  HeroSection,
  WhyParticipate,
  RoadmapSection,
  FAQSection,
  Footer
} from "../components/homeComponents.jsx";
import React from "react";
import CountdownBanner from "../components/CountdownBanner.jsx";
export default function HomePage() {
  const registrationEndDate = "2025-12-07T23:59:59+05:30";
  return (
    <>
      <div className="min-h-screen">
        <div className="sticky top-0 z-50 bg-black/90">
          <Navbar />
          <CountdownBanner targetDateISO={registrationEndDate} />
        </div>
        <div className="bg-black">
          <HeroSection />
         </div> 
        <RoadmapSection />
        <WhyParticipate />
        <FAQSection />
        <Footer />
      </div>
    </>
  );
}
