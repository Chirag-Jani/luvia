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
import { usePresaleState } from "@/hooks/usePresaleState";

const Index = () => {
  const { data: presale } = usePresaleState();

  const endDate = useMemo(() => {
    const ts = presale?.presaleEndTs ?? Math.floor(Date.now() / 1000);
    return new Date(ts * 1000);
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
