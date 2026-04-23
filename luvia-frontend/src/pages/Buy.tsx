import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, FileCheck2, Loader2, ShieldCheck, Zap } from "lucide-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConnectWalletButton } from "@/components/luvia/ConnectWalletButton";
import { Countdown } from "@/components/luvia/Countdown";
import { ParticleBg } from "@/components/luvia/ParticleBg";
import { Reveal } from "@/components/luvia/Reveal";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { useBuyTokens } from "@/hooks/useBuyTokens";
import { usePresaleState } from "@/hooks/usePresaleState";
import { useSolPrice } from "@/hooks/useSolPrice";
import { connection } from "@/lib/solana/connection";
import {
  PER_STAGE_ALLOCATION_UI,
  PRESALE_END_DATE,
  STAGE_PRICES_USD,
} from "@/lib/solana/config";

const BASE_UNIT_DIVISOR = 1_000_000_000;

const FALLBACK_STAGES = STAGE_PRICES_USD.map((price, i) => ({
  index: i,
  priceUsd: price,
  sold: 0n,
  allocation: BigInt(PER_STAGE_ALLOCATION_UI) * BigInt(BASE_UNIT_DIVISOR),
  remaining: BigInt(PER_STAGE_ALLOCATION_UI) * BigInt(BASE_UNIT_DIVISOR),
}));

/** Total USD a fully-sold presale would raise — used as the progress denominator. */
const TOTAL_PRESALE_USD_GOAL = STAGE_PRICES_USD.reduce(
  (acc, p) => acc + p * PER_STAGE_ALLOCATION_UI,
  0
);

const formatNumber = (n: number, opts?: Intl.NumberFormatOptions) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 0, ...opts });

