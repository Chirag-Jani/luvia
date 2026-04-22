import { Reveal } from "./Reveal";
import { Brain, Zap, Rocket, Factory } from "lucide-react";

const items = [
  { icon: Brain, title: "AI Model Training", desc: "Large-scale GPU workloads for LLMs and foundational models." },
  { icon: Zap, title: "Inference Services", desc: "Real-time AI apps, chatbots, APIs with low latency." },
  { icon: Rocket, title: "AI Startups", desc: "Rapid scale without upfront infrastructure cost." },
  { icon: Factory, title: "Enterprises", desc: "Flexible scaling during peak computational demand." },
];

export const UseCases = () => (
  <section className="py-24 sm:py-32">
    <div className="container">
      <div className="max-w-2xl">
        <Reveal>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl">
            Powering the next generation of <span className="text-gradient-violet">AI</span>
          </h2>
        </Reveal>
      </div>

      <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <Reveal key={it.title} delay={i * 0.08}>
              <div className="glass-card glass-card-hover p-6 h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-violet-cyan/10 border border-primary/30 grid place-items-center">
                  <Icon className="w-5 h-5 text-primary-glow" />
                </div>
                <h3 className="mt-5 font-display font-semibold text-lg">{it.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);
