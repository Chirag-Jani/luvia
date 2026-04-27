# LUVIA Frontend

Frontend for the LUVIA presale dApp (React + Vite + Solana/Anchor).

## Current integration status

### Live and connected

- Wallet connect/disconnect via Reown AppKit (Solana namespace)
- On-chain presale state reads (`presale_config` PDA)
- Live SOL/USD quote from Pyth Hermes
- Buy flow using Anchor `buy_tokens` with fresh Pyth update posting and on-chain sale-window checks
- Admin actions wired to chain: pause, unpause, advance stage, withdraw SOL, withdraw unsold tokens
- Buy success popup with transaction details + explorer link
- Hidden `/admin` route with on-chain admin verification and tabbed admin console
- Countdown is now synced from on-chain `presale_end_ts` when available.
- Minimum purchase reads from on-chain config and is admin-adjustable from `/admin`.
- Stage prices are aligned to current plan: `0.01 / 0.015 / 0.02 / 0.025`.
- Listing display price is set to `$0.10`.
- Fundraising goal display is `$6,000,000`.
- UI ensures at least `$268,000` appears as raised (display floor).
- Whitepaper link in footer opens `/LUVIA Whitepaper.pdf`.
- Footer contact email is `Info@luvia.exchange`.
- "Powering the next generation of AI" cards use randomized images from `public/images` on each load.

### Uses fallback/static values in UI

- Stage fallback array when chain state is unavailable
- Presale countdown fallback (`now + 40 days`) when `VITE_PRESALE_END_DATE` is unset
- Landing page marketing sections are mostly static copy/content
- Tokenomics display cards are static marketing values

## Environment

Use `.env` (or `.env.example` as reference):

- `VITE_REOWN_PROJECT_ID`
- `VITE_SOLANA_CLUSTER` (`devnet` or `mainnet-beta`)
- `VITE_SOLANA_RPC_URL` (optional override)
- `VITE_LUVIA_PROGRAM_ID`
- `VITE_HERMES_ENDPOINT`
- `VITE_PRESALE_END_DATE` (optional, UI-only countdown)

## Solana notes

- No public CTA routes to `/admin`; access is direct URL only.
- Program interaction is built from `src/idl/luvia_presale.json`
- PDAs used by frontend:
  - `presale_config`
  - `treasury`
- Buy flow may produce a transaction bundle depending on oracle posting payload size; wallet UX is optimized to reduce repeated prompts where adapter support exists.
- Buyer delivery model is instant token delivery after successful purchase (no buyer vesting in current buy flow).
- Investor flow copy is aligned to: connect wallet -> click buy -> wallet sends tx -> contract settlement.
- Funds route to the program treasury path and are fully admin-withdrawable via on-chain admin controls.

## Key source files

- `src/pages/Buy.tsx`
- `src/hooks/useBuyTokens.ts`
- `src/hooks/usePresaleState.ts`
- `src/lib/solana/buyTokens.ts`
- `src/lib/solana/presale.ts`
- `src/lib/solana/admin.ts`
- `src/lib/solana/config.ts`

## Tokenomics + vesting snapshot (platform-level)

- Allocation split:
  - Ecosystem Growth: 30%
  - Infrastructure Rewards: 25%
  - Public Sale: 15%
  - Team: 10%
  - Treasury: 10%
  - Partnerships: 5%
  - Community: 5%
- Team / Treasury / Partnerships: linear vesting over 24 months (no cliff).
- Rewards vesting: four periods at 12 / 24 / 36 / 48 months.
- Buyer presale purchases: instant delivery.

## Remaining (minor)

- Optional precision: exact percentage split across rewards vesting periods (12/24/36/48) if legal/docs automation requires strict per-period percentages.
- Production values when going live: final RPC/Reown IDs and env lock.

## Mainnet configuration checklist

- Set frontend env:
  - `VITE_SOLANA_CLUSTER=mainnet-beta`
  - `VITE_SOLANA_RPC_URL=<mainnet rpc>`
  - `VITE_LUVIA_PROGRAM_ID=<mainnet program id>`
  - `VITE_REOWN_PROJECT_ID=<production reown id>`
- Set contracts env:
  - `ANCHOR_PROVIDER_URL=<mainnet rpc>`
  - `ANCHOR_WALLET=<deployer keypair path>`
  - `INITIAL_ADMIN=<mainnet admin wallet>`
  - `PRESALE_START_TS`, `PRESALE_END_TS`, `MIN_PURCHASE_MICRO_USD`
- Run a full mainnet smoke pass for buy + admin actions before public launch.
