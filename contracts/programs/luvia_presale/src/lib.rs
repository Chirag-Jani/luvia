//! LUVIA token presale program.
//!
//! Flow:
//!   1. Admin deploys a Token-2022 mint with 9 decimals (done off-chain / in deploy script).
//!   2. Admin calls `initialize` — creates config PDA, treasury PDA and presale vault ATA.
//!   3. Admin transfers presale tokens (4 × 375_000_000 = 1_500_000_000 LUVIA) into the vault.
//!   4. Users call `buy_tokens(sol_amount)` — SOL → treasury PDA, LUVIA → buyer ATA.
//!   5. Admin may `advance_stage`, `pause`, `unpause`, `withdraw_sol` at any time.

use anchor_lang::prelude::*;
use anchor_lang::system_program::{self, Transfer as SystemTransfer};
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};

pub mod constants;
pub mod errors;
pub mod pyth;
pub mod state;

use crate::constants::*;
use crate::errors::PresaleError;
use crate::pyth::{decode_price_update, feed_id_from_hex};
use crate::state::*;

declare_id!("Fxgt8HY2fgnhef62Sx6HUowLh6uQti6dpe6rJmUV5qGP");

#[program]
pub mod luvia_presale {
    use super::*;

    /// One-time setup. Creates config + treasury PDA + vault ATA, burns hardcoded stage config.
    /// The transaction signer is the initializer/payer; `initial_admin` can be any pubkey.
    pub fn initialize(
        ctx: Context<Initialize>,
        initial_admin: Pubkey,
        presale_start_ts: i64,
        presale_end_ts: i64,
        min_purchase_micro_usd: u64,
    ) -> Result<()> {
        require!(
            ctx.accounts.token_mint.decimals == TOKEN_DECIMALS,
            PresaleError::InvalidMintDecimals
        );

        require!(
            presale_start_ts < presale_end_ts,
            PresaleError::InvalidAmount
        );
        require!(min_purchase_micro_usd > 0, PresaleError::InvalidAmount);

        let cfg = &mut ctx.accounts.presale_config;
        cfg.admin = initial_admin;
        cfg.treasury = ctx.accounts.treasury.key();
        cfg.token_mint = ctx.accounts.token_mint.key();
        cfg.token_vault = ctx.accounts.token_vault.key();
        cfg.pyth_price_update = ctx.accounts.pyth_price_update.key();
        cfg.current_stage = 0;
        cfg.paused = false;
        cfg.bump = ctx.bumps.presale_config;
        cfg.treasury_bump = ctx.bumps.treasury;
        cfg._padding = [0; 4];
        cfg.min_purchase_micro_usd = min_purchase_micro_usd;
        cfg.presale_start_ts = presale_start_ts;
        cfg.presale_end_ts = presale_end_ts;
        cfg.total_tokens_sold = 0;
        cfg.total_sol_raised = 0;

        for i in 0..NUM_STAGES {
            cfg.stages[i] = StageInfo {
                price_micro_usd: STAGE_PRICES_MICRO_USD[i],
                allocation: PER_STAGE_ALLOCATION,
                sold: 0,
            };
        }

        emit!(PresaleInitialized {
            admin: cfg.admin,
            treasury: cfg.treasury,
            token_mint: cfg.token_mint,
            token_vault: cfg.token_vault,
            pyth_price_update: cfg.pyth_price_update,
        });
        Ok(())
    }

