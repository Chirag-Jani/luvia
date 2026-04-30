import { PublicKey } from "@solana/web3.js";

import { PRESALE_CONFIG_PDA } from "./pdas";
import { readonlyProgram } from "./program";

export interface StageState {
  index: number;
  priceUsd: number;
  priceMicroUsd: bigint;
  allocation: bigint;
  sold: bigint;
  remaining: bigint;
}

export interface PresaleState {
  admin: PublicKey;
  treasury: PublicKey;
  tokenMint: PublicKey;
  tokenVault: PublicKey;
  pythPriceUpdate: PublicKey;
  currentStage: number;
  paused: boolean;
  totalTokensSold: bigint;
  totalSolRaised: bigint;
  minPurchaseUsd: number;
  presaleStartTs: number;
  presaleEndTs: number;
  stages: StageState[];
  /** Convenience: the `stages[currentStage]` entry, or `null` if presale ended. */
  activeStage: StageState | null;
  /** Cumulative USD value of tokens sold across all stages (based on stage prices). */
  usdRaisedFromTokens: number;
}

const MICRO_USD = 1_000_000;
const BASE_UNIT_DIVISOR = 1_000_000_000n; // 10^9

function pick<T = unknown>(obj: Record<string, unknown>, ...keys: string[]): T {
  for (const key of keys) {
    if (key in obj) return obj[key] as T;
  }
  throw new Error(`Missing expected field: ${keys.join(" or ")}`);
}

function asPublicKey(value: unknown, fieldName: string): PublicKey {
  if (value instanceof PublicKey) return value;
  if (typeof value === "string") return new PublicKey(value);
  if (
    value &&
    typeof value === "object" &&
    "toBase58" in value &&
    typeof (value as { toBase58?: unknown }).toBase58 === "function"
  ) {
    return new PublicKey((value as { toBase58: () => string }).toBase58());
  }
  throw new Error(`Invalid public key for field: ${fieldName}`);
}

export async function fetchPresaleState(): Promise<PresaleState> {
  const raw = (await readonlyProgram.account.presaleConfig.fetch(
    PRESALE_CONFIG_PDA
  )) as unknown as Record<string, unknown>;

  const rawStages = pick<unknown[]>(raw, "stages");
  const stages: StageState[] = rawStages.map((entry, i) => {
    const s = entry as Record<string, unknown>;
    const allocation = BigInt(pick(s, "allocation").toString());
    const sold = BigInt(pick(s, "sold").toString());
    const priceMicroUsd = BigInt(
      pick(s, "priceMicroUsd", "price_micro_usd").toString()
    );
    return {
      index: i,
      priceUsd: Number(priceMicroUsd) / MICRO_USD,
      priceMicroUsd,
      allocation,
      sold,
      remaining: allocation - sold,
    };
  });

  let usdRaisedMicro = 0n;
  for (const s of stages) {
    // Convert sold base-units -> token units using integer math and keep the
    // result in micro-USD to avoid floating-point drift/sticky updates.
    usdRaisedMicro += (s.sold * s.priceMicroUsd) / BASE_UNIT_DIVISOR;
  }

  const currentStage = Number(pick(raw, "currentStage", "current_stage"));
  const activeStage = currentStage < stages.length ? stages[currentStage] : null;

  return {
    admin: asPublicKey(pick(raw, "admin"), "admin"),
    treasury: asPublicKey(pick(raw, "treasury"), "treasury"),
    tokenMint: asPublicKey(pick(raw, "tokenMint", "token_mint"), "tokenMint"),
    tokenVault: asPublicKey(
      pick(raw, "tokenVault", "token_vault"),
      "tokenVault"
    ),
    pythPriceUpdate: asPublicKey(
      pick(raw, "pythPriceUpdate", "pyth_price_update"),
      "pythPriceUpdate"
    ),
    currentStage,
    paused: Boolean(pick(raw, "paused")),
    totalTokensSold: BigInt(
      pick(raw, "totalTokensSold", "total_tokens_sold").toString()
    ),
    totalSolRaised: BigInt(
      pick(raw, "totalSolRaised", "total_sol_raised").toString()
    ),
    minPurchaseUsd:
      Number(
        pick(raw, "minPurchaseMicroUsd", "min_purchase_micro_usd").toString()
      ) / MICRO_USD,
    presaleStartTs: Number(
      pick(raw, "presaleStartTs", "presale_start_ts").toString()
    ),
    presaleEndTs: Number(
      pick(raw, "presaleEndTs", "presale_end_ts").toString()
    ),
    stages,
    activeStage,
    usdRaisedFromTokens: Number(usdRaisedMicro) / MICRO_USD,
  };
}
