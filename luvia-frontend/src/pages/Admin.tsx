import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Coins,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { toast } from "sonner";

import { ConnectWalletButton } from "@/components/luvia/ConnectWalletButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { usePresaleState } from "@/hooks/usePresaleState";
import {
  advancePresaleStage,
  pausePresale,
  unpausePresale,
  withdrawPresaleSol,
  withdrawUnsoldTokens,
} from "@/lib/solana/admin";
import { connection } from "@/lib/solana/connection";

const BASE_UNIT_DIVISOR = 1_000_000_000;

const formatUi = (value: number, max = 2) =>
  value.toLocaleString("en-US", { maximumFractionDigits: max });

const formatCompact = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);

const Admin = () => {
  const { connected, publicKey, walletProvider } = useActiveWallet();
  const { data: presale, isLoading } = usePresaleState();
  const queryClient = useQueryClient();

  const [withdrawSolAmount, setWithdrawSolAmount] = useState("0.1");
  const [withdrawTokenAmount, setWithdrawTokenAmount] = useState("0");

  const isAdmin = Boolean(
    connected && publicKey && presale && publicKey.equals(presale.admin)
  );

  const { data: treasuryLamports } = useQuery<bigint>({
    queryKey: ["treasury-lamports", presale?.treasury.toBase58()],
    enabled: Boolean(presale?.treasury),
    queryFn: async () => {
      if (!presale?.treasury) return 0n;
      const lamports = await connection.getBalance(presale.treasury, "confirmed");
      return BigInt(lamports);
    },
    refetchInterval: 12_000,
    staleTime: 8_000,
  });

  const { data: treasuryRentExempt } = useQuery<number>({
    queryKey: ["treasury-rent-exempt"],
    queryFn: async () => connection.getMinimumBalanceForRentExemption(0),
    staleTime: 60_000,
  });

  const { data: tokenVaultUiBalance } = useQuery<number>({
    queryKey: ["token-vault-ui-balance", presale?.tokenVault.toBase58()],
    enabled: Boolean(presale?.tokenVault),
    queryFn: async () => {
      if (!presale?.tokenVault) return 0;
      const balance = await connection.getTokenAccountBalance(
        presale.tokenVault,
        "confirmed"
      );
      return Number(balance.value.uiAmountString ?? "0");
    },
    refetchInterval: 12_000,
    staleTime: 8_000,
  });

  const treasurySol = useMemo(
    () => Number(treasuryLamports ?? 0n) / LAMPORTS_PER_SOL,
    [treasuryLamports]
  );

  const withdrawableSol = useMemo(() => {
    const lamports = treasuryLamports ?? 0n;
    const rent = BigInt(treasuryRentExempt ?? 0);
    const free = lamports > rent ? lamports - rent : 0n;
    return Number(free) / LAMPORTS_PER_SOL;
  }, [treasuryLamports, treasuryRentExempt]);

  const totalSoldUi = useMemo(() => {
    if (!presale) return 0;
    return Number(presale.totalTokensSold) / BASE_UNIT_DIVISOR;
  }, [presale]);

  const totalRemainingUi = useMemo(() => {
    if (!presale) return 0;
    const remainingBase = presale.stages.reduce(
      (acc, stage) => acc + stage.remaining,
      0n
    );
    return Number(remainingBase) / BASE_UNIT_DIVISOR;
  }, [presale]);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["presale-state"] });
    void queryClient.invalidateQueries({ queryKey: ["treasury-lamports"] });
    void queryClient.invalidateQueries({ queryKey: ["token-vault-ui-balance"] });
  };

  const adminPause = useMutation({
    mutationFn: async () => {
      if (!publicKey || !isAdmin) throw new Error("Admin wallet required.");
      if (!walletProvider) throw new Error("Connect wallet first.");
      return pausePresale({ admin: publicKey, walletProvider });
    },
    onSuccess: () => refresh(),
  });

  const adminUnpause = useMutation({
    mutationFn: async () => {
      if (!publicKey || !isAdmin) throw new Error("Admin wallet required.");
      if (!walletProvider) throw new Error("Connect wallet first.");
      return unpausePresale({ admin: publicKey, walletProvider });
    },
    onSuccess: () => refresh(),
  });

  const adminAdvanceStage = useMutation({
    mutationFn: async () => {
      if (!publicKey || !isAdmin) throw new Error("Admin wallet required.");
      if (!walletProvider) throw new Error("Connect wallet first.");
      return advancePresaleStage({ admin: publicKey, walletProvider });
    },
    onSuccess: () => refresh(),
  });

  const adminWithdrawSol = useMutation({
    mutationFn: async () => {
      if (!publicKey || !isAdmin) throw new Error("Admin wallet required.");
      if (!walletProvider) throw new Error("Connect wallet first.");
      const solNum = parseFloat(withdrawSolAmount);
      if (!Number.isFinite(solNum) || solNum <= 0) {
        throw new Error("Enter valid SOL amount.");
      }
      const lamports = BigInt(Math.floor(solNum * LAMPORTS_PER_SOL));
      return withdrawPresaleSol({ admin: publicKey, walletProvider, lamports });
    },
    onSuccess: () => refresh(),
  });

  const adminWithdrawUnsold = useMutation({
    mutationFn: async () => {
      if (!publicKey || !isAdmin || !presale) {
        throw new Error("Admin wallet required.");
      }
      if (!walletProvider) throw new Error("Connect wallet first.");
      const trimmed = withdrawTokenAmount.trim().toLowerCase();
      const amount =
        trimmed === "all"
          ? BigInt("18446744073709551615")
          : BigInt(
              Math.max(0, Math.floor(Number(trimmed || "0") * BASE_UNIT_DIVISOR))
            );
      if (amount <= 0n) {
        throw new Error('Enter token amount or "all".');
      }
      return withdrawUnsoldTokens({
        admin: publicKey,
        walletProvider,
        tokenMint: presale.tokenMint,
        amount,
      });
    },
    onSuccess: () => refresh(),
  });

  const runAction = (
    label: string,
    action: {
      mutate: (
        vars: void,
        opts: { onSuccess: (sig: string) => void; onError: (e: Error) => void }
      ) => void;
    }
  ) => {
    const toastId = toast.loading(`${label} transaction...`);
    action.mutate(undefined, {
      onSuccess: (signature) => {
        toast.success(`${label} confirmed`, {
          id: toastId,
          description: `tx: ${signature.slice(0, 12)}...`,
        });
      },
      onError: (err) => {
        toast.error(`${label} failed`, {
          id: toastId,
          description: err.message,
        });
      },
    });
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container py-6 sm:py-8 space-y-6">
        <header className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <ConnectWalletButton size="default" variant="outline" />
        </header>

        <section className="glass-card p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl">Admin Console</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Wallet must match on-chain admin to execute privileged actions.
              </p>
            </div>
            {isLoading ? (
              <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
              </div>
            ) : isAdmin ? (
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))] text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" /> Verified Admin
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-destructive/15 text-destructive text-xs font-semibold">
                <ShieldAlert className="w-4 h-4" /> Access Denied
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div className="rounded-xl border border-border/70 bg-secondary/30 p-3">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Wallet
              </div>
              <div className="mt-1 break-all text-xs text-foreground/90">
                {publicKey ? publicKey.toBase58() : "Not connected"}
              </div>
            </div>
            <div className="rounded-xl border border-border/70 bg-secondary/30 p-3">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                On-Chain Admin
              </div>
              <div className="mt-1 break-all text-xs text-foreground/90">
                {presale ? presale.admin.toBase58() : "Loading..."}
              </div>
            </div>
            <div className="rounded-xl border border-border/70 bg-secondary/30 p-3">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Presale State
              </div>
              <div className="mt-1 text-foreground/90">
                {presale
                  ? `${presale.paused ? "Paused" : "Active"} • Stage ${presale.currentStage + 1}`
                  : "Loading..."}
              </div>
            </div>
            <div className="rounded-xl border border-border/70 bg-secondary/30 p-3">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Active Stage Price
              </div>
              <div className="mt-1 text-foreground/90">
                {presale?.activeStage ? `$${presale.activeStage.priceUsd.toFixed(3)}` : "Ended"}
              </div>
            </div>
          </div>
        </section>

        {isAdmin && presale && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-widest">
                  <Wallet className="w-4 h-4" /> Treasury Total
                </div>
                <div className="mt-2 font-bebas text-3xl tracking-wide">
                  {formatUi(treasurySol, 4)} SOL
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-widest">
                  <Wallet className="w-4 h-4" /> Withdrawable SOL
                </div>
                <div className="mt-2 font-bebas text-3xl tracking-wide">
                  {formatUi(withdrawableSol, 4)} SOL
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Excludes rent reserve.
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-widest">
                  <Coins className="w-4 h-4" /> Vault Balance
                </div>
                <div className="mt-2 font-bebas text-3xl tracking-wide">
                  {formatCompact(tokenVaultUiBalance ?? 0)} LUVIA
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Currently available to withdraw.
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-widest">
                  <Coins className="w-4 h-4" /> Sold / Remaining
                </div>
                <div className="mt-2 font-bebas text-3xl tracking-wide">
                  {formatCompact(totalSoldUi)} / {formatCompact(totalRemainingUi)}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">LUVIA</div>
              </div>
            </section>

            <section className="glass-card p-5 sm:p-6 space-y-5">
              <div>
                <h2 className="font-display text-2xl">Admin Controls</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage control actions, withdrawals, and stage analytics in one place.
                </p>
              </div>

              <Tabs defaultValue="controls" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="controls">Controls</TabsTrigger>
                  <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                  <TabsTrigger value="stages">Stage Data</TabsTrigger>
                </TabsList>

                <TabsContent value="controls" className="mt-4 space-y-4">
                  <div className="grid sm:grid-cols-4 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => runAction("Pause presale", adminPause)}
                      disabled={
                        presale.paused || adminPause.isPending || adminUnpause.isPending
                      }
                    >
                      Pause
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => runAction("Unpause presale", adminUnpause)}
                      disabled={
                        !presale.paused || adminPause.isPending || adminUnpause.isPending
                      }
                    >
                      Unpause
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => runAction("Advance stage", adminAdvanceStage)}
                      disabled={
                        adminAdvanceStage.isPending || presale.activeStage === null
                      }
                    >
                      Advance Stage
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => refresh()}
                      disabled={
                        adminPause.isPending ||
                        adminUnpause.isPending ||
                        adminAdvanceStage.isPending ||
                        adminWithdrawSol.isPending ||
                        adminWithdrawUnsold.isPending
                      }
                    >
                      Refresh State
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="withdrawals" className="mt-4 space-y-4">
                  <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">
                        Withdraw SOL
                      </label>
                      <Input
                        value={withdrawSolAmount}
                        onChange={(e) => setWithdrawSolAmount(e.target.value)}
                        className="mt-2"
                        placeholder="SOL amount"
                        type="number"
                        min="0"
                        step="0.01"
                      />
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        Available: {formatUi(withdrawableSol, 4)} SOL
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => runAction("Withdraw SOL", adminWithdrawSol)}
                      disabled={adminWithdrawSol.isPending}
                    >
                      Withdraw SOL
                    </Button>
                  </div>

                  <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">
                        Withdraw Unsold Tokens
                      </label>
                      <Input
                        value={withdrawTokenAmount}
                        onChange={(e) => setWithdrawTokenAmount(e.target.value)}
                        className="mt-2"
                        placeholder='LUVIA amount or "all"'
                      />
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        Available: {formatUi(tokenVaultUiBalance ?? 0, 2)} LUVIA
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => runAction("Withdraw unsold tokens", adminWithdrawUnsold)}
                      disabled={adminWithdrawUnsold.isPending}
                    >
                      Withdraw Tokens
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="stages" className="mt-4 space-y-4">
                  <div className="overflow-x-auto rounded-xl border border-border/70">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/40 text-muted-foreground">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium">Stage</th>
                          <th className="text-left px-3 py-2 font-medium">Price</th>
                          <th className="text-right px-3 py-2 font-medium">Allocation</th>
                          <th className="text-right px-3 py-2 font-medium">Sold</th>
                          <th className="text-right px-3 py-2 font-medium">Remaining</th>
                          <th className="text-right px-3 py-2 font-medium">Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {presale.stages.map((stage) => {
                          const allocationUi = Number(stage.allocation) / BASE_UNIT_DIVISOR;
                          const soldUi = Number(stage.sold) / BASE_UNIT_DIVISOR;
                          const remainingUi = Number(stage.remaining) / BASE_UNIT_DIVISOR;
                          const pct =
                            allocationUi > 0 ? (soldUi / allocationUi) * 100 : 0;
                          const isCurrent = presale.currentStage === stage.index;

                          return (
                            <tr
                              key={stage.index}
                              className={
                                isCurrent ? "bg-primary/10" : "border-t border-border/60"
                              }
                            >
                              <td className="px-3 py-2">Stage {stage.index + 1}</td>
                              <td className="px-3 py-2">${stage.priceUsd.toFixed(3)}</td>
                              <td className="px-3 py-2 text-right tabular-nums">
                                {formatUi(allocationUi, 0)}
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums">
                                {formatUi(soldUi, 0)}
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums">
                                {formatUi(remainingUi, 0)}
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums">
                                {Math.min(100, pct).toFixed(2)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default Admin;
