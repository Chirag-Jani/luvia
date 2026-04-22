import { Reveal } from "./Reveal";

const phases = [
  { n: 1, title: "Foundation", desc: "Core platform design, tokenomics finalization, early data center partnerships.", active: true },
  { n: 2, title: "MVP Launch", desc: "Basic compute marketplace, token deployment, first data center onboarding." },
  { n: 3, title: "Expansion", desc: "Advanced routing engine, AI workload optimization, global node expansion." },
  { n: 4, title: "Advanced Features", desc: "AI model marketplace, automated scaling, enterprise integrations." },
  { n: 5, title: "Ecosystem", desc: "Full developer platform, third-party integrations, network effects." },
];

export const Roadmap = () => (
  <section id="roadmap" className="py-24 sm:py-32">
    <div className="container">
      <div className="max-w-2xl">
        <Reveal>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl">
            The <span className="text-gradient-violet">Path Forward</span>
          </h2>
        </Reveal>
      </div>

      <div className="mt-16 relative">
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-border md:-translate-x-1/2" />

        <div className="space-y-10">
          {phases.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.08}>
              <div className={`relative grid md:grid-cols-2 gap-6 md:gap-12 items-center ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <div className={`pl-16 md:pl-0 ${i % 2 === 1 ? "md:text-left md:pl-12" : "md:text-right md:pr-12"}`}>
                  <div className="text-xs uppercase tracking-widest text-primary font-semibold">Phase {p.n}</div>
                  <h3 className="mt-1 font-display font-bold text-2xl">{p.title}</h3>
                  <p className="mt-2 text-muted-foreground">{p.desc}</p>
                </div>

                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-2">
                  <div className={`w-12 h-12 rounded-full grid place-items-center border-2 ${
                    p.active
                      ? "bg-gradient-violet-cyan border-primary text-primary-foreground glow-violet"
                      : "bg-card border-border text-muted-foreground"
                  }`}>
                    <span className="font-display font-bold">{p.n}</span>
                  </div>
                </div>

                <div className="hidden md:block" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </section>
);