const Buy = () => {
  const { connected, publicKey } = useActiveWallet();
  const { data: presale, isLoading: presaleLoading } = usePresaleState();
  const { data: solPriceUsd } = useSolPrice();
  const buy = useBuyTokens();
  const { data: walletSolBalance } = useQuery<number>({
    queryKey: ["wallet-sol-balance", publicKey?.toBase58()],
    enabled: Boolean(publicKey),
    queryFn: async () => {
      if (!publicKey) return 0;
      const lamports = await connection.getBalance(publicKey, "confirmed");
      return lamports / LAMPORTS_PER_SOL;
    },
    refetchInterval: 12_000,
    staleTime: 8_000,
    refetchOnWindowFocus: true,
  });

  const [sol, setSol] = useState("0.5");

  const endDate = useMemo(() => {
    if (PRESALE_END_DATE) {
      const d = new Date(PRESALE_END_DATE);
      if (!Number.isNaN(d.getTime())) return d;
    }
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d;
  }, []);

  const stages = presale?.stages ?? FALLBACK_STAGES;
  const activeStageIndex = presale?.currentStage ?? 0;
  const activeStage = presale?.activeStage ?? stages[0];
  const presaleEnded = presale?.activeStage === null;
  const paused = presale?.paused ?? false;
  const nextStage =
    !presaleEnded && activeStageIndex + 1 < stages.length
      ? stages[activeStageIndex + 1]
      : null;

  const tokenPriceUsd = activeStage?.priceUsd ?? STAGE_PRICES_USD[0];

  const tokensReceived = useMemo(() => {
    const solNum = parseFloat(sol) || 0;
    if (!solPriceUsd || solNum <= 0) return 0;
    return (solNum * solPriceUsd) / tokenPriceUsd;
  }, [sol, solPriceUsd, tokenPriceUsd]);

  const usdRaised = presale?.usdRaisedFromTokens ?? 0;
  const pct = Math.min(
    100,
    (usdRaised / TOTAL_PRESALE_USD_GOAL) * 100
  );

  const stageProgress = activeStage
    ? (Number(activeStage.sold) / Number(activeStage.allocation)) * 100
    : 0;

  const onBuy = () => {
    const solNum = parseFloat(sol);
    if (!Number.isFinite(solNum) || solNum <= 0) {
      toast.error("Enter a valid SOL amount.");
      return;
    }
    if (!connected || !publicKey) {
      toast.error("Connect a wallet first.");
      return;
    }

    const toastId = toast.loading("Building transaction…");

    buy.mutate(
      { solAmount: solNum },
      {
        onSuccess: ({ signature }) => {
          toast.success("Purchase confirmed!", {
            id: toastId,
            description: `tx: ${signature.slice(0, 12)}…`,
            duration: 8000,
          });
        },
        onError: (err) => {
          toast.error("Purchase failed", {
            id: toastId,
            description: err.message,
          });
        },
      }
    );
  };

  const disabled =
    buy.isPending ||
    presaleLoading ||
    presaleEnded ||
    paused ||
    (!!presale && !connected);

  return (
    <main className="min-h-screen lg:h-screen lg:overflow-hidden bg-background text-foreground overflow-x-hidden relative">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute inset-0">
        <ParticleBg />
      </div>
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-primary/15 rounded-full blur-[180px] pointer-events-none" />

      <div className="relative z-10">
        <header className="container py-4 lg:py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-violet-cyan grid place-items-center font-display italic text-primary-foreground shadow-[var(--shadow-glow)] text-lg">
              L
            </div>
            <span className="font-display text-2xl tracking-wide">LUVIA</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
            <ConnectWalletButton size="default" variant="outline" />
          </div>
        </header>

        <section className="container py-8 sm:py-10 lg:py-2 lg:h-[calc(100vh-84px)]">
          <div className="lg:origin-top lg:scale-[0.86] xl:scale-[0.92] 2xl:scale-100">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
                Buy <span className="text-gradient-violet italic">$LUVIA</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-3 text-base lg:text-[0.95rem] text-muted-foreground">
                {presaleEnded ? (
                  <>The presale has concluded — all stages sold out.</>
                ) : paused ? (
                  <>The presale is temporarily paused. Please check back soon.</>
                ) : (
                  <>
                    Secure your tokens during{" "}
                    <span className="text-foreground font-semibold">
                      Stage {activeStageIndex + 1}
                    </span>{" "}
                    before the price moves to the next tier.
                  </>
                )}
              </p>
            </Reveal>
          </div>

          <div className="mt-8 lg:mt-10 grid lg:grid-cols-2 gap-6 lg:gap-8 items-stretch lg:min-h-[560px]">
            {/* LEFT: stage info */}
            <Reveal className="h-full">
              <div className="space-y-4 h-full flex flex-col">
                <div className="glass-card p-5 sm:p-6 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">
                        Current Stage
                      </div>
                      <div className="mt-1 font-display text-2xl sm:text-3xl">
                        Stage {activeStageIndex + 1} —{" "}
                        <span className="text-gradient-violet italic">
                          {presaleEnded ? "Ended" : paused ? "Paused" : "Live"}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 ${
                        presaleEnded || paused
                          ? "bg-muted text-muted-foreground"
                          : "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          presaleEnded || paused
                            ? "bg-muted-foreground"
                            : "bg-[hsl(var(--success))] animate-pulse"
                        }`}
                      />
                      {presaleEnded ? "Ended" : paused ? "Paused" : "Live"}
                    </div>
                  </div>

                  <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
                    Presale Ends In
                  </div>
                  <div className="mt-3">
                    <Countdown endDate={endDate} />
                  </div>
                </div>

                <div className="glass-card p-5 sm:p-6 flex-1">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">
                        USD Raised
                      </div>
                      <div className="font-bebas text-3xl sm:text-4xl mt-1 tracking-wide">
                        ${formatNumber(usdRaised)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">
                        Goal
                      </div>
                      <div className="font-bebas text-xl sm:text-2xl mt-1 text-muted-foreground tracking-wide">
                        ${formatNumber(TOTAL_PRESALE_USD_GOAL)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 h-3 rounded-full bg-secondary overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-violet-cyan rounded-full relative animate-pulse-glow transition-[width] duration-500"
                      style={{ width: `${pct}%` }}
                    >
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"
                        style={{ backgroundSize: "200% 100%" }}
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>{pct.toFixed(2)}% Filled</span>
                    <span>
                      Stage {activeStageIndex + 1} of {stages.length}
                    </span>
                  </div>

                  {activeStage && !presaleEnded && (
                    <div className="mt-5 pt-4 border-t border-border/50">
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Current stage progress</span>
                        <span>{stageProgress.toFixed(2)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-primary/70 transition-[width] duration-500"
                          style={{ width: `${stageProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </Reveal>

            {/* RIGHT: purchase card */}
            <Reveal delay={0.15} className="h-full">
              <div className="glass-card p-5 sm:p-6 relative overflow-hidden h-full">
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-violet-cyan opacity-20 rounded-full blur-3xl" />
                <div className="relative h-full flex flex-col">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    Purchase $LUVIA
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-4">
                    <div className="font-display text-2xl">
                      Stage {activeStageIndex + 1} —{" "}
                      <span className="text-gradient-violet italic">
                        ${tokenPriceUsd.toFixed(3)}
                      </span>
                    </div>
                    {!presaleEnded && nextStage ? (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap">
                        <span>Stage {nextStage.index + 1}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span className="text-foreground/90">${nextStage.priceUsd.toFixed(3)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap">
                        <span>Listing</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span className="text-foreground/90">$0.018</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 space-y-3 flex-1">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">
                        You Pay
                      </label>
                      <div className="mt-2 relative">
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={sol}
                          onChange={(e) => setSol(e.target.value)}
                          className="h-14 !py-0 !text-[1.7rem] md:!text-[1.7rem] !leading-none font-bebas tracking-wide bg-secondary/50 border-border/60 pr-20 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          disabled={disabled && !connected ? false : buy.isPending}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-card border border-border text-sm font-semibold">
                          SOL
                        </div>
                      </div>
                      <div className="mt-1.5 text-[11px] text-muted-foreground">
                        Balance:{" "}
                        {connected && typeof walletSolBalance === "number"
                          ? `${walletSolBalance.toLocaleString("en-US", {
                              maximumFractionDigits: 4,
                            })} SOL`
                          : "—"}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">
                        You Receive
                      </label>
                      <div className="mt-2 h-14 px-4 rounded-md bg-secondary/30 border border-border/60 flex items-center justify-between">
                        <span className="text-[1.7rem] leading-none font-bebas tracking-wide text-gradient tabular-nums">
                          {formatNumber(tokensReceived)}
                        </span>
                        <span className="px-3 py-1.5 rounded-md bg-card border border-border text-sm font-semibold">
                          LUVIA
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-muted-foreground pt-1">
                      <span>
                        1 SOL ≈{" "}
                        {solPriceUsd
                          ? `$${formatNumber(solPriceUsd, {
                              maximumFractionDigits: 2,
                            })}`
                          : "—"}
                      </span>
                      <span>1 LUVIA = ${tokenPriceUsd.toFixed(3)}</span>
                    </div>
                  </div>

                  {connected ? (
                    <Button
                      variant="hero"
                      size="xl"
                      className="w-full mt-4"
                      disabled={disabled}
                      onClick={onBuy}
                    >
                      {buy.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />{" "}
                          Confirming…
                        </>
                      ) : presaleEnded ? (
                        "Presale Ended"
                      ) : paused ? (
                        "Presale Paused"
                      ) : (
                        <>Buy $LUVIA</>
                      )}
                    </Button>
                  ) : (
                    <ConnectWalletButton
                      size="xl"
                      variant="hero"
                      className="w-full mt-4"
                    />
                  )}

                  <p className="mt-3 text-[11px] text-muted-foreground text-center">
                    Tokens are delivered to your wallet in the same transaction.
                    Price is quoted live via Pyth at the moment of purchase.
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      { icon: ShieldCheck, label: "Non-Custodial" },
                      { icon: Zap, label: "Instant Distribution" },
                      { icon: FileCheck2, label: "Audited Contract" },
                    ].map((b) => (
                      <div
                        key={b.label}
                        className="rounded-xl bg-secondary/40 border border-border/60 p-2.5 flex flex-col items-center gap-1.5 text-center"
                      >
                        <b.icon className="w-4 h-4 text-primary-glow" />
                        <span className="text-[10px] sm:text-[11px] font-medium leading-tight">
                          {b.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Buy;
