# LUVIA Frontend

Frontend for the LUVIA presale dApp (React + Vite + Solana/Anchor).

## Current integration status

### Live and connected

- Wallet connect/disconnect via Reown AppKit (Solana namespace)
- On-chain presale state reads (`presale_config` PDA)
- Live SOL/USD quote from Pyth Hermes
- Buy flow using Anchor `buy_tokens` with fresh Pyth update posting
- Admin actions wired to chain: pause, unpause, advance stage, withdraw SOL, withdraw unsold tokens
- Buy success popup with transaction details + explorer link
- Hidden `/admin` route with on-chain admin verification and tabbed admin console

### Uses fallback/static values in UI

- Stage fallback array when chain state is unavailable
- Presale countdown fallback (`now + 60 days`) when `VITE_PRESALE_END_DATE` is unset
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

## Key source files

- `src/pages/Buy.tsx`
- `src/hooks/useBuyTokens.ts`
- `src/hooks/usePresaleState.ts`
- `src/lib/solana/buyTokens.ts`
- `src/lib/solana/presale.ts`
- `src/lib/solana/admin.ts`
- `src/lib/solana/config.ts`

## Client inputs still needed

- Final tokenomics allocations and vesting schedule
- Final roadmap/partner/content assets for landing sections
- Final presale end date and listing messaging
- Final production wallet/RPC/project IDs
