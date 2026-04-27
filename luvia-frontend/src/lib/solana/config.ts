import { PublicKey, clusterApiUrl } from "@solana/web3.js";

const envOrUndefined = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  return v.length > 0 ? v : undefined;
};

/**
 * Environment-driven Solana config. All values are safe to expose in the client
 * bundle (they are public network identifiers).
 */
const rawCluster = envOrUndefined(import.meta.env.VITE_SOLANA_CLUSTER);
export const CLUSTER = (
  rawCluster === "mainnet-beta" ? "mainnet-beta" : "devnet"
) as "devnet" | "mainnet-beta";

export const RPC_ENDPOINT =
  envOrUndefined(import.meta.env.VITE_SOLANA_RPC_URL) ?? clusterApiUrl(CLUSTER);

export const PROGRAM_ID = new PublicKey(
  envOrUndefined(import.meta.env.VITE_LUVIA_PROGRAM_ID) ??
    "Fxgt8HY2fgnhef62Sx6HUowLh6uQti6dpe6rJmUV5qGP"
);

/**
 * Pyth SOL/USD pull-oracle feed id. Same on devnet and mainnet-beta. The
 * program validates this on every buy so it cannot be spoofed from the client.
 */
export const SOL_USD_FEED_ID =
  "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";

/** Hermes endpoint (Pyth-hosted) for fetching latest price updates. */
export const HERMES_ENDPOINT =
  envOrUndefined(import.meta.env.VITE_HERMES_ENDPOINT) ??
  "https://hermes.pyth.network";

/** LUVIA token always has 9 decimals (hardcoded in the program). */
export const TOKEN_DECIMALS = 9;
export const BASE_UNIT_DIVISOR = 1_000_000_000;

/** Pyth receiver program id (same on devnet + mainnet). */
export const PYTH_RECEIVER_PROGRAM_ID = new PublicKey(
  "rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ"
);

/** Stage metadata hardcoded in the program (order matters). */
export const STAGE_PRICES_USD = [0.01, 0.015, 0.02, 0.025] as const;
export const LISTING_PRICE_USD = 0.1;
export const FUNDRAISING_GOAL_USD = 6_000_000;
export const SEEDED_RAISED_USD = 268_000;
export const PRESALE_FALLBACK_DAYS = 40;
export const CONTACT_EMAIL = "Info@luvia.exchange";

/** Per-stage allocation (375M LUVIA) — hardcoded in the program. */
export const PER_STAGE_ALLOCATION_UI = 375_000_000;
export const MIN_PURCHASE_USD = 10;

/**
 * Optional presale end date. If unset the UI falls back to now + configured days.
 * Accepts any value parseable by `new Date(...)` (ISO 8601 recommended).
 */
export const PRESALE_END_DATE = envOrUndefined(
  import.meta.env.VITE_PRESALE_END_DATE
);
