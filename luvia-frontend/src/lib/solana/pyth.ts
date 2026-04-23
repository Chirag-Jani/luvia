import { HermesClient } from "@pythnetwork/hermes-client";

import { HERMES_ENDPOINT, SOL_USD_FEED_ID } from "./config";

const hermes = new HermesClient(HERMES_ENDPOINT, {});

/**
 * Fetch the latest SOL/USD price update payload from Pyth Hermes. Returns the
 * base64-encoded VAA(s) ready to be posted via the Pyth Solana Receiver
 * program on-chain.
 */
export async function fetchLatestSolPriceUpdate(): Promise<string[]> {
  const res = await hermes.getLatestPriceUpdates([SOL_USD_FEED_ID], {
    encoding: "base64",
  });
  return res.binary.data;
}

/**
 * Lightweight "what is SOL worth right now in USD" used for the pay/receive
 * quote on the Buy page. Not used on-chain — the actual buy uses a fresh
 * update posted atomically with the buy ix.
 */
export async function fetchSolUsdPrice(): Promise<number> {
  const res = await hermes.getLatestPriceUpdates([SOL_USD_FEED_ID], {
    parsed: true,
  });
  const parsed = res.parsed?.[0]?.price;
  if (!parsed) throw new Error("Pyth returned no parsed SOL/USD price");
  const expo = parsed.expo;
  const raw = Number(parsed.price);
  return raw * Math.pow(10, expo);
}
