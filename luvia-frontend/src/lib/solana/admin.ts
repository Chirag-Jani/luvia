import { BN } from "@coral-xyz/anchor";
import type { Wallet } from "@coral-xyz/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey, SystemProgram, Transaction, TransactionInstruction, VersionedTransaction } from "@solana/web3.js";

import { connection } from "./connection";
import { PRESALE_CONFIG_PDA, TREASURY_PDA } from "./pdas";
import { buildProgramForWallet } from "./program";

type SupportedTx = Transaction | VersionedTransaction;

export interface SolanaWalletProvider {
  signAndSendTransaction(tx: SupportedTx): Promise<string>;
}

function makeWalletShim(publicKey: PublicKey): Wallet {
  return {
    publicKey,
    signTransaction: async <T extends SupportedTx>(tx: T) => tx,
    signAllTransactions: async <T extends SupportedTx>(txs: T[]) => txs,
    payer: undefined as unknown as Wallet["payer"],
  };
}

async function sendAdminInstruction(params: {
  admin: PublicKey;
  walletProvider: SolanaWalletProvider;
  instruction: Promise<TransactionInstruction>;
}): Promise<string> {
  const { admin, walletProvider, instruction } = params;
  const tx = new Transaction().add(await instruction);
  tx.feePayer = admin;
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;

  const signature = await walletProvider.signAndSendTransaction(tx);
  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed"
  );
  return signature;
}

export async function pausePresale(params: {
  admin: PublicKey;
  walletProvider: SolanaWalletProvider;
}) {
  const { admin, walletProvider } = params;
  const program = buildProgramForWallet(makeWalletShim(admin));
  return sendAdminInstruction({
    admin,
    walletProvider,
    instruction: program.methods
      .pause()
      .accountsStrict({
        admin,
        presaleConfig: PRESALE_CONFIG_PDA,
      })
      .instruction(),
  });
}

export async function unpausePresale(params: {
  admin: PublicKey;
  walletProvider: SolanaWalletProvider;
}) {
  const { admin, walletProvider } = params;
  const program = buildProgramForWallet(makeWalletShim(admin));
  return sendAdminInstruction({
    admin,
    walletProvider,
    instruction: program.methods
      .unpause()
      .accountsStrict({
        admin,
        presaleConfig: PRESALE_CONFIG_PDA,
      })
      .instruction(),
  });
}

export async function advancePresaleStage(params: {
  admin: PublicKey;
  walletProvider: SolanaWalletProvider;
}) {
  const { admin, walletProvider } = params;
  const program = buildProgramForWallet(makeWalletShim(admin));
  return sendAdminInstruction({
    admin,
    walletProvider,
    instruction: program.methods
      .advanceStage()
      .accountsStrict({
        admin,
        presaleConfig: PRESALE_CONFIG_PDA,
      })
      .instruction(),
  });
}

export async function withdrawPresaleSol(params: {
  admin: PublicKey;
  walletProvider: SolanaWalletProvider;
  lamports: bigint;
}) {
  const { admin, walletProvider, lamports } = params;
  const program = buildProgramForWallet(makeWalletShim(admin));
  return sendAdminInstruction({
    admin,
    walletProvider,
    instruction: program.methods
      .withdrawSol(new BN(lamports.toString()))
      .accountsStrict({
        admin,
        presaleConfig: PRESALE_CONFIG_PDA,
        treasury: TREASURY_PDA,
        systemProgram: SystemProgram.programId,
      })
      .instruction(),
  });
}

export async function withdrawUnsoldTokens(params: {
  admin: PublicKey;
  walletProvider: SolanaWalletProvider;
  tokenMint: PublicKey;
  amount: bigint;
}) {
  const { admin, walletProvider, tokenMint, amount } = params;
  const program = buildProgramForWallet(makeWalletShim(admin));
  const tokenVault = getAssociatedTokenAddressSync(
    tokenMint,
    PRESALE_CONFIG_PDA,
    true,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const adminTokenAccount = getAssociatedTokenAddressSync(
    tokenMint,
    admin,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  return sendAdminInstruction({
    admin,
    walletProvider,
    instruction: program.methods
      .withdrawUnsoldTokens(new BN(amount.toString()))
      .accountsStrict({
        admin,
        presaleConfig: PRESALE_CONFIG_PDA,
        tokenMint,
        tokenVault,
        adminTokenAccount,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction(),
  });
}

export async function setMinimumPurchaseUsd(params: {
  admin: PublicKey;
  walletProvider: SolanaWalletProvider;
  minPurchaseUsd: number;
}) {
  const { admin, walletProvider, minPurchaseUsd } = params;
  const program = buildProgramForWallet(makeWalletShim(admin));
  const microUsd = BigInt(Math.floor(minPurchaseUsd * 1_000_000));
  if (microUsd <= 0n) throw new Error("Minimum purchase must be > 0");

  return sendAdminInstruction({
    admin,
    walletProvider,
    instruction: program.methods
      .setMinPurchase(new BN(microUsd.toString()))
      .accountsStrict({
        admin,
        presaleConfig: PRESALE_CONFIG_PDA,
      })
      .instruction(),
  });
}
