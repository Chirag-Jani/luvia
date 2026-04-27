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
import { PRESALE_END_DATE, PRESALE_FALLBACK_DAYS } from "@/lib/solana/config";
import { usePresaleState } from "@/hooks/usePresaleState";

const Index = () => {
  const { data: presale } = usePresaleState();

  const endDate = useMemo(() => {
    if (presale?.presaleEndTs) {
      return new Date(presale.presaleEndTs * 1000);
    }
    if (PRESALE_END_DATE) {
      const parsed = new Date(PRESALE_END_DATE);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + PRESALE_FALLBACK_DAYS);
    return fallback;
  }, [presale?.presaleEndTs]);

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
    </main>
  );
};

export default Index;
