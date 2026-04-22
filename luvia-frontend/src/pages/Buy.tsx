import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Countdown } from "@/components/luvia/Countdown";
import { ParticleBg } from "@/components/luvia/ParticleBg";
import { Reveal } from "@/components/luvia/Reveal";
import { ArrowLeft, Wallet, ShieldCheck, Zap, FileCheck2, Check } from "lucide-react";

const SOL_PRICE = 140;
const TOKEN_PRICE = 0.004;

const stages = [
  { n: "1", price: "$0.004", active: true },
  { n: "2", price: "$0.006" },
  { n: "3", price: "$0.009" },
  { n: "4", price: "$0.012" },
  { n: "TGE", price: "$0.018" },
];

const Buy = () => {
  const [sol, setSol] = useState("1");
  const tokens = useMemo(() => {
    const n = parseFloat(sol) || 0;
    return (n * SOL_PRICE) / TOKEN_PRICE;
  }, [sol]);

  const endDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d;
  }, []);

  const raised = 1_240_000;
  const goal = 3_000_000;
  const pct = (raised / goal) * 100;

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute inset-0">
        <ParticleBg />
      </div>
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-primary/15 rounded-full blur-[180px] pointer-events-none" />

      <div className="relative z-10">
        {/* Top nav */}
        <header className="container py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-violet-cyan grid place-items-center font-display italic text-primary-foreground shadow-[var(--shadow-glow)] text-lg">
              L
            </div>
            <span className="font-display text-2xl tracking-wide">LUVIA</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </header>

        <section className="container py-10 sm:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05]">
                Buy <span className="text-gradient-violet italic">$LUVIA</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 text-lg text-muted-foreground">
                Secure your tokens during Stage 1 and unlock <span className="text-foreground font-semibold">+80% upside</span> at listing.
              </p>
            </Reveal>
          </div>

          <div className="mt-16 grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* LEFT: stage info */}
            <Reveal>
              <div className="space-y-6">
                <div className="glass-card p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">Current Stage</div>
                      <div className="mt-1 font-display text-3xl sm:text-4xl">Stage 1 — <span className="text-gradient-violet italic">Live</span></div>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))] text-xs font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[hsl(var(--success))] animate-pulse" /> Live
                    </div>
                  </div>

                  <div className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">Presale Ends In</div>
                  <div className="mt-3">
                    <Countdown endDate={endDate} />
                  </div>
                </div>

                <div className="glass-card p-6 sm:p-8">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">USD Raised</div>
                      <div className="font-bebas text-4xl sm:text-5xl mt-1 tracking-wide">
                        ${raised.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">Goal</div>
                      <div className="font-bebas text-2xl sm:text-3xl mt-1 text-muted-foreground tracking-wide">$3,000,000</div>
                    </div>
                  </div>

                  <div className="mt-4 h-3 rounded-full bg-secondary overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-violet-cyan rounded-full relative animate-pulse-glow"
                      style={{ width: `${pct}%` }}
                    >
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"
                        style={{ backgroundSize: "200% 100%" }}
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>{pct.toFixed(1)}% Filled</span>
                    <span>Stage 1 of 4</span>
                  </div>
                </div>

                <div className="glass-card p-6 sm:p-8">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-5">Stage Tracker</div>
                  <div className="flex items-center justify-between gap-2">
                    {stages.map((s, i) => (
                      <div key={s.n} className="flex-1 flex items-center">
                        <div className="flex flex-col items-center gap-2 flex-1">
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full grid place-items-center border-2 text-sm font-semibold ${
                              s.active
                                ? "bg-gradient-violet-cyan border-primary text-primary-foreground glow-violet"
                                : "bg-secondary border-border text-muted-foreground"
                            }`}
                          >
                            {s.active ? <Check className="w-4 h-4" /> : s.n}
                          </div>
                          <div className="text-[10px] sm:text-xs text-center font-semibold tabular-nums">{s.price}</div>
                        </div>
                        {i < stages.length - 1 && (
                          <div className={`h-px flex-1 mx-1 ${s.active ? "bg-primary/60" : "bg-border"}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* RIGHT: purchase card */}
            <Reveal delay={0.15}>
              <div className="glass-card p-7 sm:p-9 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-violet-cyan opacity-20 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Purchase $LUVIA</div>
                  <div className="font-display text-3xl mt-1">
                    Stage 1 — <span className="text-gradient-violet italic">$0.004</span>
                  </div>

                  <div className="mt-7 space-y-4">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">You Pay</label>
                      <div className="mt-2 relative">
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={sol}
                          onChange={(e) => setSol(e.target.value)}
                          className="h-16 text-2xl font-bebas tracking-wide bg-secondary/50 border-border/60 pr-24"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-card border border-border text-sm font-semibold">
                          SOL
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">You Receive</label>
                      <div className="mt-2 h-16 px-4 rounded-md bg-secondary/30 border border-border/60 flex items-center justify-between">
                        <span className="text-2xl font-bebas tracking-wide text-gradient">
                          {tokens.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </span>
                        <span className="px-3 py-1.5 rounded-md bg-card border border-border text-sm font-semibold">LUVIA</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-muted-foreground pt-1">
                      <span>1 SOL ≈ ${SOL_PRICE.toLocaleString()}</span>
                      <span>1 LUVIA = $0.004</span>
                    </div>
                  </div>

                  <Button variant="hero" size="xl" className="w-full mt-6">
                    <Wallet className="w-5 h-5" /> Connect Wallet
                  </Button>

                  <p className="mt-4 text-xs text-muted-foreground text-center">
                    Wallet connection and on-chain purchase will be activated at launch.
                  </p>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {[
                      { icon: ShieldCheck, label: "Non-Custodial" },
                      { icon: Zap, label: "Instant Distribution" },
                      { icon: FileCheck2, label: "Audited Contract" },
                    ].map((b) => (
                      <div
                        key={b.label}
                        className="rounded-xl bg-secondary/40 border border-border/60 p-3 flex flex-col items-center gap-2 text-center"
                      >
                        <b.icon className="w-4 h-4 text-primary-glow" />
                        <span className="text-[11px] sm:text-xs font-medium leading-tight">{b.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Buy;
