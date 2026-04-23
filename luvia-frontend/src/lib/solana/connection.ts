import { Connection } from "@solana/web3.js";
import { RPC_ENDPOINT } from "./config";

/**
 * Shared `Connection` for all on-chain reads. We default to `confirmed`
 * commitment — good balance between latency and safety for presale UI reads.
 */
export const connection = new Connection(RPC_ENDPOINT, {
  commitment: "confirmed",
  confirmTransactionInitialTimeout: 60_000,
});
