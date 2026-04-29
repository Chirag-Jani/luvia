import { BN } from "@coral-xyz/anchor";
import type { Wallet } from "@coral-xyz/anchor";
import { PythSolanaReceiver } from "@pythnetwork/pyth-solana-receiver";
import {
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
  type Signer,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";

import { SOL_USD_FEED_ID } from "./config";
import { connection } from "./connection";
import { PRESALE_CONFIG_PDA, TREASURY_PDA } from "./pdas";
import { buildProgramForWallet } from "./program";
import { fetchLatestSolPriceUpdate } from "./pyth";

export interface BuyTxBundle {
  transactions: VersionedTransaction[];
}

function makeWalletShim(publicKey: PublicKey): Wallet {
  return {
    publicKey,
    signTransaction: async <T extends Transaction | VersionedTransaction>(
      tx: T
    ) => tx,
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(
      txs: T[]
    ) => txs,
    payer: Keypair.generate(),
  };
}

export async function buildBuyTokensTransactions(params: {
  buyer: PublicKey;
  solLamports: bigint;
  tokenMint: PublicKey;
  adminWallet: PublicKey;
}): Promise<BuyTxBundle> {
  const { buyer, solLamports, tokenMint, adminWallet } = params;

  try {
    if (!(buyer instanceof PublicKey)) {
      throw new Error("Invalid buyer public key");
    }
    if (!(tokenMint instanceof PublicKey)) {
      throw new Error("Invalid token mint public key");
    }

    const walletShim = makeWalletShim(buyer);
    const program = buildProgramForWallet(walletShim);

    const priceUpdates = await fetchLatestSolPriceUpdate();
    if (!priceUpdates || priceUpdates.length === 0) {
      throw new Error("No Pyth price updates returned from Hermes");
    }

    const receiver = new PythSolanaReceiver({
      connection,
      wallet: walletShim,
    });

    const builder = receiver.newTransactionBuilder({
      // Reclaim rent from temporary Pyth update accounts in the same flow.
      // This reduces balance pressure and improves mobile wallet reliability.
      closeUpdateAccounts: true,
    });

    // Use fully verified posting on mainnet for better compatibility and
    // fewer `InstructionError: InvalidArgument` failures in wallet browsers.
    await builder.addPostPriceUpdates(priceUpdates);

    const tokenVault = getAssociatedTokenAddressSync(
      tokenMint,
      PRESALE_CONFIG_PDA,
      true,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    const buyerTokenAccount = getAssociatedTokenAddressSync(
      tokenMint,
      buyer,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    await builder.addPriceConsumerInstructions(async (getPriceUpdateAccount) => {
      let pythPriceUpdate: PublicKey;
      try {
        pythPriceUpdate = getPriceUpdateAccount(SOL_USD_FEED_ID);
      } catch {
        pythPriceUpdate = getPriceUpdateAccount(
          SOL_USD_FEED_ID.replace(/^0x/i, "")
        );
      }

      const ix = await program.methods
        .buyTokens(new BN(solLamports.toString()))
        .accountsStrict({
          buyer,
          presaleConfig: PRESALE_CONFIG_PDA,
          treasury: TREASURY_PDA,
          tokenMint,
          tokenVault,
          buyerTokenAccount,
          pythPriceUpdate,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .remainingAccounts([{ pubkey: adminWallet, isSigner: false, isWritable: true }])
        .instruction();
      return [{ instruction: ix, signers: [] }];
    });

    const built = await builder.buildVersionedTransactions({
      computeUnitPriceMicroLamports: 50_000,
      // Keep generous CU budget because `buy_tokens` can trigger ATA creation
      // (`init_if_needed`) for first-time buyers.
      tightComputeBudget: false,
    });

    const transactions: VersionedTransaction[] = built.map(
      ({ tx, signers }: { tx: VersionedTransaction; signers: Signer[] }) => {
        if (signers.length > 0) tx.sign(signers);
        return tx;
      }
    );

    if (transactions.length === 0) {
      throw new Error("Pyth builder returned zero transactions");
    }
    return { transactions };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`buyTokens builder failed: ${message}`);
  }
}
