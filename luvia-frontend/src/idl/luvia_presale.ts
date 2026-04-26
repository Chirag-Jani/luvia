/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/luvia_presale.json`.
 */
export type LuviaPresale = {
  "address": "Fxgt8HY2fgnhef62Sx6HUowLh6uQti6dpe6rJmUV5qGP",
  "metadata": {
    "name": "luviaPresale",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "LUVIA token presale program (Solana / Anchor)"
  },
  "instructions": [
    {
      "name": "advanceStage",
      "docs": [
        "Admin-only manual stage bump. Useful if admin wants to close a stage early even though",
        "the allocation is not fully sold (any unsold tokens remain in the vault)."
      ],
      "discriminator": [
        245,
        116,
        218,
        214,
        50,
        98,
        155,
        205
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "presaleConfig"
          ]
        },
        {
          "name": "presaleConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  115,
                  97,
                  108,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "buyTokens",
      "docs": [
        "User pays `sol_amount` lamports, receives LUVIA based on live SOL/USD price and current",
        "stage price. If `sol_amount` would exceed the remaining allocation in the current stage,",
        "the purchase rolls over into subsequent stages at their respective prices.",
        "Any SOL left over after the final stage is fully sold is simply not transferred",
        "(remains in the buyer's wallet)."
      ],
      "discriminator": [
        189,
        21,
        230,
        133,
        247,
        2,
        110,
        42
      ],
      "accounts": [
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "presaleConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  115,
                  97,
                  108,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "relations": [
            "presaleConfig"
          ]
        },
        {
          "name": "tokenVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "presaleConfig"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          },
          "relations": [
            "presaleConfig"
          ]
        },
        {
          "name": "buyerTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "pythPriceUpdate",
          "docs": [
            "in `load_sol_usd_price_micro` before we use the price."
          ]
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "solAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize",
      "docs": [
        "One-time setup. Creates config + treasury PDA + vault ATA, burns hardcoded stage config.",
        "The transaction signer is the initializer/payer; `initial_admin` can be any pubkey."
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "initializer",
          "writable": true,
          "signer": true
        },
        {
          "name": "presaleConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  115,
                  97,
                  108,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "treasury",
          "docs": [
            "withdrawals happen via signed system-program CPI using the same seeds."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "presaleConfig"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "pythPriceUpdate"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "initialAdmin",
          "type": "pubkey"
        },
        {
          "name": "presaleStartTs",
          "type": "i64"
        },
        {
          "name": "presaleEndTs",
          "type": "i64"
        },
        {
          "name": "minPurchaseMicroUsd",
          "type": "u64"
        }
      ]
    },
    {
      "name": "pause",
      "docs": [
        "Emergency stop — blocks all buys."
      ],
      "discriminator": [
        211,
        22,
        221,
        251,
        74,
        121,
        193,
        47
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "presaleConfig"
          ]
        },
        {
          "name": "presaleConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  115,
                  97,
                  108,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "setMinPurchase",
      "docs": [
        "Admin-only minimum purchase update (micro-USD, e.g. $10 = 10_000_000)."
      ],
      "discriminator": [
        78,
        187,
        249,
        250,
        223,
        244,
        237,
        79
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "presaleConfig"
          ]
        },
        {
          "name": "presaleConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  115,
                  97,
                  108,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "minPurchaseMicroUsd",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unpause",
      "discriminator": [
        169,
        144,
        4,
        38,
        10,
        141,
        188,
        255
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "presaleConfig"
          ]
        },
        {
          "name": "presaleConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  115,
                  97,
                  108,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "withdrawSol",
      "docs": [
        "Admin-only withdraw of SOL out of the treasury PDA."
      ],
      "discriminator": [
        145,
        131,
        74,
        136,
        65,
        137,
        42,
        38
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "presaleConfig"
          ]
        },
        {
          "name": "presaleConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  115,
                  97,
                  108,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawUnsoldTokens",
      "docs": [
        "Admin-only recovery of LUVIA that remains in the vault — either because a stage was",
        "manually skipped before selling out, or because the final stage ended with leftovers.",
        "Pass `amount == u64::MAX` to sweep the entire current vault balance.",
        "",
        "Safety: the admin is expected to only call this for *genuinely unsold* tokens. If you",
        "call this while a stage is still actively selling, subsequent `buy_tokens` calls may",
        "fail with `InsufficientVaultBalance` until admin re-funds the vault. The typical safe",
        "pattern mid-presale is: `pause → withdraw_unsold_tokens → unpause` (or re-fund)."
      ],
      "discriminator": [
        132,
        251,
        59,
        118,
        38,
        162,
        168,
        77
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "presaleConfig"
          ]
        },
        {
          "name": "presaleConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  101,
                  115,
                  97,
                  108,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "relations": [
            "presaleConfig"
          ]
        },
        {
          "name": "tokenVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "presaleConfig"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          },
          "relations": [
            "presaleConfig"
          ]
        },
        {
          "name": "adminTokenAccount",
          "docs": [
            "Admin's own ATA for the LUVIA mint. Auto-created if it doesn't exist."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "admin"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "presaleConfig",
      "discriminator": [
        115,
        71,
        85,
        233,
        246,
        108,
        30,
        3
      ]
    }
  ],
  "events": [
    {
      "name": "minPurchaseUpdated",
      "discriminator": [
        110,
        84,
        171,
        22,
        79,
        66,
        205,
        198
      ]
    },
    {
      "name": "pausedChanged",
      "discriminator": [
        12,
        10,
        153,
        247,
        60,
        115,
        137,
        69
      ]
    },
    {
      "name": "presaleInitialized",
      "discriminator": [
        103,
        99,
        225,
        170,
        238,
        250,
        90,
        75
      ]
    },
    {
      "name": "solWithdrawn",
      "discriminator": [
        145,
        249,
        69,
        48,
        206,
        86,
        91,
        66
      ]
    },
    {
      "name": "stageAdvanced",
      "discriminator": [
        238,
        247,
        141,
        164,
        52,
        239,
        99,
        134
      ]
    },
    {
      "name": "tokensPurchased",
      "discriminator": [
        214,
        119,
        105,
        186,
        114,
        205,
        228,
        181
      ]
    },
    {
      "name": "unsoldTokensWithdrawn",
      "discriminator": [
        241,
        12,
        117,
        85,
        109,
        175,
        143,
        151
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "presalePaused",
      "msg": "Presale is currently paused."
    },
    {
      "code": 6001,
      "name": "stageSoldOut",
      "msg": "Current stage is sold out."
    },
    {
      "code": 6002,
      "name": "insufficientSol",
      "msg": "Insufficient SOL sent for purchase."
    },
    {
      "code": 6003,
      "name": "presaleEnded",
      "msg": "Presale has ended — all stages are complete."
    },
    {
      "code": 6004,
      "name": "invalidAmount",
      "msg": "Invalid amount: must be greater than zero."
    },
    {
      "code": 6005,
      "name": "unauthorized",
      "msg": "Unauthorized: admin signature required."
    },
    {
      "code": 6006,
      "name": "mathOverflow",
      "msg": "Arithmetic overflow in calculation."
    },
    {
      "code": 6007,
      "name": "invalidPriceFeed",
      "msg": "Pyth price feed account is not the one registered in config."
    },
    {
      "code": 6008,
      "name": "negativePrice",
      "msg": "Pyth price feed returned a non-positive price."
    },
    {
      "code": 6009,
      "name": "insufficientVaultBalance",
      "msg": "Vault does not hold enough tokens to fulfil this purchase."
    },
    {
      "code": 6010,
      "name": "alreadyFinalStage",
      "msg": "Already at the final stage; cannot advance further."
    },
    {
      "code": 6011,
      "name": "insufficientTreasuryBalance",
      "msg": "Treasury does not have enough withdrawable SOL."
    },
    {
      "code": 6012,
      "name": "invalidMint",
      "msg": "Token mint account does not match the one registered in config."
    },
    {
      "code": 6013,
      "name": "invalidVault",
      "msg": "Token vault account does not match the one registered in config."
    },
    {
      "code": 6014,
      "name": "invalidMintDecimals",
      "msg": "Token mint decimals do not match the expected value."
    },
    {
      "code": 6015,
      "name": "presaleNotStarted",
      "msg": "Presale has not started yet."
    },
    {
      "code": 6016,
      "name": "presaleWindowClosed",
      "msg": "Presale window has ended."
    },
    {
      "code": 6017,
      "name": "minPurchaseNotMet",
      "msg": "Purchase amount is below minimum purchase threshold."
    }
  ],
  "types": [
    {
      "name": "minPurchaseUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "minPurchaseMicroUsd",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "pausedChanged",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "paused",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "presaleConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "docs": [
              "Admin wallet that can advance stages, pause, and withdraw SOL."
            ],
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "docs": [
              "PDA that holds purchased SOL (withdrawable only via `withdraw_sol`)."
            ],
            "type": "pubkey"
          },
          {
            "name": "tokenMint",
            "docs": [
              "LUVIA Token-2022 mint address."
            ],
            "type": "pubkey"
          },
          {
            "name": "tokenVault",
            "docs": [
              "ATA owned by this config PDA that holds presale tokens."
            ],
            "type": "pubkey"
          },
          {
            "name": "pythPriceUpdate",
            "docs": [
              "Pyth pull-oracle price update account for SOL/USD."
            ],
            "type": "pubkey"
          },
          {
            "name": "currentStage",
            "docs": [
              "Index into `stages` (0..NUM_STAGES). When == NUM_STAGES the presale is over."
            ],
            "type": "u8"
          },
          {
            "name": "paused",
            "docs": [
              "Emergency pause flag — when true, `buy_tokens` is blocked."
            ],
            "type": "bool"
          },
          {
            "name": "bump",
            "docs": [
              "Bump for the config PDA."
            ],
            "type": "u8"
          },
          {
            "name": "treasuryBump",
            "docs": [
              "Bump for the treasury PDA."
            ],
            "type": "u8"
          },
          {
            "name": "padding",
            "docs": [
              "Reserved for future use / alignment."
            ],
            "type": {
              "array": [
                "u8",
                4
              ]
            }
          },
          {
            "name": "minPurchaseMicroUsd",
            "docs": [
              "Minimum purchase threshold in micro-USD (admin adjustable)."
            ],
            "type": "u64"
          },
          {
            "name": "presaleStartTs",
            "docs": [
              "Presale start timestamp (unix seconds, source of truth)."
            ],
            "type": "i64"
          },
          {
            "name": "presaleEndTs",
            "docs": [
              "Presale end timestamp (unix seconds, source of truth)."
            ],
            "type": "i64"
          },
          {
            "name": "totalTokensSold",
            "docs": [
              "Total tokens sold across all stages (base units)."
            ],
            "type": "u64"
          },
          {
            "name": "totalSolRaised",
            "docs": [
              "Total SOL taken into the treasury (lamports)."
            ],
            "type": "u64"
          },
          {
            "name": "stages",
            "docs": [
              "Per-stage configuration + progress."
            ],
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "stageInfo"
                  }
                },
                4
              ]
            }
          }
        ]
      }
    },
    {
      "name": "presaleInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "tokenVault",
            "type": "pubkey"
          },
          {
            "name": "pythPriceUpdate",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "solWithdrawn",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "stageAdvanced",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "previousStage",
            "type": "u8"
          },
          {
            "name": "newStage",
            "type": "u8"
          },
          {
            "name": "manual",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "stageInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "priceMicroUsd",
            "docs": [
              "Token price in micro-USD (6 decimals): $0.01 => 10_000."
            ],
            "type": "u64"
          },
          {
            "name": "allocation",
            "docs": [
              "Hard cap for this stage in base units (9 decimals)."
            ],
            "type": "u64"
          },
          {
            "name": "sold",
            "docs": [
              "Already-sold tokens in this stage (base units)."
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tokensPurchased",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "solSpent",
            "type": "u64"
          },
          {
            "name": "tokensReceived",
            "type": "u64"
          },
          {
            "name": "stageAtPurchase",
            "type": "u8"
          },
          {
            "name": "stageAfter",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "unsoldTokensWithdrawn",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "destination",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "vaultRemaining",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "presaleSeed",
      "type": "bytes",
      "value": "[112, 114, 101, 115, 97, 108, 101, 95, 99, 111, 110, 102, 105, 103]"
    },
    {
      "name": "treasurySeed",
      "type": "bytes",
      "value": "[116, 114, 101, 97, 115, 117, 114, 121]"
    }
  ]
};
