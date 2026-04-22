import { Reveal } from "./Reveal";
import { AnimatedNumber } from "./AnimatedNumber";

const stats = [
  { value: 10, suffix: "B", label: "Total Supply" },
  { value: 5, suffix: "", label: "Ecosystem Phases" },
  { value: 4, suffix: "", label: "Participant Types" },
];

export const About = () => (
  <section id="about" className="py-24 sm:py-32 relative">
    <div className="container">
      <div className="max-w-3xl">
        <Reveal>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
            A <span className="text-gradient-violet">unified ecosystem</span> for global AI compute
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            LUVIA is a decentralized infrastructure token designed to power, monetize, and optimize AI data center capacity globally. Data centers tokenize compute capacity, developers access AI compute on-demand, and revenue flows are distributed transparently.
          </p>
        </Reveal>
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={0.1 * i}>
            <div className="glass-card p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-violet-cyan opacity-0 group-hover:opacity-[0.05] transition-opacity" />
              <div className="font-display text-5xl sm:text-6xl font-bold text-gradient-violet">
                <AnimatedNumber value={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-3 text-muted-foreground uppercase tracking-widest text-xs">{s.label}</div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-16 h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  </section>
);