    /// User pays `sol_amount` lamports, receives LUVIA based on live SOL/USD price and current
    /// stage price. If `sol_amount` would exceed the remaining allocation in the current stage,
    /// the purchase rolls over into subsequent stages at their respective prices.
    /// Any SOL left over after the final stage is fully sold is simply not transferred
    /// (remains in the buyer's wallet).
    pub fn buy_tokens(ctx: Context<BuyTokens>, sol_amount: u64) -> Result<()> {
        require!(sol_amount > 0, PresaleError::InvalidAmount);
        require!(
            !ctx.accounts.presale_config.paused,
            PresaleError::PresalePaused
        );
        require!(
            (ctx.accounts.presale_config.current_stage as usize) < NUM_STAGES,
            PresaleError::PresaleEnded
        );

        let now = Clock::get()?.unix_timestamp;
        require!(
            now >= ctx.accounts.presale_config.presale_start_ts,
            PresaleError::PresaleNotStarted
        );
        require!(
            now <= ctx.accounts.presale_config.presale_end_ts,
            PresaleError::PresaleWindowClosed
        );

        // ---- 1. Pull live SOL/USD price from Pyth and normalize to micro-USD (6 decimals).
        let sol_price_micro_usd = load_sol_usd_price_micro(&ctx.accounts.pyth_price_update)?;

        let purchase_micro_usd = (sol_amount as u128)
            .checked_mul(sol_price_micro_usd)
            .ok_or(PresaleError::MathOverflow)?
            .checked_div(DECIMALS_POW as u128)
            .ok_or(PresaleError::MathOverflow)?;
        require!(
            purchase_micro_usd >= ctx.accounts.presale_config.min_purchase_micro_usd as u128,
            PresaleError::MinPurchaseNotMet
        );

        // ---- 2. Walk stages to figure out how many tokens the SOL buys and how much SOL is
        // actually consumed (the buyer is only charged for what the presale can fulfil).
        let starting_stage = ctx.accounts.presale_config.current_stage as usize;
        let mut remaining_sol: u128 = sol_amount as u128;
        let mut total_tokens: u128 = 0;
        let mut stage_deltas: [u64; NUM_STAGES] = [0; NUM_STAGES];
        let mut stage_idx = starting_stage;

        while remaining_sol > 0 && stage_idx < NUM_STAGES {
            let stage = ctx.accounts.presale_config.stages[stage_idx];
            let stage_remaining = stage.remaining() as u128;
            if stage_remaining == 0 {
                stage_idx += 1;
                continue;
            }

            let token_price = stage.price_micro_usd as u128;

            // tokens = sol_lamports * sol_price_micro / token_price_micro
            // (valid because SOL lamport decimals == LUVIA base-unit decimals == 9)
            let tokens_from_sol = remaining_sol
                .checked_mul(sol_price_micro_usd)
                .ok_or(PresaleError::MathOverflow)?
                .checked_div(token_price)
                .ok_or(PresaleError::MathOverflow)?;

            let tokens_this_stage = tokens_from_sol.min(stage_remaining);

            // Corresponding SOL (round up so we never under-charge due to int division).
            let num = tokens_this_stage
                .checked_mul(token_price)
                .ok_or(PresaleError::MathOverflow)?;
            let sol_consumed = num
                .checked_add(sol_price_micro_usd.saturating_sub(1))
                .ok_or(PresaleError::MathOverflow)?
                .checked_div(sol_price_micro_usd)
                .ok_or(PresaleError::MathOverflow)?
                .min(remaining_sol);

            total_tokens = total_tokens
                .checked_add(tokens_this_stage)
                .ok_or(PresaleError::MathOverflow)?;
            stage_deltas[stage_idx] = stage_deltas[stage_idx]
                .checked_add(tokens_this_stage as u64)
                .ok_or(PresaleError::MathOverflow)?;
            remaining_sol = remaining_sol.saturating_sub(sol_consumed);

            if tokens_this_stage == stage_remaining {
                stage_idx += 1;
            } else {
                // Either remaining_sol is now 0 or rounding has left dust; either way we are done.
                break;
            }
        }

        let total_tokens_u64: u64 = total_tokens
            .try_into()
            .map_err(|_| PresaleError::MathOverflow)?;
        require!(total_tokens_u64 > 0, PresaleError::InsufficientSol);

        let sol_charged: u64 = (sol_amount as u128)
            .saturating_sub(remaining_sol)
            .try_into()
            .map_err(|_| PresaleError::MathOverflow)?;
        require!(sol_charged > 0, PresaleError::InsufficientSol);

        // ---- 3. Sanity: vault must hold enough tokens to fulfil the purchase.
        require!(
            ctx.accounts.token_vault.amount >= total_tokens_u64,
            PresaleError::InsufficientVaultBalance
        );

        // ---- 4. Transfer SOL from buyer → treasury PDA (buyer is a system account, regular CPI).
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                SystemTransfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                },
            ),
            sol_charged,
        )?;

        // ---- 5. Transfer LUVIA from vault → buyer ATA, signed by the config PDA.
        let bump = ctx.accounts.presale_config.bump;
        let signer_seeds: &[&[&[u8]]] = &[&[PRESALE_SEED, &[bump]]];
        transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.token_vault.to_account_info(),
                    mint: ctx.accounts.token_mint.to_account_info(),
                    to: ctx.accounts.buyer_token_account.to_account_info(),
                    authority: ctx.accounts.presale_config.to_account_info(),
                },
                signer_seeds,
            ),
            total_tokens_u64,
            ctx.accounts.token_mint.decimals,
        )?;

        // ---- 6. Commit state.
        let cfg = &mut ctx.accounts.presale_config;
        for i in 0..NUM_STAGES {
            if stage_deltas[i] > 0 {
                cfg.stages[i].sold = cfg.stages[i]
                    .sold
                    .checked_add(stage_deltas[i])
                    .ok_or(PresaleError::MathOverflow)?;
            }
        }
        // Auto-advance past any stage that just filled up.
        while (cfg.current_stage as usize) < NUM_STAGES
            && cfg.stages[cfg.current_stage as usize].is_sold_out()
        {
            cfg.current_stage = cfg.current_stage.saturating_add(1);
        }
        cfg.total_tokens_sold = cfg
            .total_tokens_sold
            .checked_add(total_tokens_u64)
            .ok_or(PresaleError::MathOverflow)?;
        cfg.total_sol_raised = cfg
            .total_sol_raised
            .checked_add(sol_charged)
            .ok_or(PresaleError::MathOverflow)?;

        emit!(TokensPurchased {
            buyer: ctx.accounts.buyer.key(),
            sol_spent: sol_charged,
            tokens_received: total_tokens_u64,
            stage_at_purchase: starting_stage as u8,
            stage_after: cfg.current_stage,
        });
        Ok(())
    }

    /// Admin-only manual stage bump. Useful if admin wants to close a stage early even though
    /// the allocation is not fully sold (any unsold tokens remain in the vault).
    pub fn advance_stage(ctx: Context<AdminOnly>) -> Result<()> {
        let cfg = &mut ctx.accounts.presale_config;
        require!(
            (cfg.current_stage as usize) < NUM_STAGES - 1,
            PresaleError::AlreadyFinalStage
        );
        let prev = cfg.current_stage;
        cfg.current_stage = cfg.current_stage.saturating_add(1);
        emit!(StageAdvanced {
            previous_stage: prev,
            new_stage: cfg.current_stage,
            manual: true,
        });
        Ok(())
    }

    /// Admin-only withdraw of SOL out of the treasury PDA.
    pub fn withdraw_sol(ctx: Context<WithdrawSol>, amount: u64) -> Result<()> {
        require!(amount > 0, PresaleError::InvalidAmount);

        // Treasury PDA is a pure system account (no data) so we can transfer via signed CPI.
        let treasury_lamports = ctx.accounts.treasury.lamports();
        let rent_exempt_min = Rent::get()?.minimum_balance(0);
        let withdrawable = treasury_lamports.saturating_sub(rent_exempt_min);
        require!(
            amount <= withdrawable,
            PresaleError::InsufficientTreasuryBalance
        );

        let treasury_bump = ctx.accounts.presale_config.treasury_bump;
        let signer_seeds: &[&[&[u8]]] = &[&[TREASURY_SEED, &[treasury_bump]]];
        system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                SystemTransfer {
                    from: ctx.accounts.treasury.to_account_info(),
                    to: ctx.accounts.admin.to_account_info(),
                },
                signer_seeds,
            ),
            amount,
        )?;

        emit!(SolWithdrawn {
            admin: ctx.accounts.admin.key(),
            amount,
        });
        Ok(())
    }

    /// Admin-only recovery of LUVIA that remains in the vault — either because a stage was
    /// manually skipped before selling out, or because the final stage ended with leftovers.
    /// Pass `amount == u64::MAX` to sweep the entire current vault balance.
    ///
    /// Safety: the admin is expected to only call this for *genuinely unsold* tokens. If you
    /// call this while a stage is still actively selling, subsequent `buy_tokens` calls may
    /// fail with `InsufficientVaultBalance` until admin re-funds the vault. The typical safe
    /// pattern mid-presale is: `pause → withdraw_unsold_tokens → unpause` (or re-fund).
    pub fn withdraw_unsold_tokens(
        ctx: Context<WithdrawUnsoldTokens>,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, PresaleError::InvalidAmount);

        let vault_balance = ctx.accounts.token_vault.amount;
        require!(vault_balance > 0, PresaleError::InsufficientVaultBalance);

        // `u64::MAX` is treated as "sweep everything currently in the vault".
        let to_transfer = if amount == u64::MAX {
            vault_balance
        } else {
            amount
        };
        require!(
            to_transfer <= vault_balance,
            PresaleError::InsufficientVaultBalance
        );

        let bump = ctx.accounts.presale_config.bump;
        let signer_seeds: &[&[&[u8]]] = &[&[PRESALE_SEED, &[bump]]];
        transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.token_vault.to_account_info(),
                    mint: ctx.accounts.token_mint.to_account_info(),
                    to: ctx.accounts.admin_token_account.to_account_info(),
                    authority: ctx.accounts.presale_config.to_account_info(),
                },
                signer_seeds,
            ),
            to_transfer,
            ctx.accounts.token_mint.decimals,
        )?;

        emit!(UnsoldTokensWithdrawn {
            admin: ctx.accounts.admin.key(),
            destination: ctx.accounts.admin_token_account.key(),
            amount: to_transfer,
            vault_remaining: vault_balance - to_transfer,
        });
        Ok(())
    }

    /// Emergency stop — blocks all buys.
    pub fn pause(ctx: Context<AdminOnly>) -> Result<()> {
        ctx.accounts.presale_config.paused = true;
        emit!(PausedChanged { paused: true });
        Ok(())
    }

    pub fn unpause(ctx: Context<AdminOnly>) -> Result<()> {
        ctx.accounts.presale_config.paused = false;
        emit!(PausedChanged { paused: false });
        Ok(())
    }


    /// Admin-only minimum purchase update (micro-USD, e.g. $10 = 10_000_000).
    pub fn set_min_purchase(
        ctx: Context<AdminOnly>,
        min_purchase_micro_usd: u64,
    ) -> Result<()> {
        require!(min_purchase_micro_usd > 0, PresaleError::InvalidAmount);
        ctx.accounts.presale_config.min_purchase_micro_usd = min_purchase_micro_usd;
        emit!(MinPurchaseUpdated {
            admin: ctx.accounts.admin.key(),
            min_purchase_micro_usd,
        });
        Ok(())
    }
}

