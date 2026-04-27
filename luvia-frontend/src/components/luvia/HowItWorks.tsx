import { Reveal } from "./Reveal";

const steps = [
  {
    n: "01",
    title: "Connect Wallet",
    desc: "Investor connects a supported wallet (for example Phantom or other supported wallets).",
    lane: "Investor",
  },
  {
    n: "02",
    title: "Click Buy",
    desc: "Investor chooses the SOL amount and clicks Buy to start the purchase flow.",
    lane: "Action",
  },
  {
    n: "03",
    title: "Wallet Sends Transaction",
    desc: "The wallet signs and sends the transaction to the presale smart contract.",
    lane: "Wallet",
  },
  {
    n: "04",
    title: "Contract Executes",
    desc: "Contract receives funds, calculates token amount, sends tokens to investor, and routes 100% funds to the admin-designated treasury wallet path.",
    lane: "On-Chain",
  },
];

export const HowItWorks = () => (
  <section className="py-20 sm:py-24 relative">
    <div className="container">
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl">
            Seamless. <span className="text-gradient-violet">Trustless.</span> Efficient.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Simple investor purchase flow from wallet connection to on-chain settlement.
          </p>
        </Reveal>
      </div>

      <div className="mt-12 relative max-w-5xl mx-auto">
        <Reveal>
          <div className="rounded-3xl border border-primary/20 bg-[linear-gradient(180deg,hsl(240_25%_9%_/_0.88),hsl(240_24%_7%_/_0.82))] backdrop-blur-xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-primary/80 via-accent/75 to-primary/80" />

            <div className="grid grid-cols-4 gap-0 px-4 sm:px-7 py-4 border-b border-border/60 text-[10px] uppercase tracking-[0.2em] text-foreground/55">
              {steps.map((s) => (
                <div key={`head-${s.n}`} className="text-center">
                  {s.n}
                </div>
              ))}
            </div>

            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <div
                  className={`grid md:grid-cols-[76px_170px_1fr_120px] items-start gap-4 sm:gap-5 px-4 sm:px-7 py-4 sm:py-5 ${
                    i < steps.length - 1 ? "border-b border-border/55" : ""
                  }`}
                >
                  <div className="font-bebas text-3xl sm:text-[2rem] leading-none text-gradient-violet">
                    {s.n}
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-semibold leading-tight text-foreground">
                    {s.title}
                  </h3>

                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>

                  <div className="justify-self-start md:justify-self-end">
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em] border border-primary/35 bg-primary/10 text-primary-glow">
                      {s.lane}
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-4 text-center text-xs sm:text-sm text-muted-foreground">
            One investor flow. Four deterministic steps.
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);
