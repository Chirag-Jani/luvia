use anchor_lang::prelude::*;

use crate::constants::NUM_STAGES;

#[account]
#[derive(InitSpace)]
pub struct PresaleConfig {
    /// Admin wallet that can advance stages, pause, and withdraw SOL.
    pub admin: Pubkey,
    /// PDA that holds purchased SOL (withdrawable only via `withdraw_sol`).
    pub treasury: Pubkey,
    /// LUVIA Token-2022 mint address.
    pub token_mint: Pubkey,
    /// ATA owned by this config PDA that holds presale tokens.
    pub token_vault: Pubkey,
    /// Pyth pull-oracle price update account for SOL/USD.
    pub pyth_price_update: Pubkey,
    /// Index into `stages` (0..NUM_STAGES). When == NUM_STAGES the presale is over.
    pub current_stage: u8,
    /// Emergency pause flag — when true, `buy_tokens` is blocked.
    pub paused: bool,
    /// Bump for the config PDA.
    pub bump: u8,
    /// Bump for the treasury PDA.
    pub treasury_bump: u8,
    /// Reserved for future use / alignment.
    pub _padding: [u8; 4],
    /// Minimum purchase threshold in micro-USD (admin adjustable).
    pub min_purchase_micro_usd: u64,
    /// Presale start timestamp (unix seconds, source of truth).
    pub presale_start_ts: i64,
    /// Presale end timestamp (unix seconds, source of truth).
    pub presale_end_ts: i64,
    /// Total tokens sold across all stages (base units).
    pub total_tokens_sold: u64,
    /// Total SOL taken into the treasury (lamports).
    pub total_sol_raised: u64,
    /// Per-stage configuration + progress.
    pub stages: [StageInfo; NUM_STAGES],
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, InitSpace, Default, Debug)]
pub struct StageInfo {
    /// Token price in micro-USD (6 decimals): $0.01 => 10_000.
    pub price_micro_usd: u64,
    /// Hard cap for this stage in base units (9 decimals).
    pub allocation: u64,
    /// Already-sold tokens in this stage (base units).
    pub sold: u64,
}

impl StageInfo {
    #[inline]
    pub fn remaining(&self) -> u64 {
        self.allocation.saturating_sub(self.sold)
    }

    #[inline]
    pub fn is_sold_out(&self) -> bool {
        self.sold >= self.allocation
    }
}

#[event]
pub struct PresaleInitialized {
    pub admin: Pubkey,
    pub treasury: Pubkey,
    pub token_mint: Pubkey,
    pub token_vault: Pubkey,
    pub pyth_price_update: Pubkey,
}

#[event]
pub struct TokensPurchased {
    pub buyer: Pubkey,
    pub sol_spent: u64,
    pub tokens_received: u64,
    pub stage_at_purchase: u8,
    pub stage_after: u8,
}

#[event]
pub struct StageAdvanced {
    pub previous_stage: u8,
    pub new_stage: u8,
    pub manual: bool,
}

#[event]
pub struct PausedChanged {
    pub paused: bool,
}

#[event]
pub struct SolWithdrawn {
    pub admin: Pubkey,
    pub amount: u64,
}

#[event]
pub struct UnsoldTokensWithdrawn {
    pub admin: Pubkey,
    pub destination: Pubkey,
    pub amount: u64,
    pub vault_remaining: u64,
}

#[event]
pub struct MinPurchaseUpdated {
    pub admin: Pubkey,
    pub min_purchase_micro_usd: u64,
}
