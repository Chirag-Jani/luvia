import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "./config";

const PRESALE_SEED = new TextEncoder().encode("presale_config");
const TREASURY_SEED = new TextEncoder().encode("treasury");

export const [PRESALE_CONFIG_PDA] = PublicKey.findProgramAddressSync(
  [PRESALE_SEED],
  PROGRAM_ID
);

export const [TREASURY_PDA] = PublicKey.findProgramAddressSync(
  [TREASURY_SEED],
  PROGRAM_ID
);
