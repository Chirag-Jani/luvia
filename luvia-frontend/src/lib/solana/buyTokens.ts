import { BN } from "@coral-xyz/anchor";
import type { Wallet } from "@coral-xyz/anchor";
import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";

import { connection } from "./connection";
import { PRESALE_CONFIG_PDA, TREASURY_PDA } from "./pdas";
import { buildProgramForWallet } from "./program";

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
  pythPriceUpdate: PublicKey;
  adminWallet: PublicKey;
}): Promise<BuyTxBundle> {
  const { buyer, solLamports, tokenMint, pythPriceUpdate, adminWallet } = params;

  try {
    if (!(buyer instanceof PublicKey)) {
      throw new Error("Invalid buyer public key");
    }
    if (!(tokenMint instanceof PublicKey)) {
      throw new Error("Invalid token mint public key");
    }

    const walletShim = makeWalletShim(buyer);
    const program = buildProgramForWallet(walletShim);

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
    const buyIx = await program.methods
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

    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    const message = new TransactionMessage({
      payerKey: buyer,
      recentBlockhash: blockhash,
      instructions: [
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 }),
        ComputeBudgetProgram.setComputeUnitLimit({ units: 350_000 }),
        buyIx,
      ],
    }).compileToV0Message();

    return { transactions: [new VersionedTransaction(message)] };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`buyTokens builder failed: ${message}`);
  }
}
