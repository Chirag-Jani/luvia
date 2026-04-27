# LUVIA Project Status

Last updated: 2026-04-27

## Overall

Core contract integration is live and wired end-to-end on frontend (devnet-focused):

- wallet connection
- presale state reads
- buy flow with Pyth pricing updates
- admin controls
- hidden `/admin` page with wallet + on-chain admin verification and tabbed controls
- on-chain sale window enforcement (start/end timestamps) added to contract buy validation
- on-chain minimum purchase config added and admin-adjustable via `/admin`

Buy flow is functional and confirmed working.

## Platform snapshot (current)

- Token supply: `10,000,000,000` LUVIA (9 decimals)
- Public sale allocation: `1,500,000,000` LUVIA (15%, 4 stages x 375M)
- Stage prices:
  - Stage 1: `$0.01`
  - Stage 2: `$0.015`
  - Stage 3: `$0.02`
  - Stage 4: `$0.025`
- Listing display price: `$0.10`
- Fundraising target (display): `$6,000,000`
- Seeded raised shown in UI (display floor): `$268,000`
- Buyer delivery model: instant token delivery on successful buy transaction
- Payment method: SOL only
- Price source: Pyth SOL/USD pull-oracle (validated on-chain)

## Live vs static

### Live (on-chain / real services)

- Reown AppKit wallet integration (Solana)
- `presale_config` PDA reads (stage, sold, paused, totals, mint, treasury)
- SOL/USD feed consumption from Pyth Hermes
- `buy_tokens` transaction path from frontend
- admin instruction paths: pause, unpause, advance stage, withdraw SOL, withdraw unsold tokens
- wallet + treasury balance reads

### Static or fallback in frontend

- fallback stage display values when chain state is unavailable
- optional fallback countdown (`now + 40 days`) when `VITE_PRESALE_END_DATE` is unset
- stage notes/labels in UI are static copy
- listing price card text is static display value
- marketing sections are static content (About, Features, HowItWorks, Participants, UseCases, Partners, FAQ, etc.)
- tokenomics section is static display content

## Configuration currently used

- initialize now accepts explicit `initial_admin` (deployer can assign client wallet as admin)
- network default: `devnet`
- program id default: `Fxgt8HY2fgnhef62Sx6HUowLh6uQti6dpe6rJmUV5qGP`
- token decimals: `9`
- stage display prices in frontend config: `0.01, 0.015, 0.02, 0.025`
- minimum purchase default: `$10` (now on-chain configurable by admin)
- listing display price: `$0.10`
- footer contact email: `Info@luvia.exchange`
- fundraising goal display: `$6,000,000`
- seeded raised display floor: `$268,000`
- fallback presale duration (UI only): `40` days when on-chain end timestamp is unavailable
- deploy/init flow is env-driven from `contracts/.env` (no code edits required for parameter changes)

## Notes on buy transaction UX

- Flow is integrated and working.
- Buy now enforces on-chain sale window and on-chain minimum purchase.
- Depending on oracle payload/runtime limits, buy may be built as a transaction bundle rather than a single tx.
- Frontend uses wallet capabilities to minimize repeated signing prompts where possible.

## Admin capabilities (live)

- hidden `/admin` route with wallet + on-chain admin verification
- pause / unpause presale
- manually advance stage
- withdraw SOL from treasury PDA (rent-safe)
- withdraw unsold tokens from vault
- update minimum purchase USD on-chain
- stage-wise analytics, vault/treasury visibility, sold/remaining visibility

## End-to-end flow

### Deployment / initialize

1. deploy program on devnet
2. run `yarn deploy` in `contracts`
3. script reads configurables from `contracts/.env`
4. script can create/reuse mint, mint supply, initialize presale, fund vault
5. admin can be set independent of deployer (`INITIAL_ADMIN`)

### Buyer flow

1. connect wallet
2. frontend reads on-chain presale state
3. user enters SOL amount
4. frontend fetches fresh Pyth update + builds buy transaction flow
5. wallet signs and sends
6. program validates:
   - sale window started and not ended
   - not paused
   - minimum USD amount met
   - valid + fresh SOL/USD price update account
7. SOL is routed 100% to the program treasury path controlled by admin withdrawals, and LUVIA goes to buyer ATA
8. stage/state counters update (including auto-advance when full)

### If stages are not fully sold

- admin can keep sale running until end window, or close operationally
- admin can pause, withdraw unsold vault tokens, and/or withdraw treasury SOL
- unsold tokens are reclaimable through admin withdraw flow

## Tokenomics + vesting (current decisions)

- Allocation split:
  - Ecosystem Growth: 30%
  - Infrastructure Rewards: 25%
  - Public Sale: 15%
  - Team: 10%
  - Treasury: 10%
  - Partnerships: 5%
  - Community: 5%
- Team / Treasury / Partnerships: vest linearly over 24 months (no cliff)
- Buyer tokens: instant delivery after successful buy
- Rewards vesting: 4 vesting periods at 12 / 24 / 36 / 48 months

## Remaining (minor)

- optional precision: define exact percentage split across rewards vesting periods (12/24/36/48) if needed for legal/docs automation
- production infra polish at go-live (final RPC/Reown/env lock + mainnet checklist)

## Mainnet go-live checklist (what still needs configuring)

1. Mainnet program deployment + finalized program id
2. Frontend env update for mainnet:
   - `VITE_SOLANA_CLUSTER=mainnet-beta`
   - `VITE_SOLANA_RPC_URL=<mainnet provider url>`
   - `VITE_LUVIA_PROGRAM_ID=<mainnet program id>`
3. Contracts env update for mainnet initialize/deploy:
   - `ANCHOR_PROVIDER_URL=<mainnet provider url>`
   - `ANCHOR_WALLET=<deployer keypair path>`
   - `INITIAL_ADMIN=<client/admin wallet>`
   - `PRESALE_START_TS`, `PRESALE_END_TS`, `MIN_PURCHASE_MICRO_USD`
4. Reown production project id in frontend env (`VITE_REOWN_PROJECT_ID`)
5. Final mint authority decision:
   - keep authority (operational flexibility), or
   - renounce with `RENOUNCE_MINT_AUTHORITY=true` (fixed-supply claim)
6. One final mainnet dry run:
   - buy flow
   - admin pause/unpause/advance
   - SOL withdraw
   - unsold token withdraw
7. Monitoring + rollback prep:
   - RPC failover plan
   - tx/error monitoring dashboards
