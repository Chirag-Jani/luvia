# LUVIA Presale

Production-ready Solana Anchor program for the LUVIA token public sale.

- 4-stage bonding-curve presale with hardcoded prices ($0.004 → $0.006 → $0.009 → $0.012)
- SOL payments, live SOL/USD priced via Pyth pull oracle, tokens delivered instantly
- Token-2022 (SPL Token Extensions) mint, 9 decimals
- All SOL custodied in a program-owned treasury PDA (not a wallet) — admin withdraws via signed CPI
- Admin-only pause, manual stage advance, SOL withdraw, and unsold-token reclaim

---

## Token specification

| Field | Value |
|---|---|
| Name | LUVIA |
| Standard | SPL Token-2022 |
| Decimals | 9 |
| Total supply | 10,000,000,000 LUVIA |
| Presale allocation | 1,500,000,000 LUVIA (15% — 4 × 375M) |
| Non-presale allocation | 8,500,000,000 LUVIA (85% — admin wallet: team, marketing, liquidity, reserves) |

The mint is created externally in the deploy script with the admin as mint authority. You can permanently renounce mint authority (`RENOUNCE_MINT_AUTHORITY=true yarn deploy`) so supply is forever fixed at 10B.

---

## Presale stages

| Stage | Price (USD) | Allocation | Cumulative |
|---|---|---|---|
| 1 | $0.004 | 375,000,000 | 375,000,000 |
| 2 | $0.006 | 375,000,000 | 750,000,000 |
| 3 | $0.009 | 375,000,000 | 1,125,000,000 |
| 4 | $0.012 | 375,000,000 | 1,500,000,000 |

**Auto-advance:** when a stage sells its full allocation, the program increments `current_stage` in the same transaction. A single large buy can straddle multiple stages at their respective prices.

**Manual advance:** admin can call `advance_stage` to skip to the next stage before the current one is full (e.g. for a timed flash-sale cutoff). Unsold tokens from a skipped stage remain in the vault and can be reclaimed via `withdraw_unsold_tokens`.

---

## Architecture

### Program

- Crate: `programs/luvia_presale`
- Default program ID: `H6DXYanZ9uiDsUqwsXu7GKNH1E1WHdqKoJr9JqqzA8cP`
- Framework: Anchor 0.31.1

### PDAs

| PDA | Seeds | Purpose |
|---|---|---|
| `presale_config` | `[b"presale_config"]` | Program state (admin, mint, vault, stages, flags) |
| `treasury` | `[b"treasury"]` | System-owned account that accumulates purchase SOL |

### Token accounts

| Account | Owner | Purpose |
|---|---|---|
| `token_vault` | `presale_config` PDA (ATA) | Holds presale tokens; source of all `buy_tokens` transfers |
| `buyer_token_account` | Buyer (ATA) | Auto-created on first buy if absent |
| `admin_token_account` | Admin (ATA) | Destination for `withdraw_unsold_tokens` |

### Pyth oracle

- Uses the **pull oracle** model (Pyth Solana Receiver program `rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ`).
- SOL/USD feed id: `0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d`.
- The frontend posts a fresh `PriceUpdateV2` account alongside each `buy_tokens` call (via `@pythnetwork/pyth-solana-receiver` + Hermes).
- The program validates the account's owner, Anchor discriminator, feed id, and staleness (max 60 s). Any valid account for the SOL/USD feed is accepted — the reference stored in `presale_config` is informational only.

