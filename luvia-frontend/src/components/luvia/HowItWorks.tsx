import { Reveal } from "./Reveal";

const steps = [
  { n: "01", title: "Request", desc: "Developer requests AI compute via LUVIA portal or API." },
  { n: "02", title: "Allocate", desc: "Allocation Engine assigns optimal node resources instantly." },
  { n: "03", title: "Pay", desc: "Payment locked and processed in LUVIA tokens." },
  { n: "04", title: "Distribute", desc: "Smart contracts distribute rewards to infrastructure providers." },
  { n: "05", title: "Stake", desc: "Stakers receive proportional share of network rewards." },
];

export const HowItWorks = () => (
  <section className="py-24 sm:py-32 relative">
    <div className="container">
      <div className="max-w-2xl">
        <Reveal>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl">
            Seamless. <span className="text-gradient-violet">Trustless.</span> Efficient.
          </h2>
        </Reveal>
      </div>

      <div className="mt-16 relative">
        <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="relative text-center lg:text-left">
                <div className="relative inline-flex">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-violet-cyan grid place-items-center font-display font-bold text-xl text-primary-foreground shadow-[0_0_30px_hsl(var(--violet)/0.5)]">
                    {s.n}
                  </div>
                </div>
                <h3 className="mt-5 font-display font-semibold text-xl">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </section>
);
