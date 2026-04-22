import { Reveal } from "./Reveal";
import { Check, X } from "lucide-react";

const cards = [
  {
    title: "vs. AWS / Google Cloud / Azure",
    points: [
      { ok: true, text: "Lower compute costs" },
      { ok: true, text: "Decentralized access" },
      { ok: true, text: "No vendor lock-in" },
      { ok: false, text: "Centralized pricing & policy" },
    ],
  },
  {
    title: "vs. Render / Akash / Golem",
    points: [
      { ok: true, text: "AI-first (not generic compute)" },
      { ok: true, text: "ML-optimized routing" },
      { ok: true, text: "Token-driven allocation" },
      { ok: false, text: "Generalist scheduling" },
    ],
  },
];

export const Competitive = () => (
  <section className="py-24 sm:py-32">
    <div className="container">
      <div className="max-w-2xl">
        <Reveal>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl">
            Why <span className="text-gradient-violet">LUVIA</span> Wins
          </h2>
        </Reveal>
      </div>

      <div className="mt-14 grid md:grid-cols-2 gap-6">
        {cards.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.1}>
            <div className="glass-card glass-card-hover p-8 h-full">
              <h3 className="font-display font-semibold text-xl">{c.title}</h3>
              <ul className="mt-6 space-y-3">
                {c.points.map((p) => (
                  <li key={p.text} className="flex items-start gap-3">
                    <span className={`mt-0.5 w-5 h-5 rounded-full grid place-items-center shrink-0 ${
                      p.ok ? "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]" : "bg-destructive/15 text-destructive"
                    }`}>
                      {p.ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    </span>
                    <span className={p.ok ? "" : "text-muted-foreground"}>{p.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
