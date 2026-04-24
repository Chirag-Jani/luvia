# LUVIA Project Status

Last updated: 2026-04-24

## Overall

Core contract integration is live and wired end-to-end on frontend (devnet-focused):

- wallet connection
- presale state reads
- buy flow with Pyth pricing updates
- admin controls
- hidden `/admin` page with wallet + on-chain admin verification and tabbed controls

Buy flow is functional and confirmed working.

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
- optional fallback countdown (`now + 60 days`) when `VITE_PRESALE_END_DATE` is unset
- stage notes/labels in UI are static copy
- listing price card text is static display value
- marketing sections are static content (About, Features, HowItWorks, Participants, UseCases, Partners, FAQ, etc.)
- tokenomics section is static display content

## Configuration currently used

- initialize now accepts explicit `initial_admin` (deployer can assign client wallet as admin)
- network default: `devnet`
- program id default: `H6DXYanZ9uiDsUqwsXu7GKNH1E1WHdqKoJr9JqqzA8cP`
- token decimals: `9`
- stage display prices in frontend config: `0.004, 0.006, 0.009, 0.012`
- minimum purchase UI guard: `$10`
- listing display price: `$0.018`

## Notes on buy transaction UX

- Flow is integrated and working.
- Depending on oracle payload/runtime limits, buy may be built as a transaction bundle rather than a single tx.
- Frontend uses wallet capabilities to minimize repeated signing prompts where possible.

## Client questions (copy/paste ready)

1. Can you share the final tokenomics allocation table (all buckets) and the vesting/lock schedule for each?
2. What is the final stage naming and positioning copy you want shown publicly on the website?
3. What should be the final listing price messaging and launch assumptions shown in the UI?
4. What is the exact presale end date/time and timezone, and what is the source of truth for it?
5. Can you provide the final roadmap milestones and their target dates?
6. Can you share the final partners list, official logos, and approval to publish each one?
7. Can you provide the final marketing copy for static landing sections (About, Features, How It Works, Use Cases, FAQ, etc.)?
8. Please share the production Reown project ID and any wallet policy/restrictions we must enforce.
9. Which production RPC provider(s) should we use, and what uptime/reliability requirements should we target?
10. Is the minimum purchase amount fixed at $10, or should it be configurable?

## Operational next-step checklist

- confirm client-provided content/parameters above
- lock production env values
- run final devnet validation pass with client-approved parameters
- prepare mainnet rollout checklist (program id, RPC, monitoring, fallback plan)