// -----------------------------------------------------------------------------
// Account contexts
// -----------------------------------------------------------------------------

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,

    #[account(
        init,
        payer = initializer,
        space = 8 + PresaleConfig::INIT_SPACE,
        seeds = [PRESALE_SEED],
        bump,
    )]
    pub presale_config: Account<'info, PresaleConfig>,

    /// CHECK: Pure system-owned PDA that receives all purchase SOL. No data is ever written;
    /// withdrawals happen via signed system-program CPI using the same seeds.
    #[account(
        mut,
        seeds = [TREASURY_SEED],
        bump,
    )]
    pub treasury: SystemAccount<'info>,

    pub token_mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = initializer,
        associated_token::mint = token_mint,
        associated_token::authority = presale_config,
        associated_token::token_program = token_program,
    )]
    pub token_vault: InterfaceAccount<'info, TokenAccount>,

    /// CHECK: Pyth `PriceUpdateV2` account. Stored on config; validated on every `buy_tokens`.
    pub pyth_price_update: UncheckedAccount<'info>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct BuyTokens<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        seeds = [PRESALE_SEED],
        bump = presale_config.bump,
        has_one = token_mint @ PresaleError::InvalidMint,
        has_one = token_vault @ PresaleError::InvalidVault,
    )]
    pub presale_config: Account<'info, PresaleConfig>,

    #[account(
        mut,
        seeds = [TREASURY_SEED],
        bump = presale_config.treasury_bump,
    )]
    pub treasury: SystemAccount<'info>,

    pub token_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = presale_config,
        associated_token::token_program = token_program,
    )]
    pub token_vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = token_mint,
        associated_token::authority = buyer,
        associated_token::token_program = token_program,
    )]
    pub buyer_token_account: InterfaceAccount<'info, TokenAccount>,

    /// CHECK: Pyth `PriceUpdateV2` account. Owner + discriminator + feed-id are all verified
    /// in `load_sol_usd_price_micro` before we use the price.
    pub pyth_price_update: UncheckedAccount<'info>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct AdminOnly<'info> {
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [PRESALE_SEED],
        bump = presale_config.bump,
        has_one = admin @ PresaleError::Unauthorized,
    )]
    pub presale_config: Account<'info, PresaleConfig>,
}

