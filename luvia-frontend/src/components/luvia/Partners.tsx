import { Reveal } from "./Reveal";

const partners = ["NEXUS", "HELIX", "CIPHER", "ORION", "AXION", "VERTEX", "QUANTA", "NOVA"];

export const Partners = () => (
  <section className="py-24 sm:py-32">
    <div className="container">
      <Reveal>
        <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-center">
          Trusted by <span className="text-gradient-violet">industry leaders</span>
        </h2>
      </Reveal>
    </div>

    <div className="mt-16 relative overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

      <div className="flex gap-6 animate-marquee w-max">
        {[...partners, ...partners].map((p, i) => (
          <div
            key={i}
            className="shrink-0 w-48 h-24 rounded-2xl glass-card grid place-items-center"
          >
            <div className="text-center">
              <div className="font-display font-bold text-xl tracking-widest text-muted-foreground">{p}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mt-1">Partner</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
