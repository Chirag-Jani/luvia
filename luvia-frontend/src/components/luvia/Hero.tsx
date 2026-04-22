import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Countdown } from "./Countdown";
import { ParticleBg } from "./ParticleBg";
import { Reveal } from "./Reveal";
import { ArrowRight, Zap } from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";

interface Props { endDate: Date }

export const Hero = ({ endDate }: Props) => {
  const raised = 1_240_000;
  const goal = 3_000_000;
  const pct = (raised / goal) * 100;

  return (
    <section className="relative w-full h-[100vh] overflow-hidden bg-[#08080F] flex flex-col items-center justify-center">
      {/* Backgrounds */}
      <div className="absolute inset-0 grid-pattern opacity-30 mix-blend-overlay" />
      <div className="absolute inset-0">
        <ParticleBg />
      </div>
      <div className="absolute top-1/4 left-[30%] w-[500px] h-[500px] bg-[#7B3FE4]/15 rounded-full blur-[140px] pointer-events-none animate-float-slow -translate-x-1/2" />
      <div className="absolute top-1/3 right-[30%] w-[400px] h-[400px] bg-[#00D4FF]/10 rounded-full blur-[120px] pointer-events-none animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-[-10%] left-1/2 w-[600px] h-[400px] bg-[#7B3FE4]/10 rounded-full blur-[160px] pointer-events-none -translate-x-1/2" />

      {/* Decorative Torus Rings */}
      <div className="absolute top-1/2 left-[5%] xl:left-[10%] -translate-y-1/2 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full border-[1px] border-white/5 opacity-40 pointer-events-none" style={{ transform: "perspective(1000px) rotateX(60deg) rotateY(-20deg) rotateZ(15deg)" }} />
      <div className="absolute top-1/2 right-[5%] xl:right-[10%] -translate-y-1/2 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full border-[1px] border-white/5 opacity-40 pointer-events-none" style={{ transform: "perspective(1000px) rotateX(60deg) rotateY(20deg) rotateZ(-15deg)" }} />

      <style>
        {`
          @keyframes hero-logo-anim {
            0%, 100% { transform: translateY(-12px); }
            50% { transform: translateY(12px); }
          }
          .hero-logo-center {
            width: 300px;
            height: 300px;
            animation: hero-logo-anim 3s ease-in-out infinite;
            filter: drop-shadow(0 0 50px rgba(123,63,228,0.9)) drop-shadow(0 0 100px rgba(0,212,255,0.5));
          }
        `}
      </style>

      <div className="relative z-10 w-full max-w-[1200px] px-4 flex flex-col items-center">
        
        {/* Top: Headline & Subheadline */}
        <Reveal className="w-full">
          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-[clamp(3.2rem,5vw,4.5rem)] leading-[1.05] tracking-tight text-white mb-4 text-center mx-auto max-w-4xl">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7B3FE4] to-[#a071ff]">Infrastructure</span> Token for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#80e9ff]">AI Compute</span> Economy
          </h1>
        </Reveal>
        <Reveal delay={0.1} className="w-full">
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground font-light max-w-2xl mx-auto text-center">
            Transform AI compute into a liquid, tradable, and programmable asset class.
          </p>
        </Reveal>

        {/* Center: Coin & Features */}
        <Reveal delay={0.2} className="w-full relative mt-6 sm:mt-10 lg:mt-12 flex justify-center items-center">
          <div className="relative flex justify-center items-center w-full max-w-[800px] min-h-[300px] sm:min-h-[340px]">
            {/* Feature Pills */}
            <div className="absolute inset-0 w-full h-full max-w-[700px] mx-auto pointer-events-none hidden sm:block z-0">
              <div className="absolute top-[0%] xl:-top-[5%] left-[5%] glass-card px-3 py-2 rounded-full text-xs font-medium animate-float flex items-center gap-1.5 text-white/90 border-white/10 bg-black/40 backdrop-blur-md" style={{ animationDelay: '0s' }}>
                ⚡ Instant Access
              </div>
              <div className="absolute top-[50%] -translate-y-1/2 -left-[5%] lg:-left-[10%] glass-card px-3 py-2 rounded-full text-xs font-medium animate-float flex items-center gap-1.5 text-white/90 border-white/10 bg-black/40 backdrop-blur-md" style={{ animationDelay: '1.2s' }}>
                🔒 Non-Custodial
              </div>
              <div className="absolute bottom-[5%] xl:-bottom-[5%] left-[5%] glass-card px-3 py-2 rounded-full text-xs font-medium animate-float flex items-center gap-1.5 text-white/90 border-white/10 bg-black/40 backdrop-blur-md" style={{ animationDelay: '2.4s' }}>
                🌐 Global Network
              </div>
              <div className="absolute top-[0%] xl:-top-[5%] right-[5%] glass-card px-3 py-2 rounded-full text-xs font-medium animate-float flex items-center gap-1.5 text-white/90 border-white/10 bg-black/40 backdrop-blur-md" style={{ animationDelay: '0.6s' }}>
                🤖 AI-First
              </div>
              <div className="absolute top-[50%] -translate-y-1/2 -right-[5%] lg:-right-[10%] glass-card px-3 py-2 rounded-full text-xs font-medium animate-float flex items-center gap-1.5 text-white/90 border-white/10 bg-black/40 backdrop-blur-md" style={{ animationDelay: '1.8s' }}>
                💡 Transparent Pricing
              </div>
              <div className="absolute bottom-[5%] xl:-bottom-[5%] right-[5%] glass-card px-3 py-2 rounded-full text-xs font-medium animate-float flex items-center gap-1.5 text-white/90 border-white/10 bg-black/40 backdrop-blur-md" style={{ animationDelay: '3s' }}>
                🏛️ On-Chain Governance
              </div>
            </div>

            {/* Logo */}
            <div className="z-10 origin-center flex justify-center items-center">
              <img src="/luvia_logo.png" alt="Luvia Logo" className="hero-logo-center object-contain" />
            </div>
          </div>
        </Reveal>

        {/* Bottom: Presale Card */}
        <Reveal delay={0.4} className="w-full flex justify-center mt-[-40px] sm:mt-[-50px] z-20">
          <div className="glass-card p-5 sm:p-6 w-full max-w-[460px] relative text-left overflow-hidden border-[rgba(123,63,228,0.3)] shadow-[0_0_40px_rgba(123,63,228,0.15)] bg-card/70 backdrop-blur-2xl rounded-2xl">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#7B3FE4]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#00D4FF]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-3">
                <div className="text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Round ending in</div>
                <div className="flex justify-end font-display font-bold text-white tracking-wider text-sm sm:text-base origin-right">
                  <Countdown endDate={endDate} />
                </div>
              </div>

              <div className="flex items-end justify-between mb-2 sm:mb-3 pt-1">
                <div className="text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground font-medium">USD Raised</div>
                <div className="font-display text-sm sm:text-base font-semibold text-white/95">
                  $<AnimatedNumber value={raised} /> <span className="text-muted-foreground font-normal whitespace-nowrap">/ $3,000,000</span>
                </div>
              </div>

              <div className="h-2 rounded-full bg-secondary overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-[#7B3FE4] to-[#00D4FF] rounded-full relative animate-pulse-glow"
                  style={{ width: `${pct}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"
                    style={{ backgroundSize: "200% 100%" }} />
                </div>
              </div>

              <Button className="w-full mt-5 sm:mt-6 h-[48px] bg-[#7B3FE4] hover:bg-[#6834c4] text-white rounded-lg text-sm sm:text-base font-medium shadow-[0_0_20px_rgba(123,63,228,0.4)] transition-all" asChild>
                <Link to="/buy">Buy Now — Get +80% at Listing</Link>
              </Button>
              
              <div className="mt-3 sm:mt-4 text-center text-[9px] sm:text-[10px] text-muted-foreground font-medium tracking-wide">
                Stage 1 — $0.004 <span className="mx-1.5 opacity-50">|</span> Listing — $0.018
              </div>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
};
