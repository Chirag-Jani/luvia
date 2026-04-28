import { useMemo } from "react";
import { Link } from "react-router-dom";
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
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden pb-20">
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
      <FAQ />
      <Footer />
      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container py-3">
          <Link
            to="/buy"
            className="w-full inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Buy Now
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Index;
