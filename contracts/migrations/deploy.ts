/**
 * LUVIA presale — full deployment & initialization script.
 *
 * Usage:
 *   # make sure Anchor provider is set (Anchor.toml defaults to devnet)
 *   anchor build
 *   anchor deploy --provider.cluster devnet
 *   yarn run ts-node migrations/deploy.ts
 *
 * What it does:
 *   1. Loads the provider wallet as deployer/initializer.
 *   2. Creates a Token-2022 LUVIA mint (9 decimals) with the admin as the initial mint authority.
 *   3. Mints the full 10,000,000,000 LUVIA supply to the admin.
 *   4. Calls `initialize(initialAdmin)` on the presale program.
 *   5. Transfers 1,500,000,000 LUVIA (4 × 375M public-sale allocation) from admin → vault.
 *   6. (Optional) renounces mint authority so supply is fixed forever.
 *
 * After this script:
 *   - Remaining 8,500,000,000 LUVIA sits in the admin wallet (team / marketing / liquidity).
 *   - The presale vault holds exactly the public-sale allocation.
 *   - Presale is live (not paused, stage 0).
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  AuthorityType,
  createAssociatedTokenAccountIdempotent,
  createMint,
  getAccount,
  getAssociatedTokenAddressSync,
  mintTo,
  setAuthority,
  TOKEN_2022_PROGRAM_ID,
  transferChecked,
} from "@solana/spl-token";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import dotenv from "dotenv";
import fs from "fs";
import os from "os";
import path from "path";
import { LuviaPresale } from "../target/types/luvia_presale";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

/** Node does not expand `~` in paths; Anchor reads ANCHOR_WALLET via fs. */
function expandEnvPath(raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  const trimmed = raw.trim().replace(/^["']|["']$/g, "");
  if (trimmed.startsWith("~/")) {
    return path.join(os.homedir(), trimmed.slice(2));
  }
  if (trimmed === "~") {
    return os.homedir();
  }
  return trimmed;
}

const expandedWallet = expandEnvPath(process.env.ANCHOR_WALLET);
if (expandedWallet) {
  process.env.ANCHOR_WALLET = expandedWallet;
}

function envString(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : fallback;
}

function envOptionalString(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
}

function envNumber(name: string, fallback: number): number {
  const value = process.env[name]?.trim();
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${name} must be a valid number, got: ${value}`);
  }
  return parsed;
}

function envBigInt(name: string, fallback: bigint): bigint {
  const value = process.env[name]?.trim();
  if (!value) return fallback;
  try {
    return BigInt(value);
  } catch {
    throw new Error(`${name} must be a valid integer, got: ${value}`);
  }
}

function envBool(name: string, fallback: boolean): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  if (!value) return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${name} must be 'true' or 'false', got: ${value}`);
}

// --- Config ---------------------------------------------------------------
const TOKEN_DECIMALS = envNumber("TOKEN_DECIMALS", 9);
const DECIMALS_POW = 10n ** BigInt(TOKEN_DECIMALS);
const TOTAL_SUPPLY =
  envBigInt("TOTAL_SUPPLY_TOKENS", 10_000_000_000n) * DECIMALS_POW;
const PRESALE_ALLOCATION =
  envBigInt("PRESALE_ALLOCATION_TOKENS", 1_500_000_000n) * DECIMALS_POW; // 4 stages × 375M
const PRESALE_SEED = Buffer.from(envString("PRESALE_SEED", "presale_config"));
const TREASURY_SEED = Buffer.from(envString("TREASURY_SEED", "treasury"));
const MINT_KEYPAIR_PATH = path.resolve(
  __dirname,
  envString("MINT_KEYPAIR_PATH", "./luvia-mint.json"),
);

// SOL/USD price update account to register at init time. This defaults to the
// Pyth sponsored shard-0 account on devnet; swap to the mainnet equivalent when
// deploying to mainnet (feed id `0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d`).
// Override with env var `SOL_USD_PRICE_UPDATE` if you use a different shard.
const DEFAULT_SOL_USD_PRICE_UPDATE_DEVNET =
  "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE";

// Set RENOUNCE_MINT_AUTHORITY=true to make the supply permanently fixed after minting.
const RENOUNCE_MINT_AUTHORITY = envBool("RENOUNCE_MINT_AUTHORITY", false);
const SKIP_MINT_CREATION = envBool("SKIP_MINT_CREATION", false);
const SKIP_MINT_SUPPLY = envBool("SKIP_MINT_SUPPLY", false);
const SKIP_INITIALIZE = envBool("SKIP_INITIALIZE", false);
const SKIP_VAULT_FUND = envBool("SKIP_VAULT_FUND", false);

// Optional: set a different admin than the deployer/initializer.
// If unset, deployer wallet becomes admin.
const INITIAL_ADMIN = envOptionalString("INITIAL_ADMIN");
const EXISTING_TOKEN_MINT = envOptionalString("EXISTING_TOKEN_MINT");

const DEFAULT_PRESALE_START_TS = 1_777_262_400; // 2026-04-27 00:00 EDT
const DEFAULT_PRESALE_END_TS = 1_782_496_800; // 2026-06-26 14:00 EDT
const DEFAULT_MIN_PURCHASE_MICRO_USD = 10_000_000; // $10.00

// --------------------------------------------------------------------------

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.luviaPresale as Program<LuviaPresale>;
  const deployer = provider.wallet as anchor.Wallet;
  const connection = provider.connection;
  const initialAdmin = INITIAL_ADMIN
    ? new PublicKey(INITIAL_ADMIN)
    : deployer.publicKey;
  const presaleStartTs = Number(
    process.env.PRESALE_START_TS ?? DEFAULT_PRESALE_START_TS,
  );
  const presaleEndTs = Number(
    process.env.PRESALE_END_TS ?? DEFAULT_PRESALE_END_TS,
  );
  const minPurchaseMicroUsd = Number(
    process.env.MIN_PURCHASE_MICRO_USD ?? DEFAULT_MIN_PURCHASE_MICRO_USD,
  );

  console.log("== LUVIA presale deploy ==");
  console.log("cluster :", connection.rpcEndpoint);
  console.log("deployer:", deployer.publicKey.toBase58());
  console.log("admin   :", initialAdmin.toBase58());
  console.log("presale start:", presaleStartTs);
  console.log("presale end  :", presaleEndTs);
  console.log("min purchase :", minPurchaseMicroUsd, "micro-USD");
  console.log("program :", program.programId.toBase58());
  console.log("token decimals:", TOKEN_DECIMALS);
  console.log("total supply  :", TOTAL_SUPPLY.toString(), "base units");
  console.log("presale alloc :", PRESALE_ALLOCATION.toString(), "base units");
  console.log("mint keypair path:", MINT_KEYPAIR_PATH);
  if (EXISTING_TOKEN_MINT) {
    console.log("existing mint :", EXISTING_TOKEN_MINT);
  }

  const deployerBalance = await connection.getBalance(deployer.publicKey);
  console.log("deployer SOL:", deployerBalance / LAMPORTS_PER_SOL);
  if (deployerBalance < 0.5 * LAMPORTS_PER_SOL) {
    console.warn(
      "! deployer has less than 0.5 SOL — deploy / init may fail. Airdrop more before proceeding.",
    );
  }

  // ------------------------------------------------------------------------
  // 1. Derive / create LUVIA Token-2022 mint. We persist the keypair locally
  //    so repeated runs don't create a fresh mint each time.
  // ------------------------------------------------------------------------
  let mintPubkey: PublicKey;
  let mintSigner: Keypair | undefined;
  if (EXISTING_TOKEN_MINT) {
    mintPubkey = new PublicKey(EXISTING_TOKEN_MINT);
    console.log("using existing mint:", mintPubkey.toBase58());
  } else {
    if (fs.existsSync(MINT_KEYPAIR_PATH)) {
      mintSigner = Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(fs.readFileSync(MINT_KEYPAIR_PATH, "utf-8"))),
      );
      mintPubkey = mintSigner.publicKey;
      console.log("reusing mint keypair:", mintPubkey.toBase58());
    } else {
      mintSigner = Keypair.generate();
      mintPubkey = mintSigner.publicKey;
      fs.writeFileSync(
        MINT_KEYPAIR_PATH,
        JSON.stringify(Array.from(mintSigner.secretKey)),
      );
      console.log("created mint keypair:", mintPubkey.toBase58());
    }
  }

  const mintInfo = await connection.getAccountInfo(mintPubkey);
  if (!mintInfo) {
    if (SKIP_MINT_CREATION) {
      throw new Error(
        "SKIP_MINT_CREATION=true but mint does not exist on-chain. Set EXISTING_TOKEN_MINT or disable SKIP_MINT_CREATION.",
      );
    }
    if (!mintSigner) {
      throw new Error(
        "Mint signer not available. Do not set EXISTING_TOKEN_MINT when creating a new mint.",
      );
    }
    console.log("creating Token-2022 mint ...");
    await createMint(
      connection,
      deployer.payer,
      deployer.publicKey, // mint authority
      deployer.publicKey, // freeze authority (can be null; kept for emergency burn flows)
      TOKEN_DECIMALS,
      mintSigner,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );
    console.log("  mint created:", mintPubkey.toBase58());
  } else {
    console.log("  mint already exists, skipping creation");
  }

  // ------------------------------------------------------------------------
  // 2. Mint total supply to admin (idempotent: skips if supply already present).
  // ------------------------------------------------------------------------
  const adminAta = await createAssociatedTokenAccountIdempotent(
    connection,
    deployer.payer,
    mintPubkey,
    deployer.publicKey,
    {},
    TOKEN_2022_PROGRAM_ID,
  );
  const adminAtaInfo = await getAccount(
    connection,
    adminAta,
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );
  if (!SKIP_MINT_SUPPLY && adminAtaInfo.amount < TOTAL_SUPPLY) {
    const toMint = TOTAL_SUPPLY - adminAtaInfo.amount;
    console.log(
      `minting ${toMint} base units to admin ATA ${adminAta.toBase58()} ...`,
    );
    await mintTo(
      connection,
      deployer.payer,
      mintPubkey,
      adminAta,
      deployer.publicKey,
      toMint,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );
  } else {
    console.log("  mint skipped (already funded or SKIP_MINT_SUPPLY=true)");
  }

  // ------------------------------------------------------------------------
  // 3. Derive PDAs.
  // ------------------------------------------------------------------------
  const [presaleConfig] = PublicKey.findProgramAddressSync(
    [PRESALE_SEED],
    program.programId,
  );
  const [treasury] = PublicKey.findProgramAddressSync(
    [TREASURY_SEED],
    program.programId,
  );
  const vault = getAssociatedTokenAddressSync(
    mintPubkey,
    presaleConfig,
    true, // allow owner off-curve (PDA)
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  console.log("presaleConfig:", presaleConfig.toBase58());
  console.log("treasury     :", treasury.toBase58());
  console.log("vault        :", vault.toBase58());

  // ------------------------------------------------------------------------
  // 4. Initialize the presale (idempotent via config existence check).
  // ------------------------------------------------------------------------
  const pythPriceUpdate = new PublicKey(
    process.env.SOL_USD_PRICE_UPDATE ?? DEFAULT_SOL_USD_PRICE_UPDATE_DEVNET,
  );

  const existingConfig = await connection.getAccountInfo(presaleConfig);
  if (!SKIP_INITIALIZE && !existingConfig) {
    console.log("calling initialize ...");
    const sig = await program.methods
      .initialize(
        initialAdmin,
        new anchor.BN(presaleStartTs),
        new anchor.BN(presaleEndTs),
        new anchor.BN(minPurchaseMicroUsd),
      )
      .accountsStrict({
        initializer: deployer.publicKey,
        presaleConfig,
        treasury,
        tokenMint: mintPubkey,
        tokenVault: vault,
        pythPriceUpdate,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("  initialize tx:", sig);
  } else if (SKIP_INITIALIZE) {
    console.log("  skipping initialize (SKIP_INITIALIZE=true)");
  } else {
    console.log("  presale already initialized, skipping");
  }

  // ------------------------------------------------------------------------
  // 5. Fund the vault with the presale allocation (1.5B LUVIA).
  // ------------------------------------------------------------------------
  const vaultAcct = await getAccount(
    connection,
    vault,
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );
  if (!SKIP_VAULT_FUND && vaultAcct.amount < PRESALE_ALLOCATION) {
    const toTransfer = PRESALE_ALLOCATION - vaultAcct.amount;
    console.log(`transferring ${toTransfer} base units to vault ...`);
    await transferChecked(
      connection,
      deployer.payer,
      adminAta,
      mintPubkey,
      vault,
      deployer.publicKey,
      toTransfer,
      TOKEN_DECIMALS,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );
    console.log("  vault funded");
  } else {
    console.log("  vault funding skipped (already funded or SKIP_VAULT_FUND=true)");
  }

  // ------------------------------------------------------------------------
  // 6. (Optional) renounce mint authority so supply is permanently locked.
  // ------------------------------------------------------------------------
  if (RENOUNCE_MINT_AUTHORITY) {
    console.log("renouncing mint authority (supply becomes fixed forever) ...");
    if (!mintInfo && !mintSigner) {
      throw new Error(
        "Cannot renounce mint authority without mint signer. Provide mint keypair or keep RENOUNCE_MINT_AUTHORITY=false.",
      );
    }
    await setAuthority(
      connection,
      deployer.payer,
      mintPubkey,
      deployer.publicKey,
      AuthorityType.MintTokens,
      null,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );
    console.log("  mint authority renounced");
  }

  // ------------------------------------------------------------------------
  // Summary.
  // ------------------------------------------------------------------------
  const finalConfig = await program.account.presaleConfig.fetch(presaleConfig);
  const finalVault = await getAccount(
    connection,
    vault,
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );
  console.log("\n== deploy complete ==");
  console.log("config.admin         :", finalConfig.admin.toBase58());
  console.log("config.treasury      :", finalConfig.treasury.toBase58());
  console.log("config.token_mint    :", finalConfig.tokenMint.toBase58());
  console.log("config.token_vault   :", finalConfig.tokenVault.toBase58());
  console.log("config.pyth_feed     :", finalConfig.pythPriceUpdate.toBase58());
  console.log("config.current_stage :", finalConfig.currentStage);
  console.log("config.paused        :", finalConfig.paused);
  console.log("vault balance        :", finalVault.amount.toString());
  for (let i = 0; i < finalConfig.stages.length; i++) {
    const s = finalConfig.stages[i];
    console.log(
      `  stage ${i + 1}: $${(Number(s.priceMicroUsd) / 1e6).toFixed(3)}  ` +
        `alloc=${s.allocation.toString()}  sold=${s.sold.toString()}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
