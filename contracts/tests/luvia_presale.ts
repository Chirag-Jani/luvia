/**
 * LUVIA presale — end-to-end tests.
 *
 * Designed to run via `anchor test` against a local validator that has the Pyth
 * solana-receiver program cloned from devnet (see [test.validator] in Anchor.toml).
 * The tests pull the latest SOL/USD price-update payload from Pyth's Hermes HTTP
 * service and post it to the local validator before each `buy_tokens` call.
 *
 * Requires network access for Hermes (https://hermes.pyth.network).
 */

import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
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
  getAssociatedTokenAddressSync,
  getAccount,
  mintTo,
  createAssociatedTokenAccountIdempotent,
  transferChecked,
} from "@solana/spl-token";
import { HermesClient } from "@pythnetwork/hermes-client";
import { PythSolanaReceiver } from "@pythnetwork/pyth-solana-receiver";
import { expect } from "chai";
import { LuviaPresale } from "../target/types/luvia_presale";

const SOL_USD_FEED_ID =
  "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
const TOKEN_DECIMALS = 9;
const DEC = 10n ** BigInt(TOKEN_DECIMALS);
const TOTAL_SUPPLY = 10_000_000_000n * DEC;
const PRESALE_ALLOCATION = 1_500_000_000n * DEC;
const PER_STAGE = 375_000_000n * DEC;

const PRESALE_SEED = Buffer.from("presale_config");
const TREASURY_SEED = Buffer.from("treasury");

