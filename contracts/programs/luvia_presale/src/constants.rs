use anchor_lang::prelude::*;

#[constant]
pub const PRESALE_SEED: &[u8] = b"presale_config";
#[constant]
pub const TREASURY_SEED: &[u8] = b"treasury";

pub const TOKEN_DECIMALS: u8 = 9;
pub const DECIMALS_POW: u64 = 1_000_000_000; // 10^9

pub const NUM_STAGES: usize = 4;

// 375,000,000 LUVIA per stage, expressed in base units (9 decimals).
pub const PER_STAGE_ALLOCATION: u64 = 375_000_000 * DECIMALS_POW;

// Stage prices in micro-USD (6 decimals of precision).
// $0.004 = 4_000, $0.006 = 6_000, $0.009 = 9_000, $0.012 = 12_000
pub const STAGE_PRICES_MICRO_USD: [u64; NUM_STAGES] = [10_000, 15_000, 20_000, 25_000];

// Pyth pull-oracle SOL/USD feed id (same on devnet + mainnet).
// Price update accounts for this feed are posted by Pyth's publishers.
pub const SOL_USD_FEED_ID_HEX: &str =
    "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";

// Maximum age (in seconds) for an on-chain Pyth price before it is considered stale.
pub const MAX_PRICE_AGE_SECONDS: u64 = 60;

// Target exponent we normalize the SOL/USD price to (6 decimals → micro-USD).
pub const TARGET_PRICE_EXPONENT: i32 = -6;

