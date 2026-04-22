import { Reveal } from "./Reveal";
import { Check } from "lucide-react";

const stages = [
  { n: 1, price: "$0.004", status: "Live", active: true },
  { n: 2, price: "$0.006", status: "Upcoming" },
  { n: 3, price: "$0.009", status: "Upcoming" },
  { n: 4, price: "$0.012", status: "Upcoming" },
  { n: "TGE", price: "$0.018", status: "Listing" },
];

export const PresaleStages = () => (
  <section className="py-24 sm:py-32">
    <div className="container">
      <div className="max-w-2xl">
        <Reveal>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl">
            Early belief, <span className="text-gradient-violet">amplified</span>
          </h2>
        </Reveal>
      </div>

      <div className="mt-14 relative">
        <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-border" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stages.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className={`relative glass-card p-5 text-center transition-all ${s.active ? "border-primary/60 glow-violet" : ""}`}>
                <div className={`w-16 h-16 mx-auto rounded-full grid place-items-center font-display font-bold text-lg border-2 ${
                  s.active ? "bg-gradient-violet-cyan border-primary text-primary-foreground" : "bg-secondary border-border text-muted-foreground"
                }`}>
                  {s.active ? <Check className="w-6 h-6" /> : s.n}
                </div>
                <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
                  {typeof s.n === "number" ? `Stage ${s.n}` : s.n}
                </div>
                <div className="mt-1 font-display font-bold text-xl">{s.price}</div>
                <div className={`mt-2 text-xs font-medium ${s.active ? "text-[hsl(var(--success))]" : "text-muted-foreground"}`}>
                  {s.active && "● "}{s.status}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Price increases automatically as each stage sells out.
        </p>
      </div>
    </div>
  </section>
);
