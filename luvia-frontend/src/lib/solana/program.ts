import { AnchorProvider, Program, type Wallet } from "@coral-xyz/anchor";
import {
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";

import idl from "@/idl/luvia_presale.json";
import type { LuviaPresale } from "@/idl/luvia_presale";

import { connection } from "./connection";

/**
 * A "read-only" wallet: we only need it to satisfy Anchor's `AnchorProvider`
 * constructor when doing pure account fetches. It will never sign anything —
 * buy transactions go through the connected Reown Solana provider directly.
 */
class ReadonlyWallet implements Wallet {
  readonly payer = Keypair.generate();
  readonly publicKey: PublicKey = this.payer.publicKey;

  async signTransaction<T extends Transaction | VersionedTransaction>(
    tx: T
  ): Promise<T> {
    return tx;
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(
    txs: T[]
  ): Promise<T[]> {
    return txs;
  }
}

const readonlyProvider = new AnchorProvider(
  connection,
  new ReadonlyWallet(),
  { commitment: "confirmed" }
);

/** Read-only Anchor program instance for account fetches. */
export const readonlyProgram = new Program<LuviaPresale>(
  idl as LuviaPresale,
  readonlyProvider
);

/**
 * Factory for a write-capable `Program` bound to a specific user wallet.
 * Used when building `buy_tokens` instructions (signing/sending still goes
 * through the connected Reown Solana provider, but Anchor needs a provider
 * to build the ix accounts / serialize args).
 */
export function buildProgramForWallet(wallet: Wallet): Program<LuviaPresale> {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  return new Program<LuviaPresale>(idl as LuviaPresale, provider);
}
