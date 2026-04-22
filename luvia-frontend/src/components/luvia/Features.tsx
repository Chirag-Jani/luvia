import { Reveal } from "./Reveal";
import { Zap, Lock, Globe, LineChart, Cpu, Vote } from "lucide-react";

const features = [
  { icon: Zap, title: "Instant Compute Access", desc: "Zero lock-in, pay-as-you-go pricing for any workload." },
  { icon: Lock, title: "Non-Custodial", desc: "Providers keep full control of their hardware at all times." },
  { icon: Globe, title: "Global Network", desc: "Multi-region distributed nodes for low-latency delivery." },
  { icon: LineChart, title: "Transparent Pricing", desc: "Real-time market-driven rates settled on-chain." },
  { icon: Cpu, title: "AI-First Architecture", desc: "Optimized routing for ML training and inference workloads." },
  { icon: Vote, title: "On-Chain Governance", desc: "Token holders vote on protocol upgrades and parameters." },
];

export const Features = () => (
  <section id="features" className="py-24 sm:py-32 relative">
    <div className="container">
      <div className="max-w-2xl">
        <Reveal>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl">
            Built for the <span className="text-gradient-violet">AI Economy</span>
          </h2>
        </Reveal>
      </div>

      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <Reveal key={f.title} delay={0.05 * i}>
              <div className="glass-card glass-card-hover p-7 h-full group">
                <div className="w-12 h-12 rounded-xl bg-gradient-violet-cyan/10 border border-primary/30 grid place-items-center group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-primary-glow" />
                </div>
                <h3 className="mt-5 font-display font-semibold text-xl">{f.title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);
