use anchor_lang::prelude::*;

#[error_code]
pub enum PresaleError {
    #[msg("Presale is currently paused.")]
    PresalePaused,
    #[msg("Current stage is sold out.")]
    StageSoldOut,
    #[msg("Insufficient SOL sent for purchase.")]
    InsufficientSol,
    #[msg("Presale has ended — all stages are complete.")]
    PresaleEnded,
    #[msg("Invalid amount: must be greater than zero.")]
    InvalidAmount,
    #[msg("Unauthorized: admin signature required.")]
    Unauthorized,
    #[msg("Arithmetic overflow in calculation.")]
    MathOverflow,
    #[msg("Pyth price feed account is not the one registered in config.")]
    InvalidPriceFeed,
    #[msg("Pyth price feed returned a non-positive price.")]
    NegativePrice,
    #[msg("Vault does not hold enough tokens to fulfil this purchase.")]
    InsufficientVaultBalance,
    #[msg("Already at the final stage; cannot advance further.")]
    AlreadyFinalStage,
    #[msg("Treasury does not have enough withdrawable SOL.")]
    InsufficientTreasuryBalance,
    #[msg("Token mint account does not match the one registered in config.")]
    InvalidMint,
    #[msg("Token vault account does not match the one registered in config.")]
    InvalidVault,
    #[msg("Token mint decimals do not match the expected value.")]
    InvalidMintDecimals,
    #[msg("Presale has not started yet.")]
    PresaleNotStarted,
    #[msg("Presale window has ended.")]
    PresaleWindowClosed,
    #[msg("Purchase amount is below minimum purchase threshold.")]
    MinPurchaseNotMet,
}
