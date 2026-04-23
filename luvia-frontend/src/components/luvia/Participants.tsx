import { Reveal } from "./Reveal";
import { Building2, Code2, Coins, Puzzle } from "lucide-react";

const items = [
  {
    icon: Building2,
    title: "Data Centers",
    desc: "Provide GPU/CPU capacity and monetize idle infrastructure.",
    pos: "md:left-[3%] md:top-[40%]",
  },
  {
    icon: Code2,
    title: "Developers & AI Companies",
    desc: "Consume compute on demand with pay-per-use execution.",
    pos: "md:left-1/2 md:-translate-x-1/2 md:top-[3%]",
  },
  {
    icon: Coins,
    title: "Token Holders",
    desc: "Stake LUVIA to secure the network and share rewards.",
    pos: "md:left-1/2 md:-translate-x-1/2 md:bottom-[3%]",
  },
  {
    icon: Puzzle,
    title: "Integrators",
    desc: "Integrate APIs and orchestrate products on compute rails.",
    pos: "md:right-[3%] md:top-[40%]",
  },
];

export const Participants = () => (
  <section className="py-20 sm:py-24 relative">
    <div className="container">
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl">
            Who Powers the <span className="text-gradient-violet">Network</span>
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            A multi-sided system where infrastructure, builders, holders, and integrators reinforce each other.
          </p>
        </Reveal>
      </div>

      <div className="mt-12 max-w-6xl mx-auto">
        <div className="md:hidden grid grid-cols-1 gap-4">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <Reveal key={it.title} delay={i * 0.08}>
                <div className="py-4 border-b border-border/70">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full border border-primary/35 bg-primary/10 grid place-items-center">
                      <Icon className="w-4 h-4 text-primary-glow" />
                    </div>
                    <h3 className="font-display font-semibold text-lg">{it.title}</h3>
                  </div>
                  <p className="mt-2 pl-12 text-sm text-muted-foreground">{it.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="hidden md:block relative h-[560px]">
          <div className="absolute inset-0 grid-pattern opacity-25 pointer-events-none" />

          {/* center hub */}
          <Reveal>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
              <div className="w-[190px] h-[190px] rounded-full bg-[radial-gradient(circle_at_30%_30%,hsl(264_90%_75%_/_0.35),hsl(240_40%_10%_/_0.95))] border border-primary/40 shadow-[0_0_60px_rgba(123,63,228,0.35)] grid place-items-center">
                <span className="font-display text-[1.7rem] text-gradient-violet italic">$LUVIA</span>
              </div>
              <div className="mt-4 text-xs uppercase tracking-[0.2em] text-foreground/65">
                Coordination Layer
              </div>
            </div>
          </Reveal>

          {/* connector lines */}
          <div className="absolute left-1/2 top-1/2 w-[47%] h-px bg-gradient-to-r from-primary/50 to-transparent -translate-y-1/2" />
          <div className="absolute right-1/2 top-1/2 w-[47%] h-px bg-gradient-to-l from-primary/50 to-transparent -translate-y-1/2" />
          <div className="absolute left-1/2 top-1/2 h-[44%] w-px bg-gradient-to-b from-accent/50 to-transparent" />
          <div className="absolute left-1/2 bottom-1/2 h-[44%] w-px bg-gradient-to-t from-accent/50 to-transparent" />

          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <Reveal key={it.title} delay={i * 0.08}>
                <div className={`absolute w-[300px] ${it.pos}`}>
                  <div className="inline-flex items-center gap-3 px-3.5 py-2.5 rounded-full border border-border/70 bg-card/60 backdrop-blur-md">
                    <div className="w-8 h-8 rounded-full border border-primary/30 bg-primary/10 grid place-items-center">
                      <Icon className="w-4 h-4 text-primary-glow" />
                    </div>
                    <div className="font-display text-base">{it.title}</div>
                  </div>
                  <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed pl-2">
                    {it.desc}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  </section>
);
