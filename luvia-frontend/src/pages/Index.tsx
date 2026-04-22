import { useMemo } from "react";
import { Navbar } from "@/components/luvia/Navbar";
import { Hero } from "@/components/luvia/Hero";
import { About } from "@/components/luvia/About";
import { Features } from "@/components/luvia/Features";
import { HowItWorks } from "@/components/luvia/HowItWorks";
import { Participants } from "@/components/luvia/Participants";
import { Tokenomics } from "@/components/luvia/Tokenomics";
import { PresaleStages } from "@/components/luvia/PresaleStages";
import { Roadmap } from "@/components/luvia/Roadmap";
import { TechStack } from "@/components/luvia/TechStack";
import { Competitive } from "@/components/luvia/Competitive";
import { UseCases } from "@/components/luvia/UseCases";
import { Partners } from "@/components/luvia/Partners";
import { FAQ } from "@/components/luvia/FAQ";
import { Footer } from "@/components/luvia/Footer";

const Index = () => {
  const endDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d;
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <Hero endDate={endDate} />
      <About />
      <Features />
      <HowItWorks />
      <Participants />
      <Tokenomics />
      <PresaleStages />
      <Roadmap />
      <TechStack />
      <Competitive />
      <UseCases />
      <Partners />
      <FAQ />
      <Footer />
      {/* keep endDate referenced to avoid TS unused warning */}
      <span className="hidden" data-end={endDate.toISOString()} />
    </main>
  );
};

export default Index;