#[derive(Accounts)]
pub struct WithdrawSol<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [PRESALE_SEED],
        bump = presale_config.bump,
        has_one = admin @ PresaleError::Unauthorized,
    )]
    pub presale_config: Account<'info, PresaleConfig>,

    #[account(
        mut,
        seeds = [TREASURY_SEED],
        bump = presale_config.treasury_bump,
    )]
    pub treasury: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct WithdrawUnsoldTokens<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [PRESALE_SEED],
        bump = presale_config.bump,
        has_one = admin @ PresaleError::Unauthorized,
        has_one = token_mint @ PresaleError::InvalidMint,
        has_one = token_vault @ PresaleError::InvalidVault,
    )]
    pub presale_config: Account<'info, PresaleConfig>,

    pub token_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = presale_config,
        associated_token::token_program = token_program,
    )]
    pub token_vault: InterfaceAccount<'info, TokenAccount>,

    /// Admin's own ATA for the LUVIA mint. Auto-created if it doesn't exist.
    #[account(
        init_if_needed,
        payer = admin,
        associated_token::mint = token_mint,
        associated_token::authority = admin,
        associated_token::token_program = token_program,
    )]
    pub admin_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}


// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/// Read the SOL/USD price from Pyth and normalize it to micro-USD (10^-6 USD) per SOL.
/// Returned value is always a positive u128 safe to use in the purchase math.
fn load_sol_usd_price_micro(price_update: &UncheckedAccount) -> Result<u128> {
    let decoded = decode_price_update(&price_update.to_account_info())?;

    let expected_feed_id = feed_id_from_hex(SOL_USD_FEED_ID_HEX)?;
    require!(
        decoded.feed_id == expected_feed_id,
        PresaleError::InvalidPriceFeed
    );

    let now = Clock::get()?.unix_timestamp;
    require!(
        now >= decoded.publish_time,
        PresaleError::InvalidPriceFeed
    );
    let age = (now - decoded.publish_time) as u64;
    require!(age <= MAX_PRICE_AGE_SECONDS, PresaleError::InvalidPriceFeed);

    require!(decoded.price > 0, PresaleError::NegativePrice);

    let raw = decoded.price as u128;
    let expo = decoded.exponent;

    // Convert to exponent `TARGET_PRICE_EXPONENT` (-6). Pyth typically publishes SOL/USD with
    // exponent = -8, so this divides by 100. Handles other exponents defensively.
    let normalized = if expo >= TARGET_PRICE_EXPONENT {
        let shift = (expo - TARGET_PRICE_EXPONENT) as u32;
        raw.checked_mul(10u128.pow(shift))
            .ok_or(PresaleError::MathOverflow)?
    } else {
        let shift = (TARGET_PRICE_EXPONENT - expo) as u32;
        raw.checked_div(10u128.pow(shift))
            .ok_or(PresaleError::MathOverflow)?
    };

    require!(normalized > 0, PresaleError::NegativePrice);
    Ok(normalized)
}
