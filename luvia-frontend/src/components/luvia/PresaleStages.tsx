import { Reveal } from "./Reveal";
import { ArrowRight, Check, Sparkles } from "lucide-react";

const stages = [
  { n: 1, price: "$0.004", status: "Live", active: true, note: "Early access" },
  { n: 2, price: "$0.006", status: "Upcoming", note: "Momentum phase" },
  { n: 3, price: "$0.009", status: "Upcoming", note: "Expansion phase" },
  { n: 4, price: "$0.012", status: "Upcoming", note: "Final presale" },
  { n: "TGE", price: "$0.018", status: "Listing", note: "Market debut" },
];

export const PresaleStages = () => (
  <section className="py-20 sm:py-24">
    <div className="container">
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl">
            Early belief, <span className="text-gradient-violet">amplified</span>
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Structured rounds with transparent pricing from first contributor to listing.
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.15}>
        <div className="mt-10 max-w-5xl mx-auto glass-card rounded-2xl p-5 sm:p-6 border border-primary/20 relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[460px] h-[220px] bg-primary/12 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-foreground/70">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Current phase
            </div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[hsl(var(--success)/0.14)] text-[hsl(var(--success))] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[hsl(var(--success))] animate-pulse" />
              Stage 1 live at $0.004
            </div>
          </div>

          <div className="mt-4 h-2 rounded-full bg-secondary/80 overflow-hidden">
            <div className="h-full w-[20%] bg-gradient-violet-cyan rounded-full" />
          </div>
        </div>
      </Reveal>

      <div className="mt-6 relative max-w-6xl mx-auto">
        <div className="hidden lg:block absolute top-1/2 left-20 right-20 h-px bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          {stages.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div
                className={`relative h-full rounded-2xl border p-5 text-left transition-all ${
                  s.active
                    ? "bg-gradient-to-b from-primary/12 to-card/80 border-primary/50 shadow-[0_0_24px_rgba(123,63,228,0.28)]"
                    : "bg-card/70 border-border/80"
                }`}>
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-full grid place-items-center font-display font-bold text-sm border ${
                    s.active
                      ? "bg-gradient-violet-cyan text-primary-foreground border-primary/60"
                      : "bg-secondary/80 text-muted-foreground border-border"
                  }`}>
                    {s.active ? <Check className="w-4 h-4" /> : s.n}
                  </div>
                  <div className={`text-[11px] font-medium ${
                    s.active ? "text-[hsl(var(--success))]" : "text-muted-foreground"
                  }`}>
                    {s.status}
                  </div>
                </div>

                <div className="mt-5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {typeof s.n === "number" ? `Stage ${s.n}` : s.n}
                </div>
                <div className="mt-1 font-display font-bold text-2xl text-foreground">{s.price}</div>
                <div className="mt-2 text-xs text-muted-foreground">{s.note}</div>

                {i < stages.length - 1 && (
                  <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 justify-center text-muted-foreground/60">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
                {s.active && (
                  <div className="absolute inset-0 rounded-2xl border border-primary/50 pointer-events-none" />
                )}
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-7 text-center text-sm text-muted-foreground">
          Each stage closes at allocation cap and automatically unlocks the next price.
        </p>
      </div>
    </div>
  </section>
);
