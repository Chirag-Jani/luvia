import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AnimatedNumber } from "./AnimatedNumber";
import { Countdown } from "./Countdown";
import { ParticleBg } from "./ParticleBg";
import { Reveal } from "./Reveal";
import { usePresaleState } from "@/hooks/usePresaleState";
import {
  BASE_UNIT_DIVISOR,
  FUNDRAISING_GOAL_USD,
  PER_STAGE_ALLOCATION_UI,
  SEEDED_RAISED_USD,
  STAGE_PRICES_USD,
} from "@/lib/solana/config";

interface Props {
  endDate: Date;
}

export const Hero = ({ endDate }: Props) => {
  const { data: presale } = usePresaleState();
  const raised = Math.floor(
    Math.max(SEEDED_RAISED_USD, presale?.usdRaisedFromTokens ?? 0)
  );
  const goal = FUNDRAISING_GOAL_USD;
  const pct = (raised / goal) * 100;
  const activeStageIndex = presale?.currentStage ?? 0;
  const activeStage = presale?.activeStage;
  const stagePrice = activeStage?.priceUsd ?? STAGE_PRICES_USD[0];
  const stagePct =
    activeStage && activeStage.allocation > 0n
      ? (Number(activeStage.sold) / Number(activeStage.allocation)) * 100
      : 0;
  const soldUi = activeStage ? Number(activeStage.sold) / BASE_UNIT_DIVISOR : 0;

  return (
    <section className="relative w-full min-h-[92vh] overflow-hidden bg-[#050816] pt-20 sm:pt-24 lg:pt-28 pb-10">
      {/* Background layers */}
      <div className="absolute inset-0 grid-pattern opacity-20 mix-blend-overlay" />
      <div className="absolute inset-0">
        <ParticleBg />
      </div>
      <div className="absolute inset-x-0 top-0 h-[62%] bg-gradient-to-b from-[#061a3d]/70 via-[#07122e]/35 to-transparent" />
      <div className="absolute top-[18%] left-[34%] w-[500px] h-[500px] bg-[#7B3FE4]/17 rounded-full blur-[140px] pointer-events-none -translate-x-1/2" />
      <div
        className="absolute top-[24%] right-[34%] w-[420px] h-[420px] bg-[#00D4FF]/13 rounded-full blur-[120px] pointer-events-none"
        style={{ animationDelay: "1.5s" }}
      />
      <div className="absolute bottom-[-14%] left-1/2 w-[600px] h-[380px] bg-[#7B3FE4]/10 rounded-full blur-[160px] pointer-events-none -translate-x-1/2" />

      {/* Decorative rings */}
      <div
        className="absolute top-[46%] left-[-8%] xl:left-[2%] -translate-y-1/2 w-[34vw] h-[34vw] max-w-[520px] max-h-[520px] rounded-full border border-white/10 opacity-40 pointer-events-none hidden md:block"
        style={{
          transform:
            "perspective(1200px) rotateX(72deg) rotateY(-24deg) rotateZ(12deg)",
        }}
      />
      <div
        className="absolute top-[46%] right-[-8%] xl:right-[2%] -translate-y-1/2 w-[34vw] h-[34vw] max-w-[520px] max-h-[520px] rounded-full border border-white/10 opacity-40 pointer-events-none hidden md:block"
        style={{
          transform:
            "perspective(1200px) rotateX(72deg) rotateY(24deg) rotateZ(-12deg)",
        }}
      />

      <style>
        {`
          @keyframes hero-logo-anim {
            0%, 100% { transform: translateY(-10px); }
            50% { transform: translateY(10px); }
          }
          .hero-logo-center {
            width: clamp(210px, 24vw, 320px);
            height: clamp(210px, 24vw, 320px);
            animation: hero-logo-anim 4s ease-in-out infinite;
            filter: drop-shadow(0 0 50px rgba(123,63,228,0.9)) drop-shadow(0 0 100px rgba(0,212,255,0.5));
          }
        `}
      </style>

      <div className="relative z-10 w-full max-w-[1180px] mx-auto px-4 sm:px-6 flex flex-col items-center">
        {/* Top copy */}
        <Reveal className="w-full">
          <h1 className="font-display font-semibold text-[clamp(2rem,4.9vw,4.15rem)] leading-[1.08] tracking-tight text-white text-center mx-auto max-w-4xl">
            The{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7B3FE4] to-[#A577FF]">
              Infrastructure
            </span>{" "}
            Token for the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#84EAFF]">
              AI Compute
            </span>{" "}
            Economy
          </h1>
        </Reveal>
        <Reveal delay={0.1} className="w-full">
          <p className="mt-3 text-xs sm:text-sm lg:text-base text-muted-foreground/90 font-light max-w-xl mx-auto text-center">
            Transform AI compute into a liquid, tradable, and programmable asset
            class.
          </p>
        </Reveal>

        {/* Coin + feature pills */}
        <Reveal
          delay={0.2}
          className="w-full relative mt-5 sm:mt-7 lg:mt-8 flex justify-center items-center"
        >
          <div className="relative flex justify-center items-center w-full max-w-[820px] min-h-[280px] sm:min-h-[320px] lg:min-h-[350px]">
            <div className="absolute inset-0 w-full h-full max-w-[720px] mx-auto pointer-events-none hidden md:block z-0">
              <div
                className="absolute top-[4%] left-[7%] glass-card px-2.5 py-1.5 rounded-full text-[11px] font-medium animate-float flex items-center gap-1.5 text-white/85 border-white/10 bg-black/40 backdrop-blur-md"
                style={{ animationDelay: "0s" }}
              >
                ⚡ Instant Access
              </div>
              <div
                className="absolute top-[48%] -translate-y-1/2 -left-[3%] lg:-left-[7%] glass-card px-2.5 py-1.5 rounded-full text-[11px] font-medium animate-float flex items-center gap-1.5 text-white/85 border-white/10 bg-black/40 backdrop-blur-md"
                style={{ animationDelay: "1.2s" }}
              >
                🔒 Non-Custodial
              </div>
              <div
                className="absolute bottom-[10%] left-[8%] glass-card px-2.5 py-1.5 rounded-full text-[11px] font-medium animate-float flex items-center gap-1.5 text-white/85 border-white/10 bg-black/40 backdrop-blur-md"
                style={{ animationDelay: "2.2s" }}
              >
                🌐 Global Network
              </div>
              <div
                className="absolute top-[4%] right-[7%] glass-card px-2.5 py-1.5 rounded-full text-[11px] font-medium animate-float flex items-center gap-1.5 text-white/85 border-white/10 bg-black/40 backdrop-blur-md"
                style={{ animationDelay: "0.6s" }}
              >
                🤖 AI-First
              </div>
              <div
                className="absolute top-[48%] -translate-y-1/2 -right-[3%] lg:-right-[7%] glass-card px-2.5 py-1.5 rounded-full text-[11px] font-medium animate-float flex items-center gap-1.5 text-white/85 border-white/10 bg-black/40 backdrop-blur-md"
                style={{ animationDelay: "1.6s" }}
              >
                💡 Transparent Pricing
              </div>
              <div
                className="absolute bottom-[10%] right-[8%] glass-card px-2.5 py-1.5 rounded-full text-[11px] font-medium animate-float flex items-center gap-1.5 text-white/85 border-white/10 bg-black/40 backdrop-blur-md"
                style={{ animationDelay: "2.8s" }}
              >
                🏛️ On-Chain Governance
              </div>
            </div>

            <div className="z-10 origin-center flex justify-center items-center">
              <div className="relative">
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[68%] h-10 rounded-full bg-[#7B3FE4]/45 blur-2xl pointer-events-none" />
                <img
                  src="/luvia_logo.png"
                  alt="Luvia Logo"
                  className="hero-logo-center object-contain"
                />
              </div>
            </div>
          </div>
        </Reveal>

        {/* Presale card */}
        <Reveal
          delay={0.35}
          className="w-full flex justify-center mt-[-52px] sm:mt-[-64px] z-20"
        >
          <div className="glass-card p-3.5 sm:p-4 w-full max-w-[410px] relative text-left overflow-hidden border-[rgba(123,63,228,0.32)] shadow-[0_0_40px_rgba(123,63,228,0.16)] bg-card/75 backdrop-blur-2xl rounded-2xl">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#7B3FE4]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#00D4FF]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-2">
                <div className="text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                  Stage {activeStageIndex + 1} ending in
                </div>
                <div className="flex justify-end font-display font-bold text-white tracking-wider text-xs sm:text-sm origin-right">
                  <Countdown endDate={endDate} compact />
                </div>
              </div>

              <div className="flex items-end justify-between mb-2 sm:mb-2.5 pt-0.5">
                <div className="text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                  USD Raised
                </div>
                <div className="font-display text-xs sm:text-sm font-semibold text-white/95">
                  $<AnimatedNumber value={raised} />{" "}
                  <span className="text-muted-foreground font-normal whitespace-nowrap">
                    / ${goal.toLocaleString("en-US")}
                  </span>
                </div>
              </div>

              <div className="h-2 rounded-full bg-secondary overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-[#7B3FE4] to-[#00D4FF] rounded-full relative animate-pulse-glow"
                  style={{ width: `${Math.min(100, pct)}%` }}
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"
                    style={{ backgroundSize: "200% 100%" }}
                  />
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[10px] sm:text-[11px] text-muted-foreground">
                <span>
                  Stage {activeStageIndex + 1} price: ${stagePrice.toFixed(3)}
                </span>
                <span>{Math.min(100, stagePct).toFixed(2)}% sold</span>
              </div>
              <div className="mt-1 text-[10px] sm:text-[11px] text-muted-foreground">
                {activeStage
                  ? `${Math.floor(soldUi).toLocaleString("en-US")} / ${PER_STAGE_ALLOCATION_UI.toLocaleString("en-US")} LUVIA in current stage`
                  : "Presale ended"}
              </div>

              <Button
                className="w-full mt-3.5 sm:mt-4 h-[40px] bg-[#7B3FE4] hover:bg-[#6834c4] text-white rounded-lg text-sm font-medium shadow-[0_0_20px_rgba(123,63,228,0.4)] transition-all"
                asChild
              >
                <Link to="/buy">Buy Now — Get +80% at Listing</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
