import { Reveal } from "./Reveal";
import { Building2, Code2, Coins, Puzzle } from "lucide-react";

const items = [
  { icon: Building2, title: "Data Centers", desc: "Provide GPU/CPU capacity, earn LUVIA rewards, monetize idle infrastructure." },
  { icon: Code2, title: "Developers & AI Companies", desc: "On-demand compute, pay per use, no long-term commitments." },
  { icon: Coins, title: "Token Holders", desc: "Stake LUVIA, secure the network, earn network rewards." },
  { icon: Puzzle, title: "Integrators", desc: "API access, build on the compute layer, participate in governance." },
];

export const Participants = () => (
  <section className="py-24 sm:py-32 relative">
    <div className="container">
      <div className="max-w-2xl">
        <Reveal>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl">
            Who Powers the <span className="text-gradient-violet">Network</span>
          </h2>
        </Reveal>
      </div>

      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <Reveal key={it.title} delay={i * 0.1}>
              <div className="glass-card glass-card-hover p-8 flex gap-5">
                <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-violet-cyan/10 border border-primary/30 grid place-items-center">
                  <Icon className="w-6 h-6 text-primary-glow" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-xl">{it.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{it.desc}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);
