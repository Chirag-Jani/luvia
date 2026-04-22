//! Minimal, self-contained Pyth `PriceUpdateV2` reader.
//!
//! We deliberately avoid depending on `pyth-solana-receiver-sdk` because its newer
//! releases pull in `solana-program 4.x` (incompatible with Anchor 0.31's
//! `solana-program 2.3.x`), and older releases pull in crates that require the
//! Rust edition-2024 feature (not supported by Anchor's bundled BPF toolchain).
//!
//! Instead we validate the account's owner against the Pyth receiver program id
//! and deserialize the well-known `PriceUpdateV2` on-chain layout by hand. The
//! layout has been stable since the pull oracle launched and is used by all
//! on-chain consumers today.
//!
//! Reference layout (borsh-serialized, 8-byte Anchor discriminator prefix):
//!
//!   discriminator: [u8; 8]                              // [34,241,35,99,157,126,244,205]
//!   write_authority: Pubkey (32)
//!   verification_level: VerificationLevel (1 + optional u8 partial-verified threshold)
//!   price_message: PriceFeedMessage {
//!       feed_id:          [u8; 32]
//!       price:            i64
//!       conf:             u64
//!       exponent:         i32
//!       publish_time:     i64
//!       prev_publish_time: i64
//!       ema_price:        i64
//!       ema_conf:         u64
//!   }
//!   posted_slot: u64

use anchor_lang::prelude::*;

use crate::errors::PresaleError;

/// Pyth Solana Receiver program id (same on mainnet + devnet).
pub const PYTH_RECEIVER_PROGRAM_ID: Pubkey =
    pubkey!("rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ");

/// 8-byte Anchor discriminator for `PriceUpdateV2`.
const PRICE_UPDATE_V2_DISCRIMINATOR: [u8; 8] = [34, 241, 35, 99, 157, 126, 244, 205];

/// Offset into the account data where the `PriceFeedMessage` begins.
///   8 (discriminator) + 32 (write_authority) + 2 (verification_level: tag + u8)
const PRICE_FEED_MESSAGE_OFFSET: usize = 8 + 32 + 2;

/// Lightweight decoded view of a Pyth price update.
pub struct DecodedPrice {
    pub feed_id: [u8; 32],
    pub price: i64,
    pub exponent: i32,
    pub publish_time: i64,
}

/// Safely decode a Pyth `PriceUpdateV2` account.
///
/// Checks:
///   * account is owned by the Pyth solana-receiver program
///   * account discriminator matches `PriceUpdateV2`
///   * buffer is large enough to contain a `PriceFeedMessage`
pub fn decode_price_update(account: &AccountInfo) -> Result<DecodedPrice> {
    require_keys_eq!(
        *account.owner,
        PYTH_RECEIVER_PROGRAM_ID,
        PresaleError::InvalidPriceFeed
    );

    let data = account.try_borrow_data()?;
    require!(data.len() >= 8, PresaleError::InvalidPriceFeed);
    require!(
        data[..8] == PRICE_UPDATE_V2_DISCRIMINATOR,
        PresaleError::InvalidPriceFeed
    );
    require!(
        data.len() >= PRICE_FEED_MESSAGE_OFFSET + 32 + 8 + 8 + 4 + 8 + 8 + 8 + 8,
        PresaleError::InvalidPriceFeed
    );

    let mut cur = PRICE_FEED_MESSAGE_OFFSET;

    let feed_id: [u8; 32] = data[cur..cur + 32]
        .try_into()
        .map_err(|_| error!(PresaleError::InvalidPriceFeed))?;
    cur += 32;

    let price = i64::from_le_bytes(
        data[cur..cur + 8]
            .try_into()
            .map_err(|_| error!(PresaleError::InvalidPriceFeed))?,
    );
    cur += 8;

    // conf: u64 — skipped.
    cur += 8;

    let exponent = i32::from_le_bytes(
        data[cur..cur + 4]
            .try_into()
            .map_err(|_| error!(PresaleError::InvalidPriceFeed))?,
    );
    cur += 4;

    let publish_time = i64::from_le_bytes(
        data[cur..cur + 8]
            .try_into()
            .map_err(|_| error!(PresaleError::InvalidPriceFeed))?,
    );

    Ok(DecodedPrice {
        feed_id,
        price,
        exponent,
        publish_time,
    })
}

/// Parse a hex feed id like `"0xef0d…b56d"` (with or without the `0x` prefix) into 32 bytes.
pub fn feed_id_from_hex(s: &str) -> Result<[u8; 32]> {
    let s = s.strip_prefix("0x").unwrap_or(s);
    require!(s.len() == 64, PresaleError::InvalidPriceFeed);
    let mut out = [0u8; 32];
    for (i, byte) in out.iter_mut().enumerate() {
        let hi = hex_digit(s.as_bytes()[i * 2])?;
        let lo = hex_digit(s.as_bytes()[i * 2 + 1])?;
        *byte = (hi << 4) | lo;
    }
    Ok(out)
}

fn hex_digit(b: u8) -> Result<u8> {
    match b {
        b'0'..=b'9' => Ok(b - b'0'),
        b'a'..=b'f' => Ok(10 + (b - b'a')),
        b'A'..=b'F' => Ok(10 + (b - b'A')),
        _ => err!(PresaleError::InvalidPriceFeed),
    }
}
