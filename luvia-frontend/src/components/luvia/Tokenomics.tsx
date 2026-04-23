import { Reveal } from "./Reveal";

const topAllocations = [
  { name: "Ecosystem Growth", pct: 30, amount: "3,000,000,000" },
  { name: "Infrastructure Rewards", pct: 25, amount: "2,500,000,000" },
  { name: "Public Sale", pct: 15, amount: "1,500,000,000" },
];

const bottomAllocations = [
  { name: "Team", pct: 10, amount: "1,000,000,000" },
  { name: "Treasury", pct: 10, amount: "1,000,000,000" },
  { name: "Partnerships", pct: 5, amount: "500,000,000" },
  { name: "Community", pct: 5, amount: "500,000,000" },
];

export const Tokenomics = () => (
  <section id="tokenomics" className="py-24 sm:py-32 relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[860px] h-[860px] bg-primary/10 rounded-full blur-[180px] pointer-events-none" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(264_70%_22%_/_0.28),transparent_65%)] pointer-events-none" />

    <div className="container relative z-10 max-w-6xl">
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight text-foreground">
            Fueling the <span className="text-gradient-violet italic">LUVIA</span> Ecosystem
          </h2>
        </Reveal>
      </div>

      <div className="mt-14 grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
        <Reveal>
          <div className="token-stat-card p-7 sm:p-9 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/25 rounded-full blur-3xl" />
            <div className="relative">
              <div className="text-[11px] uppercase tracking-[0.18em] text-foreground/65">Max Supply</div>
              <div className="mt-2 font-bebas text-4xl sm:text-[3.2rem] leading-none tracking-[0.01em] token-stat-value">
                10,000,000,000
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="token-stat-card p-7 sm:p-9 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-accent/25 rounded-full blur-3xl" />
            <div className="relative">
              <div className="text-[11px] uppercase tracking-[0.18em] text-foreground/65">Token Ticker</div>
              <div className="mt-2 font-bebas text-4xl sm:text-[3.2rem] leading-none tracking-[0.01em] token-stat-value-accent">
                $LUVIA
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="tokenomics-orbit-wrap mt-12 sm:mt-14 mb-14 sm:mb-16">
        <div className="tokenomics-mid-line" />
        <div className="tokenomics-orbit tokenomics-orbit-left" />
        <div className="tokenomics-orbit tokenomics-orbit-right" />
        <Reveal>
          <div className="luvia-coin-wrap">
            <img
              src="/luvia_logo.png"
              alt="LUVIA Logo"
              className="luvia-coin-logo"
              loading="lazy"
            />
          </div>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {topAllocations.map((a, i) => (
          <AllocationCard key={a.name} {...a} delay={i * 0.05} />
        ))}
      </div>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {bottomAllocations.map((a, i) => (
          <AllocationCard key={a.name} {...a} delay={i * 0.05} />
        ))}
      </div>
    </div>
  </section>
);

const AllocationCard = ({ name, pct, amount, delay }: { name: string; pct: number; amount: string; delay: number }) => (
  <Reveal delay={delay}>
    <div className="token-allocation-card glass-card-hover p-6 h-full flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <span className="font-display text-base sm:text-lg leading-tight text-foreground/90">{name}</span>
        <span className="font-bebas text-2xl tracking-wide text-primary/90 shrink-0">{pct}%</span>
      </div>
      <div className="mt-auto pt-8">
        <div className="text-[10px] uppercase tracking-[0.16em] text-foreground/60">Tokens</div>
        <div className="mt-1 font-bebas text-[1.85rem] sm:text-[2rem] leading-none tracking-[0.01em] tabular-nums text-foreground">
          {amount}
        </div>
      </div>
    </div>
  </Reveal>
);