> **Why we vendor the Pyth reader.** The Rust `pyth-solana-receiver-sdk` crate versions that match Anchor 0.31.1 either pull in `solana-program 4.x` (incompatible with Anchor's `2.3.x`) or pull in crates requiring Rust edition 2024 (not supported by the Solana BPF toolchain). We ship a ~120-line self-contained `PriceUpdateV2` byte-parser in [`programs/luvia_presale/src/pyth.rs`](programs/luvia_presale/src/pyth.rs) instead. The on-chain layout has been stable since the pull oracle launched.

---

## Instructions

All signatures are simplified — see `programs/luvia_presale/src/lib.rs` for the full accounts structs.

### `initialize()`

One-time setup. Creates `presale_config`, `treasury`, and `token_vault`. Writes the hardcoded stage table. Requires the mint to be Token-2022 with 9 decimals.

**Signer:** admin (also the payer for all account rent)
**Emits:** `PresaleInitialized`

### `buy_tokens(sol_amount: u64)`

User pays SOL, receives LUVIA. Behavior:

1. Rejects if `paused`, `current_stage >= 4`, or `sol_amount == 0`.
2. Reads SOL/USD from the provided Pyth `PriceUpdateV2` account. Verifies owner, discriminator, feed id, and `publish_time` within 60 s.
3. Normalizes price to micro-USD per SOL.
4. Walks stages from `current_stage`, filling each with the portion of SOL it can absorb at that stage's price, up to the stage's remaining allocation. Rolls over to the next stage automatically.
5. Any SOL left after all stages are sold out is **not** transferred (buyer keeps it).
6. SOL → `treasury` PDA; LUVIA → buyer's ATA (init-if-needed).
7. Updates `stages[*].sold`, auto-advances `current_stage` past any newly-filled stages, updates cumulative counters.

**Signer:** buyer
**Emits:** `TokensPurchased { buyer, sol_spent, tokens_received, stage_at_purchase, stage_after }`

### `advance_stage()`

Manually bumps `current_stage` by 1. Rejects at stage 4 (`AlreadyFinalStage`).

**Signer:** admin
**Emits:** `StageAdvanced { previous_stage, new_stage, manual: true }`

### `pause()` / `unpause()`

Toggles `presale_config.paused`. `buy_tokens` fails with `PresalePaused` while true; other admin operations unaffected.

**Signer:** admin
**Emits:** `PausedChanged { paused }`

### `withdraw_sol(amount: u64)`

Signed system-program CPI from the `treasury` PDA to the admin wallet. Always leaves the rent-exempt minimum behind so the treasury account stays alive for future deposits.

**Signer:** admin
**Emits:** `SolWithdrawn { admin, amount }`

### `withdraw_unsold_tokens(amount: u64)`

Admin reclaims LUVIA from the vault — either mid-presale (after pausing / skipping a stage) or after the final stage ends partially sold. Pass `u64::MAX` to sweep the entire current vault balance.

**Signer:** admin
**Emits:** `UnsoldTokensWithdrawn { admin, destination, amount, vault_remaining }`

> Admin is responsible for not draining tokens committed to an active stage. The recommended mid-presale pattern is: `pause → withdraw_unsold_tokens → unpause` (or re-fund the vault if buys should resume).

---

## Errors

| Code | Meaning |
|---|---|
| `PresalePaused` | Buys blocked by admin pause |
| `StageSoldOut` | (reserved — all path-through checks use `PresaleEnded` / stage walk) |
| `InsufficientSol` | SOL amount too small to buy any whole token base unit |
| `PresaleEnded` | All 4 stages fully sold / advanced past |
| `InvalidAmount` | `amount == 0` |
| `Unauthorized` | Non-admin attempted an admin instruction |
| `MathOverflow` | u128 arithmetic overflowed |
| `InvalidPriceFeed` | Pyth account wrong owner / wrong discriminator / wrong feed id / stale |
| `NegativePrice` | Pyth reported `price <= 0` |
| `InsufficientVaultBalance` | Vault doesn't have enough tokens |
| `AlreadyFinalStage` | `advance_stage` called at stage 4 |
| `InsufficientTreasuryBalance` | `withdraw_sol` amount exceeds `treasury - rent-exempt` |
| `InvalidMint` / `InvalidVault` | Passed-in account doesn't match the one in config |
| `InvalidMintDecimals` | Mint decimals ≠ 9 |

---

## Expected flow

### Admin (once)

```
1. yarn deploy
   ├─ create Token-2022 mint (9 decimals, admin = mint authority)
   ├─ mint 10,000,000,000 LUVIA to admin's ATA
   ├─ call initialize() on the program
   │    └─ creates presale_config PDA, treasury PDA, vault ATA
   └─ transfer 1,500,000,000 LUVIA from admin ATA → vault
2. (optional) RENOUNCE_MINT_AUTHORITY=true yarn deploy
   └─ permanently lock total supply at 10B
```

Presale is now live.

### Buyer (repeated, per purchase)

```
1. frontend fetches current_stage + stages[i].price_micro_usd from presale_config
2. frontend fetches live SOL/USD from Pyth Hermes (https://hermes.pyth.network)
3. frontend builds ONE versioned transaction with two instructions:
     ix#1: Pyth receiver postPriceUpdate → creates fresh PriceUpdateV2 account
     ix#2: luvia_presale.buy_tokens(sol_amount)
           ├─ SOL  → treasury PDA  (system_program::transfer, signed by buyer)
           └─ LUVIA → buyer ATA    (transfer_checked, signed by config PDA)
4. buyer's wallet signs and submits
5. LUVIA appears in buyer's wallet the same slot
```

### Admin (ongoing)

```
• advance_stage                 — cut a stage short (skipped tokens stay in vault)
• pause / unpause               — emergency stop
• withdraw_sol(amount)          — drain part/all of treasury to admin wallet
• withdraw_unsold_tokens(amt)   — reclaim vault tokens (pass u64::MAX to sweep)
```

### End of sale

```
• Stage 4 sells out OR admin decides the sale is over
• Admin calls withdraw_unsold_tokens(u64::MAX) to reclaim any leftovers
• Admin calls withdraw_sol(...) to drain remaining SOL
• Reclaimed LUVIA + SOL is used for:
    – DEX liquidity pool (e.g. Raydium / Orca)
    – CEX listings
    – Team / marketing / operations / staking reserves
```

---

## Events

All instructions emit Anchor events consumable via the standard IDL-based subscriber. Feed these into your indexer / analytics pipeline.

```
PresaleInitialized { admin, treasury, token_mint, token_vault, pyth_price_update }
TokensPurchased    { buyer, sol_spent, tokens_received, stage_at_purchase, stage_after }
StageAdvanced      { previous_stage, new_stage, manual }
PausedChanged      { paused }
SolWithdrawn       { admin, amount }
UnsoldTokensWithdrawn { admin, destination, amount, vault_remaining }
```

---

## Development

### Prerequisites

- macOS / Linux
- Solana CLI ≥ 2.2.17
- Anchor CLI 0.31.1
- Rust (host) ≥ 1.85 for the client + IDL build
- Node ≥ 18
- Yarn 1.x

### Toolchain note — BPF tools upgrade

Anchor 0.31.1's dep tree (via `anchor-spl` → `spl-token-2022` → `blake3 1.8` → `digest 0.11` → `crypto-common 0.2.1`) pulls in crates that require Rust **edition 2024**. The BPF toolchain shipped with `solana-cli 2.2.x` is platform-tools v1.48 (cargo 1.84), which does not support edition 2024.

Platform-tools v1.54+ (cargo 1.89) supports it. Install once:

```bash
cargo-build-sbf --tools-version v1.54 \
  --manifest-path programs/luvia_presale/Cargo.toml

# Make it the default without passing the flag on every build:
ln -sf "$HOME/.cache/solana/v1.54" "$HOME/.cache/solana/v1.48"
```

The root `Cargo.toml` also includes a `[patch.crates-io]` entry pinning `blake3 = "1.5.5"` as a belt-and-suspenders compatibility layer for older toolchains.

### Build

```bash
anchor build
```

Outputs:

- `target/deploy/luvia_presale.so` — program binary (≈ 288 KB)
- `target/idl/luvia_presale.json` — IDL
- `target/types/luvia_presale.ts` — TypeScript bindings

### Deploy to devnet

```bash
# Make sure the admin wallet has SOL
solana airdrop 5 --url devnet

# Deploy the program
anchor deploy --provider.cluster devnet

# Create mint, mint supply, initialize presale, fund vault
yarn deploy

# (optional) lock the supply forever
RENOUNCE_MINT_AUTHORITY=true yarn deploy
```

The first `anchor deploy` keeps the program id pinned in `Anchor.toml` (`H6DXYanZ9uiDsUqwsXu7GKNH1E1WHdqKoJr9JqqzA8cP`). To use a fresh id (e.g. for mainnet), generate a new keypair:

```bash
solana-keygen new -o target/deploy/luvia_presale-keypair.json
# then update declare_id! in lib.rs and the entries in Anchor.toml,
# rebuild, and redeploy.
```

### Run tests

Tests post a fresh Pyth price update via `@pythnetwork/pyth-solana-receiver` + Hermes before each `buy_tokens`. This requires outbound internet to `hermes.pyth.network`.

```bash
# local validator (clones Pyth receiver program from devnet, see Anchor.toml)
anchor test

# against live devnet (no local validator, reuses deployed program)
# NB: initialize test only runs once per program id — subsequent runs need a
# fresh deploy.
ANCHOR_PROVIDER_URL="https://api.devnet.solana.com" \
ANCHOR_WALLET="$HOME/.config/solana/id.json" \
yarn test
```

Test coverage:

- `initialize` — creates config, validates all defaults and the stage table
- `buy_tokens` — live Pyth pricing; validates buyer balance, stage sold counter, treasury delta
- `advance_stage` — admin manual bump + non-admin rejection
- `pause` / `unpause` — buys blocked while paused
- `withdraw_sol` — admin withdrawal + non-admin rejection
- `withdraw_unsold_tokens` — partial withdraw + `u64::MAX` sweep + non-admin rejection

---

## Frontend integration snippet

```ts
import { HermesClient } from "@pythnetwork/hermes-client";
import { PythSolanaReceiver } from "@pythnetwork/pyth-solana-receiver";

const SOL_USD_FEED =
  "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";

const hermes = new HermesClient("https://hermes.pyth.network", {});
const priceUpdates = (
  await hermes.getLatestPriceUpdates([SOL_USD_FEED], { encoding: "base64" })
).binary.data;

const receiver = new PythSolanaReceiver({ connection, wallet });

const builder = receiver.newTransactionBuilder({ closeUpdateAccounts: true });
await builder.addPostPriceUpdates(priceUpdates);
await builder.addPriceConsumerInstructions(async (getPriceUpdateAccount) => {
  const priceUpdate = getPriceUpdateAccount(SOL_USD_FEED);
  const ix = await program.methods
    .buyTokens(new BN(solLamports))
    .accountsStrict({ /* ...see migrations/deploy.ts for the full list... */ })
    .instruction();
  return [{ instruction: ix, signers: [] }];
});

const txs = await builder.buildVersionedTransactions({
  computeUnitPriceMicroLamports: 50_000,
});
await receiver.provider.sendAll(txs);
```

---

## File structure

```
contracts/
├── Anchor.toml                      # cluster, program id, test.validator config
├── Cargo.toml                       # workspace manifest + blake3 patch
├── package.json                     # JS deps: anchor, spl-token, pyth sdk, hermes
├── tsconfig.json                    # es2020 target (bigint literals)
├── programs/luvia_presale/
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs                   # program entrypoint + instruction handlers + accounts
│       ├── constants.rs             # stage prices, allocations, seeds, feed id, staleness
│       ├── errors.rs                # PresaleError enum
│       ├── pyth.rs                  # self-contained PriceUpdateV2 reader
│       └── state.rs                 # PresaleConfig, StageInfo, events
├── migrations/
│   └── deploy.ts                    # idempotent mint + initialize + fund vault script
├── tests/
│   └── luvia_presale.ts             # end-to-end test suite
└── target/                          # build artefacts (gitignored)
    ├── deploy/luvia_presale.so
    ├── deploy/luvia_presale-keypair.json
    ├── idl/luvia_presale.json
    └── types/luvia_presale.ts
```

---

## Security considerations

- **Admin is a single key.** Treat the admin wallet as you would any treasury key. Consider a multisig (e.g. Squads) as the `admin` at `initialize` time for production.
- **Pyth staleness is 60s.** If SOL/USD is volatile, buys using an older update will fail. Frontends must post a fresh update per buy.
- **Rent for new buyer ATAs is paid by the buyer.** First-time buyers pay ~0.002 SOL extra on their first purchase.
- **No reentrancy concerns on Solana** — CPI order is: SOL transfer → token transfer → state commit. A partial failure in any step reverts the whole transaction atomically.
- **Integer math uses u128** for the intermediate `sol_lamports × sol_price_micro / token_price_micro` multiplication; final quantities fit safely in u64.
- **The mint authority remains with admin** unless you run `RENOUNCE_MINT_AUTHORITY=true yarn deploy`. Until renounced, admin can mint arbitrary additional supply. Renounce before going public if fixed supply is a marketing claim.
- **`withdraw_unsold_tokens` does not check current stage.** Admin can, in principle, drain the vault mid-stage and brick ongoing buys (they'll fail with `InsufficientVaultBalance`). Pause first, withdraw, re-fund or unpause.

---

## License

ISC. See individual crate manifests for third-party licenses.
