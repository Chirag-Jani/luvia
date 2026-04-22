import { Reveal } from "./Reveal";

const allocations = [
  { name: "Ecosystem Growth", pct: 30, amount: "3,000,000,000" },
  { name: "Infrastructure Rewards", pct: 25, amount: "2,500,000,000" },
  { name: "Public Sale", pct: 15, amount: "1,500,000,000" },
  { name: "Team", pct: 10, amount: "1,000,000,000" },
  { name: "Treasury", pct: 10, amount: "1,000,000,000" },
  { name: "Partnerships", pct: 5, amount: "500,000,000" },
  { name: "Community", pct: 5, amount: "500,000,000" },
];

export const Tokenomics = () => (
  <section id="tokenomics" className="py-24 sm:py-32 relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />

    <div className="container relative z-10">
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-tight">
            Fueling the <span className="text-gradient-violet italic">LUVIA</span> Ecosystem
          </h2>
        </Reveal>
      </div>

      {/* Top: two large summary cards */}
      <div className="mt-14 grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
        <Reveal>
          <div className="glass-card p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Max Supply</div>
              <div className="mt-3 font-bebas text-5xl sm:text-6xl tracking-wide text-gradient-violet">
                10,000,000,000
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="glass-card p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Token Ticker</div>
              <div className="mt-3 font-bebas text-5xl sm:text-6xl tracking-wide text-gradient-violet">
                $LUVIA
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Center: 3D coin */}
      <div className="my-16 sm:my-24 flex justify-center">
        <Reveal>
          <div className="luvia-coin" />
        </Reveal>
      </div>

      {/* Bottom: allocation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {allocations.slice(0, 3).map((a, i) => (
          <AllocationCard key={a.name} {...a} delay={i * 0.05} />
        ))}
      </div>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {allocations.slice(3).map((a, i) => (
          <AllocationCard key={a.name} {...a} delay={i * 0.05} />
        ))}
      </div>
    </div>
  </section>
);

const AllocationCard = ({ name, pct, amount, delay }: { name: string; pct: number; amount: string; delay: number }) => (
  <Reveal delay={delay}>
    <div className="glass-card glass-card-hover p-6 h-full flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <span className="font-display text-xl leading-tight">{name}</span>
        <span className="font-bebas text-3xl tracking-wide text-gradient-violet shrink-0">{pct}%</span>
      </div>
      <div className="mt-auto pt-8">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Tokens</div>
        <div className="mt-1 font-bebas text-3xl sm:text-4xl tracking-wide tabular-nums">
          {amount}
        </div>
      </div>
    </div>
  </Reveal>
);
