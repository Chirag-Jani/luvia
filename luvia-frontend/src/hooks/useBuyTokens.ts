import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { connection } from "@/lib/solana/connection";
import { buildBuyTokensTransactions } from "@/lib/solana/buyTokens";

import { useActiveWallet } from "./useActiveWallet";
import { usePresaleState } from "./usePresaleState";

interface BuyTokensInput {
  /** Amount of SOL to spend (as a regular decimal number — e.g. `0.5`). */
  solAmount: number;
}

interface BuyTokensResult {
  /** Base58 signature of the final `buy_tokens` transaction. */
  signature: string;
}

/**
 * Mutation hook: builds the Pyth-posting + `buy_tokens` transaction bundle,
 * partial-signs with the receiver's ephemeral keypairs, and hands it to the
 * user's Reown-connected Solana wallet to sign & send.
 */
export function useBuyTokens() {
  const { publicKey, walletProvider, connected } = useActiveWallet();
  const { data: presale } = usePresaleState();
  const queryClient = useQueryClient();

  return useMutation<BuyTokensResult, Error, BuyTokensInput>({
    mutationFn: async ({ solAmount }) => {
      if (!connected || !publicKey || !walletProvider) {
        throw new Error("Connect a Solana wallet before buying.");
      }
      if (!presale) {
        throw new Error("Presale state is still loading — try again.");
      }
      if (presale.paused) {
        throw new Error("The presale is currently paused.");
      }
      if (!presale.activeStage) {
        throw new Error("The presale has ended — all stages are sold out.");
      }
      if (!Number.isFinite(solAmount) || solAmount <= 0) {
        throw new Error("Enter a valid SOL amount.");
      }

      const solLamports = BigInt(Math.floor(solAmount * LAMPORTS_PER_SOL));
      if (solLamports <= 0n) {
        throw new Error("Amount too small — minimum is 1 lamport.");
      }

      const { transactions } = await buildBuyTokensTransactions({
        buyer: publicKey,
        solLamports,
        tokenMint: presale.tokenMint,
      });

      if (transactions.length === 0) {
        throw new Error("Failed to build transaction.");
      }

      let lastSignature = "";
      for (const tx of transactions) {
        const signature = await walletProvider.signAndSendTransaction(tx);
        await connection.confirmTransaction(signature, "confirmed");
        lastSignature = signature;
      }

      return { signature: lastSignature };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["presale-state"] });
    },
  });
}
