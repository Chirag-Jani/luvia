import { PublicKey } from "@solana/web3.js";

import { PRESALE_CONFIG_PDA } from "./pdas";
import { readonlyProgram } from "./program";

export interface StageState {
  index: number;
  priceUsd: number;
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
  stages: StageState[];
  /** Convenience: the `stages[currentStage]` entry, or `null` if presale ended. */
  activeStage: StageState | null;
  /** Cumulative USD value of tokens sold across all stages (based on stage prices). */
  usdRaisedFromTokens: number;
}

const MICRO_USD = 1_000_000;
const BASE_UNIT_DIVISOR = 1_000_000_000; // 10^9

export async function fetchPresaleState(): Promise<PresaleState> {
  const raw = await readonlyProgram.account.presaleConfig.fetch(
    PRESALE_CONFIG_PDA
  );

  const stages: StageState[] = raw.stages.map((s, i) => {
    const allocation = BigInt(s.allocation.toString());
    const sold = BigInt(s.sold.toString());
    return {
      index: i,
      priceUsd: s.priceMicroUsd.toNumber() / MICRO_USD,
      allocation,
      sold,
      remaining: allocation - sold,
    };
  });

  let usdRaised = 0;
  for (const s of stages) {
    const soldUi = Number(s.sold) / BASE_UNIT_DIVISOR;
    usdRaised += soldUi * s.priceUsd;
  }

  const activeStage =
    raw.currentStage < stages.length ? stages[raw.currentStage] : null;

  return {
    admin: raw.admin,
    treasury: raw.treasury,
    tokenMint: raw.tokenMint,
    tokenVault: raw.tokenVault,
    pythPriceUpdate: raw.pythPriceUpdate,
    currentStage: raw.currentStage,
    paused: raw.paused,
    totalTokensSold: BigInt(raw.totalTokensSold.toString()),
    totalSolRaised: BigInt(raw.totalSolRaised.toString()),
    stages,
    activeStage,
    usdRaisedFromTokens: usdRaised,
  };
}
