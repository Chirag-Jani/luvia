import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

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
      if (!(presale.tokenMint instanceof PublicKey)) {
        throw new Error(
          "Invalid on-chain config (token mint missing). Please refresh and retry."
        );
      }
      if (!Number.isFinite(solAmount) || solAmount <= 0) {
        throw new Error("Enter a valid SOL amount.");
      }

      const solLamports = BigInt(Math.floor(solAmount * LAMPORTS_PER_SOL));
      if (solLamports <= 0n) {
        throw new Error("Amount too small — minimum is 1 lamport.");
      }

      let transactions: Awaited<
        ReturnType<typeof buildBuyTokensTransactions>
      >["transactions"];
      try {
        const built = await buildBuyTokensTransactions({
          buyer: publicKey,
          solLamports,
          tokenMint: presale.tokenMint,
          adminWallet: presale.admin,
        });
        transactions = built.transactions;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown transaction build error";
        throw new Error(`Failed while building buy transaction: ${message}`);
      }

      if (transactions.length === 0) {
        throw new Error("Failed to build transaction.");
      }

      let signedTransactions = transactions;
      let usedBatchSigning = false;
      if (
        transactions.length > 1 &&
        typeof walletProvider.signAllTransactions === "function"
      ) {
        try {
          signedTransactions = await walletProvider.signAllTransactions(transactions);
          usedBatchSigning = true;
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Unknown batch signing error";
          throw new Error(`Failed while batch-signing buy transactions: ${message}`);
        }
      }

      let lastSignature = "";
      for (let i = 0; i < transactions.length; i += 1) {
        const tx = signedTransactions[i] ?? transactions[i];
        let signature = "";
        try {
          // Prefer already-signed txs (from signAllTransactions) to avoid
          // multiple wallet prompts; otherwise sign per tx as fallback.
          if (usedBatchSigning) {
            const raw = tx.serialize();
            signature = await connection.sendRawTransaction(raw, {
              skipPreflight: true,
              maxRetries: 0,
              preflightCommitment: "confirmed",
            });
          } else if (typeof walletProvider.signTransaction === "function") {
            const signed = await walletProvider.signTransaction(tx);
            const raw = signed.serialize();
            signature = await connection.sendRawTransaction(raw, {
              skipPreflight: true,
              maxRetries: 0,
              preflightCommitment: "confirmed",
            });
          } else {
            signature = await walletProvider.signAndSendTransaction(tx);
          }
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Unknown signing/sending error";
          throw new Error(`Failed while signing/sending buy transaction: ${message}`);
        }

        try {
          const { blockhash, lastValidBlockHeight } =
            await connection.getLatestBlockhash("confirmed");
          const res = await connection.confirmTransaction(
            { signature, blockhash, lastValidBlockHeight },
            "confirmed"
          );
          if (res.value.err) {
            throw new Error(
              `Transaction failed on-chain: ${JSON.stringify(res.value.err)}`
            );
          }
          lastSignature = signature;
        } catch (err) {
          try {
            const status = await connection.getSignatureStatus(signature, {
              searchTransactionHistory: true,
            });
            const s = status.value;
            if (
              s &&
              !s.err &&
              (s.confirmationStatus === "confirmed" ||
                s.confirmationStatus === "finalized")
            ) {
              lastSignature = signature;
              continue;
            }
          } catch {
            // fall through to rethrow below
          }
          const message =
            err instanceof Error ? err.message : "Unknown confirmation error";
          throw new Error(`Failed while confirming buy transaction: ${message}`);
        }
      }

      return { signature: lastSignature };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["presale-state"] });
    },
  });
}
