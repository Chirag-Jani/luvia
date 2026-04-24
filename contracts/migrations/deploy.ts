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
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  createAssociatedTokenAccountIdempotent,
  mintTo,
  getAssociatedTokenAddressSync,
  getAccount,
  transferChecked,
  setAuthority,
  AuthorityType,
} from "@solana/spl-token";
import { LuviaPresale } from "../target/types/luvia_presale";
import fs from "fs";
import path from "path";

// --- Config ---------------------------------------------------------------
const TOKEN_DECIMALS = 9;
const DECIMALS_POW = 10n ** BigInt(TOKEN_DECIMALS);
const TOTAL_SUPPLY = 10_000_000_000n * DECIMALS_POW;
const PRESALE_ALLOCATION = 1_500_000_000n * DECIMALS_POW; // 4 stages × 375M
const PRESALE_SEED = Buffer.from("presale_config");
const TREASURY_SEED = Buffer.from("treasury");
const MINT_KEYPAIR_PATH = path.resolve(__dirname, "./luvia-mint.json");

// SOL/USD price update account to register at init time. This defaults to the
// Pyth sponsored shard-0 account on devnet; swap to the mainnet equivalent when
// deploying to mainnet (feed id `0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d`).
// Override with env var `SOL_USD_PRICE_UPDATE` if you use a different shard.
const DEFAULT_SOL_USD_PRICE_UPDATE_DEVNET =
  "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE";

// Set RENOUNCE_MINT_AUTHORITY=true to make the supply permanently fixed after minting.
const RENOUNCE_MINT_AUTHORITY =
  (process.env.RENOUNCE_MINT_AUTHORITY ?? "false").toLowerCase() === "true";


// Optional: set a different admin than the deployer/initializer.
// If unset, deployer wallet becomes admin.
const INITIAL_ADMIN = process.env.INITIAL_ADMIN;

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

  console.log("== LUVIA presale deploy ==");
  console.log("cluster :", connection.rpcEndpoint);
  console.log("deployer:", deployer.publicKey.toBase58());
  console.log("admin   :", initialAdmin.toBase58());
  console.log("program :", program.programId.toBase58());

  const deployerBalance = await connection.getBalance(deployer.publicKey);
  console.log("deployer SOL:", deployerBalance / LAMPORTS_PER_SOL);
  if (deployerBalance < 0.5 * LAMPORTS_PER_SOL) {
    console.warn(
      "! deployer has less than 0.5 SOL — deploy / init may fail. Airdrop more before proceeding."
    );
  }

  // ------------------------------------------------------------------------
  // 1. Derive / create LUVIA Token-2022 mint. We persist the keypair locally
  //    so repeated runs don't create a fresh mint each time.
  // ------------------------------------------------------------------------
  let mintKp: Keypair;
  if (fs.existsSync(MINT_KEYPAIR_PATH)) {
    mintKp = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(fs.readFileSync(MINT_KEYPAIR_PATH, "utf-8")))
    );
    console.log("reusing mint keypair:", mintKp.publicKey.toBase58());
  } else {
    mintKp = Keypair.generate();
    fs.writeFileSync(
      MINT_KEYPAIR_PATH,
      JSON.stringify(Array.from(mintKp.secretKey))
    );
    console.log("created mint keypair:", mintKp.publicKey.toBase58());
  }

  const mintInfo = await connection.getAccountInfo(mintKp.publicKey);
  if (!mintInfo) {
    console.log("creating Token-2022 mint ...");
    await createMint(
      connection,
      deployer.payer,
      deployer.publicKey, // mint authority
      deployer.publicKey, // freeze authority (can be null; kept for emergency burn flows)
      TOKEN_DECIMALS,
      mintKp,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    console.log("  mint created:", mintKp.publicKey.toBase58());
  } else {
    console.log("  mint already exists, skipping creation");
  }

  // ------------------------------------------------------------------------
  // 2. Mint total supply to admin (idempotent: skips if supply already present).
  // ------------------------------------------------------------------------
  const adminAta = await createAssociatedTokenAccountIdempotent(
    connection,
    deployer.payer,
    mintKp.publicKey,
    deployer.publicKey,
    {},
    TOKEN_2022_PROGRAM_ID
  );
  const adminAtaInfo = await getAccount(
    connection,
    adminAta,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );
  if (adminAtaInfo.amount < TOTAL_SUPPLY) {
    const toMint = TOTAL_SUPPLY - adminAtaInfo.amount;
    console.log(`minting ${toMint} base units to admin ATA ${adminAta.toBase58()} ...`);
    await mintTo(
      connection,
      deployer.payer,
      mintKp.publicKey,
      adminAta,
      deployer.publicKey,
      toMint,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
  } else {
    console.log("  admin ATA already holds full supply, skipping mint");
  }

  // ------------------------------------------------------------------------
  // 3. Derive PDAs.
  // ------------------------------------------------------------------------
  const [presaleConfig] = PublicKey.findProgramAddressSync(
    [PRESALE_SEED],
    program.programId
  );
  const [treasury] = PublicKey.findProgramAddressSync(
    [TREASURY_SEED],
    program.programId
  );
  const vault = getAssociatedTokenAddressSync(
    mintKp.publicKey,
    presaleConfig,
    true, // allow owner off-curve (PDA)
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  console.log("presaleConfig:", presaleConfig.toBase58());
  console.log("treasury     :", treasury.toBase58());
  console.log("vault        :", vault.toBase58());

  // ------------------------------------------------------------------------
  // 4. Initialize the presale (idempotent via config existence check).
  // ------------------------------------------------------------------------
  const pythPriceUpdate = new PublicKey(
    process.env.SOL_USD_PRICE_UPDATE ?? DEFAULT_SOL_USD_PRICE_UPDATE_DEVNET
  );

  const existingConfig = await connection.getAccountInfo(presaleConfig);
  if (!existingConfig) {
    console.log("calling initialize ...");
    const sig = await program.methods
      .initialize(initialAdmin)
      .accountsStrict({
        initializer: deployer.publicKey,
        presaleConfig,
        treasury,
        tokenMint: mintKp.publicKey,
        tokenVault: vault,
        pythPriceUpdate,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("  initialize tx:", sig);
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
    TOKEN_2022_PROGRAM_ID
  );
  if (vaultAcct.amount < PRESALE_ALLOCATION) {
    const toTransfer = PRESALE_ALLOCATION - vaultAcct.amount;
    console.log(`transferring ${toTransfer} base units to vault ...`);
    await transferChecked(
      connection,
      deployer.payer,
      adminAta,
      mintKp.publicKey,
      vault,
      deployer.publicKey,
      toTransfer,
      TOKEN_DECIMALS,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    console.log("  vault funded");
  } else {
    console.log("  vault already holds full presale allocation, skipping");
  }

  // ------------------------------------------------------------------------
  // 6. (Optional) renounce mint authority so supply is permanently locked.
  // ------------------------------------------------------------------------
  if (RENOUNCE_MINT_AUTHORITY) {
    console.log("renouncing mint authority (supply becomes fixed forever) ...");
    await setAuthority(
      connection,
      deployer.payer,
      mintKp.publicKey,
      deployer.publicKey,
      AuthorityType.MintTokens,
      null,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID
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
    TOKEN_2022_PROGRAM_ID
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
        `alloc=${s.allocation.toString()}  sold=${s.sold.toString()}`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
