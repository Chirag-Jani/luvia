import { Reveal } from "./Reveal";

const core = [
  "High-throughput blockchain settlement",
  "Immutable smart contracts",
  "Proprietary AI workload scheduler",
  "Distributed cryptographic node verification",
];
const infra = [
  "Enterprise GPU clusters (NVIDIA / AMD)",
  "Hybrid Edge + centralized data centers",
  "REST / SDK APIs",
  "CLI tools",
];

const Pill = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/40 border border-border/60 hover:border-primary/40 transition">
    <span className="w-2 h-2 rounded-full bg-gradient-violet-cyan" />
    <span className="text-sm">{children}</span>
  </div>
);

export const TechStack = () => (
  <section className="py-24 sm:py-32">
    <div className="container">
      <div className="max-w-2xl">
        <Reveal>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl">
            Built on Proven <span className="text-gradient-violet">Infrastructure</span>
          </h2>
        </Reveal>
      </div>

      <div className="mt-14 grid md:grid-cols-2 gap-6">
        <Reveal>
          <div className="glass-card p-7">
            <h3 className="font-display font-semibold text-xl">Core Tech</h3>
            <div className="mt-5 space-y-3">{core.map((c) => <Pill key={c}>{c}</Pill>)}</div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="glass-card p-7">
            <h3 className="font-display font-semibold text-xl">Infrastructure & Tools</h3>
            <div className="mt-5 space-y-3">{infra.map((c) => <Pill key={c}>{c}</Pill>)}</div>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);