describe("luvia_presale", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.luviaPresale as Program<LuviaPresale>;
  const connection = provider.connection;
  const admin = provider.wallet as anchor.Wallet;

  const buyer = Keypair.generate();

  let mint: PublicKey;
  let adminAta: PublicKey;
  let buyerAta: PublicKey;
  let presaleConfig: PublicKey;
  let treasury: PublicKey;
  let vault: PublicKey;

  const hermes = new HermesClient("https://hermes.pyth.network", {});
  const pythReceiver = new PythSolanaReceiver({
    connection,
    wallet: admin,
  });

  /** Fetch the latest SOL/USD update payload from Pyth Hermes. */
  async function fetchSolPriceUpdate(): Promise<string[]> {
    const res = await hermes.getLatestPriceUpdates([SOL_USD_FEED_ID], {
      encoding: "base64",
    });
    return res.binary.data;
  }

  /**
   * Build a single versioned transaction that (a) posts a fresh SOL/USD Pyth
   * price update and (b) calls `buy_tokens` consuming it. Returns the signatures.
   */
  async function postPriceAndBuy(solLamports: BN) {
    const priceUpdates = await fetchSolPriceUpdate();

    const txBuilder = pythReceiver.newTransactionBuilder({
      closeUpdateAccounts: true,
    });
    await txBuilder.addPostPriceUpdates(priceUpdates);
    await txBuilder.addPriceConsumerInstructions(
      async (getPriceUpdateAccount) => {
        const priceUpdateAccount = getPriceUpdateAccount(SOL_USD_FEED_ID);
        const ix = await program.methods
          .buyTokens(solLamports)
          .accountsStrict({
            buyer: buyer.publicKey,
            presaleConfig,
            treasury,
            tokenMint: mint,
            tokenVault: vault,
            buyerTokenAccount: buyerAta,
            pythPriceUpdate: priceUpdateAccount,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .instruction();
        return [{ instruction: ix, signers: [buyer] }];
      }
    );

    const txs = await txBuilder.buildVersionedTransactions({
      computeUnitPriceMicroLamports: 50_000,
    });
    return await pythReceiver.provider.sendAll(txs, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });
  }

  before(async () => {
    // --- Fund buyer with SOL (airdrop on localnet / devnet).
    const airdropSig = await connection.requestAirdrop(
      buyer.publicKey,
      5 * LAMPORTS_PER_SOL
    );
    const latest = await connection.getLatestBlockhash();
    await connection.confirmTransaction(
      { signature: airdropSig, ...latest },
      "confirmed"
    );

    // --- Create Token-2022 LUVIA mint with admin as authority.
    mint = await createMint(
      connection,
      admin.payer,
      admin.publicKey,
      admin.publicKey,
      TOKEN_DECIMALS,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    adminAta = await createAssociatedTokenAccountIdempotent(
      connection,
      admin.payer,
      mint,
      admin.publicKey,
      {},
      TOKEN_2022_PROGRAM_ID
    );
    await mintTo(
      connection,
      admin.payer,
      mint,
      adminAta,
      admin.publicKey,
      TOTAL_SUPPLY,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    // --- Derive PDAs.
    [presaleConfig] = PublicKey.findProgramAddressSync(
      [PRESALE_SEED],
      program.programId
    );
    [treasury] = PublicKey.findProgramAddressSync(
      [TREASURY_SEED],
      program.programId
    );
    vault = getAssociatedTokenAddressSync(
      mint,
      presaleConfig,
      true,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    buyerAta = getAssociatedTokenAddressSync(
      mint,
      buyer.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
  });

  it("initializes the presale", async () => {
    // pyth_price_update passed at init is a reference — actual buys accept any
    // Pyth price-update account that matches the SOL/USD feed id.
    const placeholderPyth = Keypair.generate().publicKey;

    const nowTs = Math.floor(Date.now() / 1000);

    await program.methods
      .initialize(
        admin.publicKey,
        new BN(nowTs - 3600),
        new BN(nowTs + 365 * 24 * 60 * 60),
        new BN(10_000_000)
      )
      .accountsStrict({
        initializer: admin.publicKey,
        presaleConfig,
        treasury,
        tokenMint: mint,
        tokenVault: vault,
        pythPriceUpdate: placeholderPyth,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const cfg = await program.account.presaleConfig.fetch(presaleConfig);
    expect(cfg.admin.toBase58()).to.eq(admin.publicKey.toBase58());
    expect(cfg.tokenMint.toBase58()).to.eq(mint.toBase58());
    expect(cfg.tokenVault.toBase58()).to.eq(vault.toBase58());
    expect(cfg.treasury.toBase58()).to.eq(treasury.toBase58());
    expect(cfg.currentStage).to.eq(0);
    expect(cfg.paused).to.eq(false);
    expect(cfg.totalTokensSold.toString()).to.eq("0");
    expect(cfg.totalSolRaised.toString()).to.eq("0");
    expect(cfg.stages.length).to.eq(4);

    expect(cfg.stages[0].priceMicroUsd.toNumber()).to.eq(4_000);
    expect(cfg.stages[1].priceMicroUsd.toNumber()).to.eq(6_000);
    expect(cfg.stages[2].priceMicroUsd.toNumber()).to.eq(9_000);
    expect(cfg.stages[3].priceMicroUsd.toNumber()).to.eq(12_000);
    for (const s of cfg.stages) {
      expect(s.allocation.toString()).to.eq(PER_STAGE.toString());
      expect(s.sold.toString()).to.eq("0");
    }

    // --- Fund the vault with the presale allocation.
    await transferChecked(
      connection,
      admin.payer,
      adminAta,
      mint,
      vault,
      admin.publicKey,
      PRESALE_ALLOCATION,
      TOKEN_DECIMALS,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    const vaultAcct = await getAccount(
      connection,
      vault,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    expect(vaultAcct.amount.toString()).to.eq(PRESALE_ALLOCATION.toString());
  });

  it("buys tokens with SOL via live Pyth price", async () => {
    const solAmount = new BN(0.1 * LAMPORTS_PER_SOL); // 0.1 SOL

    const treasuryBefore = await connection.getBalance(treasury);

    await postPriceAndBuy(solAmount);

    const buyerAcct = await getAccount(
      connection,
      buyerAta,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    const cfg = await program.account.presaleConfig.fetch(presaleConfig);
    const treasuryAfter = await connection.getBalance(treasury);

    expect(buyerAcct.amount > 0n).to.eq(true);
    expect(cfg.totalTokensSold.toString()).to.not.eq("0");
    expect(cfg.totalSolRaised.toString()).to.not.eq("0");
    expect(treasuryAfter).to.be.greaterThan(treasuryBefore);

    // At stage-1 price $0.004 with SOL ≈ $100–300, 0.1 SOL should buy somewhere
    // in the range of ~2.5k–7.5k LUVIA. Sanity-check we got at least 100 LUVIA.
    expect(buyerAcct.amount > 100n * DEC).to.eq(true);

    // Still in stage 0 after a small buy.
    expect(cfg.currentStage).to.eq(0);
    expect(cfg.stages[0].sold.toString()).to.eq(buyerAcct.amount.toString());
  });

  it("advances stage manually (admin)", async () => {
    const before = await program.account.presaleConfig.fetch(presaleConfig);
    const prevStage = before.currentStage;

    await program.methods
      .advanceStage()
      .accountsStrict({
        admin: admin.publicKey,
        presaleConfig,
      })
      .rpc();

    const after = await program.account.presaleConfig.fetch(presaleConfig);
    expect(after.currentStage).to.eq(prevStage + 1);
  });

  it("rejects advance_stage from a non-admin", async () => {
    let threw = false;
    try {
      await program.methods
        .advanceStage()
        .accountsStrict({
          admin: buyer.publicKey, // wrong signer
          presaleConfig,
        })
        .signers([buyer])
        .rpc();
    } catch (err) {
      threw = true;
    }
    expect(threw).to.eq(true);
  });

  it("pauses and blocks buys, then unpauses", async () => {
    await program.methods
      .pause()
      .accountsStrict({ admin: admin.publicKey, presaleConfig })
      .rpc();
    let cfg = await program.account.presaleConfig.fetch(presaleConfig);
    expect(cfg.paused).to.eq(true);

    let threw = false;
    try {
      await postPriceAndBuy(new BN(0.01 * LAMPORTS_PER_SOL));
    } catch (_e) {
      threw = true;
    }
    expect(threw).to.eq(true);

    await program.methods
      .unpause()
      .accountsStrict({ admin: admin.publicKey, presaleConfig })
      .rpc();
    cfg = await program.account.presaleConfig.fetch(presaleConfig);
    expect(cfg.paused).to.eq(false);
  });

  it("admin withdraws SOL from the treasury", async () => {
    const treasuryBalance = await connection.getBalance(treasury);
    expect(treasuryBalance).to.be.greaterThan(0);

    const rentExemptMin = await connection.getMinimumBalanceForRentExemption(0);
    const withdrawable = treasuryBalance - rentExemptMin;
    expect(withdrawable).to.be.greaterThan(0);

    const withdrawAmount = new BN(Math.floor(withdrawable / 2));
    const adminBefore = await connection.getBalance(admin.publicKey);

    await program.methods
      .withdrawSol(withdrawAmount)
      .accountsStrict({
        admin: admin.publicKey,
        presaleConfig,
        treasury,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const adminAfter = await connection.getBalance(admin.publicKey);
    const treasuryAfter = await connection.getBalance(treasury);

    expect(treasuryAfter).to.eq(treasuryBalance - withdrawAmount.toNumber());
    // Admin balance increases by withdrawal minus tx fee; net must be positive.
    expect(adminAfter).to.be.greaterThan(
      adminBefore + withdrawAmount.toNumber() - 0.01 * LAMPORTS_PER_SOL
    );
  });

  it("rejects withdraw_sol from a non-admin", async () => {
    let threw = false;
    try {
      await program.methods
        .withdrawSol(new BN(1_000))
        .accountsStrict({
          admin: buyer.publicKey,
          presaleConfig,
          treasury,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
    } catch (_err) {
      threw = true;
    }
    expect(threw).to.eq(true);
  });

  it("admin reclaims unsold tokens from the vault", async () => {
    const adminAtaBefore = await getAccount(
      connection,
      adminAta,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    const vaultBefore = await getAccount(
      connection,
      vault,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    expect(vaultBefore.amount > 0n).to.eq(true);

    // Withdraw half of the current vault balance.
    const halfBalance = vaultBefore.amount / 2n;

    await program.methods
      .withdrawUnsoldTokens(new BN(halfBalance.toString()))
      .accountsStrict({
        admin: admin.publicKey,
        presaleConfig,
        tokenMint: mint,
        tokenVault: vault,
        adminTokenAccount: adminAta,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const vaultAfter = await getAccount(
      connection,
      vault,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    const adminAtaAfter = await getAccount(
      connection,
      adminAta,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    expect(vaultAfter.amount.toString()).to.eq(
      (vaultBefore.amount - halfBalance).toString()
    );
    expect(adminAtaAfter.amount.toString()).to.eq(
      (adminAtaBefore.amount + halfBalance).toString()
    );

    // Now sweep whatever is left using the u64::MAX sentinel.
    const U64_MAX = new BN("18446744073709551615");
    await program.methods
      .withdrawUnsoldTokens(U64_MAX)
      .accountsStrict({
        admin: admin.publicKey,
        presaleConfig,
        tokenMint: mint,
        tokenVault: vault,
        adminTokenAccount: adminAta,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const vaultFinal = await getAccount(
      connection,
      vault,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    expect(vaultFinal.amount.toString()).to.eq("0");
  });

  it("rejects withdraw_unsold_tokens from a non-admin", async () => {
    const buyerOwnAta = getAssociatedTokenAddressSync(
      mint,
      buyer.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    let threw = false;
    try {
      await program.methods
        .withdrawUnsoldTokens(new BN(1))
        .accountsStrict({
          admin: buyer.publicKey,
          presaleConfig,
          tokenMint: mint,
          tokenVault: vault,
          adminTokenAccount: buyerOwnAta,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
    } catch (_err) {
      threw = true;
    }
    expect(threw).to.eq(true);
  });
});
