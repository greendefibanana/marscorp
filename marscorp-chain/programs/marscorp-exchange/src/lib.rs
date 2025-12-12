use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, MintTo};
use anchor_spl::associated_token::AssociatedToken;
use anchor_lang::solana_program::system_instruction;
use anchor_lang::solana_program::program::{invoke, invoke_signed};

declare_id!("5GKfHwujgiKLXP84f28HyGL5FJ3AnunKsVGmKDmG6RXi");

#[program]
pub mod marscorp_unified {
    use super::*;

    // ═══════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════

    pub fn initialize_config(
        ctx: Context<InitializeConfig>, 
        platform_fee_bps: u16, 
        yield_fee_bps: u16
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.admin = ctx.accounts.admin.key();
        config.platform_fee_bps = platform_fee_bps;
        config.yield_fee_bps = yield_fee_bps;
        config.yield_distributor = ctx.accounts.yield_distributor.key();
        Ok(())
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TOKEN LAUNCHPAD (BONDING CURVE)
    // ═══════════════════════════════════════════════════════════════════════

    pub fn create_business(
        ctx: Context<LaunchBusiness>, 
        name: String,
        symbol: String,
        _uri: String,
        sector: Sector
    ) -> Result<()> {
        // Validation
        require!(name.len() > 0 && name.len() < 50, UnifiedError::InvalidInput);
        require!(symbol.len() > 0 && symbol.len() < 10, UnifiedError::InvalidInput);

        // 1. Initialize Bonding Curve State
        let curve = &mut ctx.accounts.curve;
        curve.creator = ctx.accounts.creator.key();
        curve.mint = ctx.accounts.mint.key();
        curve.sector = sector;
        curve.virtual_sol = 30_000_000_000; // 30 SOL initial virtual liquidity
        curve.virtual_tokens = 1_073_000_000_000_000; // ~1B tokens
        curve.real_sol = 0;
        curve.graduated = false;
        curve.takeover_active = false;
        curve.takeover_initiator = Pubkey::default();
        curve.sabotage_penalty_bps = 0;
        curve.sabotage_end_ts = 0;
        curve.bump = ctx.bumps.curve;

        // 2. Initialize Vesting Account (20% Allocation)
        let vesting = &mut ctx.accounts.vesting;
        vesting.owner = ctx.accounts.creator.key();
        vesting.mint = ctx.accounts.mint.key();
        vesting.total_amount = 200_000_000_000_000; // 200M tokens
        vesting.released_amount = 0;
        vesting.start_ts = Clock::get()?.unix_timestamp;
        vesting.end_ts = vesting.start_ts
            .checked_add(365 * 24 * 60 * 60)
            .ok_or(UnifiedError::Overflow)?;
        vesting.bump = ctx.bumps.vesting;

        // 3. Mint Tokens
        let mint_key = ctx.accounts.mint.key();
        let seeds = &[b"curve", mint_key.as_ref(), &[curve.bump]];
        let signer = &[&seeds[..]];

        // Mint 80% to Curve (Trading Supply)
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.curve_token_vault.to_account_info(),
                    authority: curve.to_account_info(),
                },
                signer
            ),
            800_000_000_000_000 // 800M
        )?;

        // Mint 20% to Vesting Vault (Locked for Creator)
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.vesting_token_vault.to_account_info(),
                    authority: curve.to_account_info(),
                },
                signer
            ),
            200_000_000_000_000 // 200M
        )?;

        emit!(BusinessLaunched {
            mint: ctx.accounts.mint.key(),
            name,
            symbol,
            creator: ctx.accounts.creator.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn swap(ctx: Context<Swap>, is_buy: bool, amount: u64, min_out: u64) -> Result<()> {
        let config = &ctx.accounts.config;
        let curve = &mut ctx.accounts.curve;
        
        require!(!curve.graduated, UnifiedError::AlreadyGraduated);
        require!(amount > 0, UnifiedError::InvalidInput);

        // Apply sabotage penalty if active
        let current_time = Clock::get()?.unix_timestamp;
        let penalty_active = curve.sabotage_end_ts > current_time;
        let penalty_multiplier = if penalty_active {
            10000u128 - curve.sabotage_penalty_bps as u128 // e.g., 9900 if 1% penalty
        } else {
            10000u128
        };

        // --- CALCULATIONS ---
        let amount_u128 = amount as u128;
        let platform_fee_bps = config.platform_fee_bps as u128;
        let yield_fee_bps = config.yield_fee_bps as u128;

        let tokens_out_u64: u64;
        let sol_amount_to_curve: u64;
        let sol_out_net_u64: u64;
        let platform_fee_u64: u64;
        let yield_fee_u64: u64;

        if is_buy {
            // BUY: SOL In -> Tokens Out
            let platform_fee = amount_u128.checked_mul(platform_fee_bps).unwrap().checked_div(10000).unwrap();
            let yield_fee = amount_u128.checked_mul(yield_fee_bps).unwrap().checked_div(10000).unwrap();
            let total_fee = platform_fee.checked_add(yield_fee).ok_or(UnifiedError::Overflow)?;
            let amount_after_fee = amount_u128.checked_sub(total_fee).ok_or(UnifiedError::Overflow)?;

            // Bonding Curve Math
            let x = curve.virtual_sol;
            let y = curve.virtual_tokens;
            let k = x.checked_mul(y).ok_or(UnifiedError::Overflow)?;
            
            let new_x = x.checked_add(amount_after_fee).ok_or(UnifiedError::Overflow)?;
            let new_y = k.checked_div(new_x).ok_or(UnifiedError::Overflow)?;
            let tokens_out = y.checked_sub(new_y).ok_or(UnifiedError::Overflow)?;

            // Apply sabotage penalty to output
            let tokens_out_adjusted = tokens_out.checked_mul(penalty_multiplier).unwrap()
                .checked_div(10000).ok_or(UnifiedError::Overflow)?;
            
            if tokens_out_adjusted > u64::MAX as u128 { 
                return err!(UnifiedError::Overflow); 
            }
            tokens_out_u64 = tokens_out_adjusted as u64;
            
            require!(tokens_out_u64 >= min_out, UnifiedError::SlippageExceeded);

            // STATE UPDATE
            curve.virtual_sol = new_x;
            curve.virtual_tokens = new_y;
            curve.real_sol = curve.real_sol.checked_add(amount_after_fee as u64)
                .ok_or(UnifiedError::Overflow)?;

            platform_fee_u64 = platform_fee as u64;
            yield_fee_u64 = yield_fee as u64;
            sol_amount_to_curve = amount_after_fee as u64;
            sol_out_net_u64 = 0;

        } else {
            // SELL: Tokens In -> SOL Out
            let x = curve.virtual_sol;
            let y = curve.virtual_tokens;
            let k = x.checked_mul(y).ok_or(UnifiedError::Overflow)?;
            
            let new_y = y.checked_add(amount_u128).ok_or(UnifiedError::Overflow)?;
            let new_x = k.checked_div(new_y).ok_or(UnifiedError::Overflow)?;
            let sol_out_gross = x.checked_sub(new_x).ok_or(UnifiedError::Overflow)?;

            // Apply sabotage penalty to output (Simulates slippage or "tax" from economic damage)
            let sol_out_gross_adjusted = sol_out_gross.checked_mul(penalty_multiplier).unwrap()
                .checked_div(10000).ok_or(UnifiedError::Overflow)?;
            
            // Calculate fees from adjusted output
            let platform_fee = sol_out_gross_adjusted.checked_mul(platform_fee_bps).unwrap()
                .checked_div(10000).unwrap();
            let yield_fee = sol_out_gross_adjusted.checked_mul(yield_fee_bps).unwrap()
                .checked_div(10000).unwrap();
            let total_fee = platform_fee.checked_add(yield_fee).ok_or(UnifiedError::Overflow)?;
            let sol_out_net = sol_out_gross_adjusted.checked_sub(total_fee)
                .ok_or(UnifiedError::Overflow)?;

            if sol_out_net > u64::MAX as u128 { 
                return err!(UnifiedError::Overflow); 
            }
            sol_out_net_u64 = sol_out_net as u64;
            
            require!(sol_out_net_u64 >= min_out, UnifiedError::SlippageExceeded);

            // STATE UPDATE
            curve.virtual_sol = new_x;
            curve.virtual_tokens = new_y;
            
            let sol_out_gross_u64 = sol_out_gross_adjusted as u64;
            // Reduce Real SOL by GROSS amount (what leaves the bonding curve)
            curve.real_sol = curve.real_sol.checked_sub(sol_out_gross_u64)
                .ok_or(UnifiedError::Overflow)?;

            platform_fee_u64 = platform_fee as u64;
            yield_fee_u64 = yield_fee as u64;
            sol_amount_to_curve = 0;
            tokens_out_u64 = 0;
        }

        // Graduation Check
        if curve.real_sol > 85_000_000_000 && !curve.graduated {
            curve.graduated = true;
            emit!(GraduationReady {
                mint: curve.mint,
                sol_amount: curve.real_sol,
                token_amount: curve.virtual_tokens as u64,
                timestamp: Clock::get()?.unix_timestamp,
            });
        }

        emit!(PriceUpdated {
            mint: curve.mint,
            sol_reserves: curve.virtual_sol as u64,
            token_reserves: curve.virtual_tokens as u64,
            timestamp: Clock::get()?.unix_timestamp,
        });

        // --- EXTERNAL INTERACTIONS ---
        
        if is_buy {
            // Pay fees
            if platform_fee_u64 > 0 {
                invoke(
                    &system_instruction::transfer(&ctx.accounts.user.key(), &config.admin, platform_fee_u64),
                    &[ctx.accounts.user.to_account_info(), ctx.accounts.admin_treasury.to_account_info(), 
                      ctx.accounts.system_program.to_account_info()],
                )?;
            }
            if yield_fee_u64 > 0 {
                invoke(
                    &system_instruction::transfer(&ctx.accounts.user.key(), &config.yield_distributor, yield_fee_u64),
                    &[ctx.accounts.user.to_account_info(), ctx.accounts.yield_distributor.to_account_info(), 
                      ctx.accounts.system_program.to_account_info()],
                )?;
            }

            // Transfer SOL to curve
            invoke(
                &system_instruction::transfer(&ctx.accounts.user.key(), &curve.key(), sol_amount_to_curve),
                &[ctx.accounts.user.to_account_info(), curve.to_account_info(), 
                  ctx.accounts.system_program.to_account_info()],
            )?;

            // Transfer tokens to user
            let seeds = &[b"curve", curve.mint.as_ref(), &[curve.bump]];
            let signer = &[&seeds[..]];
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.curve_token_vault.to_account_info(),
                        to: ctx.accounts.user_token_account.to_account_info(),
                        authority: curve.to_account_info(),
                    },
                    signer
                ),
                tokens_out_u64
            )?;

        } else {
            // Transfer tokens to curve
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.user_token_account.to_account_info(),
                        to: ctx.accounts.curve_token_vault.to_account_info(),
                        authority: ctx.accounts.user.to_account_info(),
                    }
                ),
                amount
            )?;

            // Pay out SOL
            let seeds = &[b"curve", curve.mint.as_ref(), &[curve.bump]];
            let signer = &[&seeds[..]];

            if platform_fee_u64 > 0 {
                invoke_signed(
                    &system_instruction::transfer(&curve.key(), &config.admin, platform_fee_u64),
                    &[curve.to_account_info(), ctx.accounts.admin_treasury.to_account_info(), 
                      ctx.accounts.system_program.to_account_info()],
                    signer
                )?;
            }
            if yield_fee_u64 > 0 {
                invoke_signed(
                    &system_instruction::transfer(&curve.key(), &config.yield_distributor, yield_fee_u64),
                    &[curve.to_account_info(), ctx.accounts.yield_distributor.to_account_info(), 
                      ctx.accounts.system_program.to_account_info()],
                    signer
                )?;
            }
            if sol_out_net_u64 > 0 {
                invoke_signed(
                    &system_instruction::transfer(&curve.key(), &ctx.accounts.user.key(), sol_out_net_u64),
                    &[curve.to_account_info(), ctx.accounts.user.to_account_info(), 
                      ctx.accounts.system_program.to_account_info()],
                    signer
                )?;
            }
        }

        Ok(())
    }

    pub fn claim_vested(ctx: Context<ClaimVested>) -> Result<()> {
        let vesting = &mut ctx.accounts.vesting;
        require!(ctx.accounts.owner.key() == vesting.owner, UnifiedError::Unauthorized);

        let now = Clock::get()?.unix_timestamp;
        require!(now >= vesting.start_ts, UnifiedError::InvalidTime);
        
        let total_duration = vesting.end_ts.checked_sub(vesting.start_ts)
            .ok_or(UnifiedError::Overflow)?;
        require!(total_duration > 0, UnifiedError::InvalidTime);
        
        let elapsed = now.checked_sub(vesting.start_ts).ok_or(UnifiedError::Overflow)?;
        
        let vested_amount: u64 = if now >= vesting.end_ts {
            vesting.total_amount
        } else {
            let total_u128 = vesting.total_amount as u128;
            let elapsed_u128 = elapsed as u128;
            let duration_u128 = total_duration as u128;
            
            let vested_u128 = total_u128
                .checked_mul(elapsed_u128).ok_or(UnifiedError::Overflow)?
                .checked_div(duration_u128).ok_or(UnifiedError::Overflow)?;
            
            vested_u128 as u64
        };

        let claimable = vested_amount.checked_sub(vesting.released_amount).unwrap_or(0);
        require!(claimable > 0, UnifiedError::NothingToClaim);

        // Transfer
        let curve_bump = ctx.accounts.curve.bump;
        let seeds = &[b"curve", vesting.mint.as_ref(), &[curve_bump]];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vesting_token_vault.to_account_info(),
                    to: ctx.accounts.owner_token_account.to_account_info(),
                    authority: ctx.accounts.curve.to_account_info(),
                },
                signer
            ),
            claimable
        )?;

        vesting.released_amount = vesting.released_amount.checked_add(claimable)
            .ok_or(UnifiedError::Overflow)?;

        Ok(())
    }

    // ═══════════════════════════════════════════════════════════════════════
    // GAME MECHANICS
    // ═══════════════════════════════════════════════════════════════════════

    pub fn initiate_takeover(ctx: Context<InitiateTakeover>) -> Result<()> {
        let curve = &mut ctx.accounts.curve;
        
        require!(!curve.takeover_active, UnifiedError::TakeoverInProgress);
        require!(!curve.graduated, UnifiedError::AlreadyGraduated);
        
        // Must own 5% of circulating supply (800M tokens = 80% of 1B)
        let circulating_supply = 800_000_000_000_000u64;
        let required_stake = circulating_supply / 20; // 5%
        
        require!(
            ctx.accounts.user_token_account.amount >= required_stake,
            UnifiedError::InsufficientStakeForTakeover
        );

        // Activate takeover
        curve.takeover_active = true;
        curve.takeover_initiator = ctx.accounts.user.key();

        emit!(TakeoverInitiated {
            mint: curve.mint,
            initiator: ctx.accounts.user.key(),
            stake: ctx.accounts.user_token_account.amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn sabotage(ctx: Context<Sabotage>) -> Result<()> {
        let config = &ctx.accounts.config;
        let curve = &mut ctx.accounts.curve;
        
        // Cost: 2 SOL
        let cost_lamports = 2_000_000_000u64;
        
        // Distribution:
        // 50% -> Curve PDA (benefits token holders)
        // 30% -> Admin treasury
        // 20% -> Yield distributor
        let to_curve = cost_lamports / 2;
        let to_admin = (cost_lamports * 3) / 10;
        let to_yield = cost_lamports - to_curve - to_admin;

        // Transfer sabotage fee
        invoke(
            &system_instruction::transfer(&ctx.accounts.user.key(), &curve.key(), to_curve),
            &[ctx.accounts.user.to_account_info(), curve.to_account_info(), 
              ctx.accounts.system_program.to_account_info()],
        )?;
        
        invoke(
            &system_instruction::transfer(&ctx.accounts.user.key(), &config.admin, to_admin),
            &[ctx.accounts.user.to_account_info(), ctx.accounts.admin_treasury.to_account_info(), 
              ctx.accounts.system_program.to_account_info()],
        )?;
        
        invoke(
            &system_instruction::transfer(&ctx.accounts.user.key(), &config.yield_distributor, to_yield),
            &[ctx.accounts.user.to_account_info(), ctx.accounts.yield_distributor.to_account_info(), 
              ctx.accounts.system_program.to_account_info()],
        )?;

        // Apply temporary penalty to bonding curve (1% for 24 hours)
        curve.sabotage_penalty_bps = 100; // 1%
        curve.sabotage_end_ts = Clock::get()?.unix_timestamp + (24 * 60 * 60); // 24 hours

        emit!(SabotageEvent {
            mint: curve.mint,
            perpetrator: ctx.accounts.user.key(),
            penalty_bps: curve.sabotage_penalty_bps,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn seize_locked_tokens(ctx: Context<SeizeAssets>) -> Result<()> {
        let config = &ctx.accounts.config;
        
        // SECURITY: Only admin can seize (after successful takeover vote)
        require!(
            ctx.accounts.authority.key() == config.admin, 
            UnifiedError::Unauthorized
        );

        let vesting = &mut ctx.accounts.vesting;
        let old_owner = vesting.owner;
        vesting.owner = ctx.accounts.new_owner.key();
        
        emit!(AssetsSeized {
            mint: vesting.mint,
            old_owner,
            new_owner: vesting.owner,
            amount: vesting.total_amount,
        });

        Ok(())
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PREDICTION MARKETS (Native)
    // ═══════════════════════════════════════════════════════════════════════

    pub fn create_market(
        ctx: Context<CreateMarket>, 
        id: u64, 
        title: String, 
        end_timestamp: i64
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(title.len() <= 100, UnifiedError::InvalidInput);
        
        market.id = id;
        market.title = title;
        market.end_timestamp = end_timestamp;
        market.resolved = false;
        market.result = None;
        market.total_pool = 0;
        market.yes_pool = 0;
        market.no_pool = 0;
        market.oracle = ctx.accounts.authority.key();
        
        msg!("Market created: {} - {}", id, market.title);
        Ok(())
    }

    pub fn resolve_market(ctx: Context<ResolveMarket>, outcome: bool) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(!market.resolved, UnifiedError::AlreadyResolved);
        
        market.resolved = true;
        market.result = Some(outcome);
        
        msg!("Market resolved. Outcome: {}", outcome);
        Ok(())
    }

    pub fn place_bet(ctx: Context<PlaceBet>, outcome: bool, amount: u64) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(!market.resolved, UnifiedError::AlreadyResolved);
        
        // Transfer SOL from user to the market PDA
        // We use system_program::transfer via CpiContext for typical transfers, 
        // but here 'invoke' is simpler given we don't need CPI signer for the user.
        // However, Anchor 'system_program::transfer' is cleaner.
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: market.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, amount)?;
        
        // Update State
        market.total_pool = market.total_pool.checked_add(amount).ok_or(UnifiedError::Overflow)?;
        if outcome {
            market.yes_pool = market.yes_pool.checked_add(amount).ok_or(UnifiedError::Overflow)?;
        } else {
            market.no_pool = market.no_pool.checked_add(amount).ok_or(UnifiedError::Overflow)?;
        }

        msg!("Bet placed on {}: {} lamports", outcome, amount);
        Ok(())
    }
}

// ═══════════════════════════════════════════════════════════════════════
// CONTEXTS
// ═══════════════════════════════════════════════════════════════════════

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(init, payer = admin, space = 8 + 32 + 2 + 2 + 32, seeds = [b"config"], bump)]
    pub config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub admin: Signer<'info>,
    /// CHECK: Validated in logic
    pub yield_distributor: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String, symbol: String, uri: String)]
pub struct LaunchBusiness<'info> {
    #[account(mut)]
    pub config: Account<'info, GlobalConfig>,
    
    #[account(
        init,
        payer = creator,
        mint::decimals = 6,
        mint::authority = curve,
        seeds = [b"mint", creator.key().as_ref(), symbol.as_bytes()],
        bump
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 32 + 1 + 16 + 16 + 8 + 1 + 1 + 32 + 2 + 8 + 8,
        seeds = [b"curve", mint.key().as_ref()],
        bump
    )]
    pub curve: Account<'info, BondingCurve>,

    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 1,
        seeds = [b"vesting", mint.key().as_ref()],
        bump
    )]
    pub vesting: Account<'info, VestingAccount>,

    #[account(
        init,
        payer = creator,
        associated_token::mint = mint,
        associated_token::authority = curve,
    )]
    pub curve_token_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = creator,
        token::mint = mint,
        token::authority = curve,
        seeds = [b"vesting_vault", mint.key().as_ref()],
        bump
    )]
    pub vesting_token_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub config: Account<'info, GlobalConfig>,
    
    #[account(
        mut,
        seeds = [b"curve", curve.mint.as_ref()],
        bump = curve.bump
    )]
    pub curve: Account<'info, BondingCurve>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub curve_token_vault: Account<'info, TokenAccount>,
    
    /// CHECK: Validated against config.admin
    #[account(mut, address = config.admin)]
    pub admin_treasury: AccountInfo<'info>,
    
    /// CHECK: Validated against config.yield_distributor
    #[account(mut, address = config.yield_distributor)]
    pub yield_distributor: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimVested<'info> {
    #[account(
        mut,
        seeds = [b"curve", vesting.mint.as_ref()],
        bump = curve.bump
    )]
    pub curve: Account<'info, BondingCurve>,
    
    #[account(mut)]
    pub vesting: Account<'info, VestingAccount>,
    
    #[account(mut)]
    pub vesting_token_vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(mut)]
    pub owner_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct InitiateTakeover<'info> {
    #[account(
        mut,
        seeds = [b"curve", curve.mint.as_ref()],
        bump = curve.bump
    )]
    pub curve: Account<'info, BondingCurve>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        constraint = user_token_account.mint == curve.mint,
        constraint = user_token_account.owner == user.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,
}

#[derive(Accounts)]
pub struct Sabotage<'info> {
    #[account(mut)]
    pub config: Account<'info, GlobalConfig>,
    
    #[account(
        mut,
        seeds = [b"curve", curve.mint.as_ref()],
        bump = curve.bump
    )]
    pub curve: Account<'info, BondingCurve>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    /// CHECK: Validated against config.admin
    #[account(mut, address = config.admin)]
    pub admin_treasury: AccountInfo<'info>,
    
    /// CHECK: Validated against config.yield_distributor
    #[account(mut, address = config.yield_distributor)]
    pub yield_distributor: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SeizeAssets<'info> {
    #[account(mut)]
    pub config: Account<'info, GlobalConfig>,
    
    #[account(mut)]
    pub vesting: Account<'info, VestingAccount>,
    
    /// CHECK: The new owner (takeover winner)
    pub new_owner: AccountInfo<'info>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}

// Prediction Market Contexts

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct CreateMarket<'info> {
    #[account(
        init, 
        payer = authority, 
        space = 8 + 8 + 4 + 100 + 8 + 1 + 2 + 8 + 8 + 8 + 32, // Calculated space
        seeds = [b"market", id.to_le_bytes().as_ref()], 
        bump
    )]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(mut, has_one = oracle)]
    pub market: Account<'info, Market>,
    pub oracle: Signer<'info>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}


// ═══════════════════════════════════════════════════════════════════════
// STATE STRUCTURES
// ═══════════════════════════════════════════════════════════════════════

#[account]
pub struct GlobalConfig {
    pub admin: Pubkey,
    pub platform_fee_bps: u16,
    pub yield_fee_bps: u16,
    pub yield_distributor: Pubkey,
}

#[account]
pub struct BondingCurve {
    pub creator: Pubkey,
    pub mint: Pubkey,
    pub sector: Sector,
    pub virtual_sol: u128,
    pub virtual_tokens: u128,
    pub real_sol: u64,
    pub graduated: bool,
    pub bump: u8,
    // Game mechanics fields
    pub takeover_active: bool,
    pub takeover_initiator: Pubkey,
    pub sabotage_penalty_bps: u16,
    pub sabotage_end_ts: i64,
}

#[account]
pub struct VestingAccount {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub total_amount: u64,
    pub released_amount: u64,
    pub start_ts: i64,
    pub end_ts: i64,
    pub bump: u8,
}

#[account]
pub struct Market {
    pub id: u64,
    pub title: String, 
    pub end_timestamp: i64,
    pub resolved: bool,
    pub result: Option<bool>,
    pub total_pool: u64,
    pub yes_pool: u64,
    pub no_pool: u64,
    pub oracle: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum Sector {
    Tech,
    Mining,
    Energy,
    Terraforming,
}

// ═══════════════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════════════

#[event]
pub struct BusinessLaunched {
    pub mint: Pubkey,
    pub name: String,
    pub symbol: String,
    pub creator: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct PriceUpdated {
    pub mint: Pubkey,
    pub sol_reserves: u64,
    pub token_reserves: u64,
    pub timestamp: i64,
}

#[event]
pub struct GraduationReady {
    pub mint: Pubkey,
    pub sol_amount: u64,
    pub token_amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct TakeoverInitiated {
    pub mint: Pubkey,
    pub initiator: Pubkey,
    pub stake: u64,
    pub timestamp: i64,
}

#[event]
pub struct SabotageEvent {
    pub mint: Pubkey,
    pub perpetrator: Pubkey,
    pub penalty_bps: u16,
    pub timestamp: i64,
}

#[event]
pub struct AssetsSeized {
    pub mint: Pubkey,
    pub old_owner: Pubkey,
    pub new_owner: Pubkey,
    pub amount: u64,
}

// ═══════════════════════════════════════════════════════════════════════
// ERRORS
// ═══════════════════════════════════════════════════════════════════════

#[error_code]
pub enum UnifiedError {
    #[msg("Slippage tolerance exceeded")]
    SlippageExceeded,
    #[msg("Already graduated to Raydium")]
    AlreadyGraduated,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Nothing to claim")]
    NothingToClaim,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Invalid input parameters")]
    InvalidInput,
    #[msg("Invalid timestamp")]
    InvalidTime,
    #[msg("Insufficient stake to initiate takeover")]
    InsufficientStakeForTakeover,
    #[msg("Takeover already in progress")]
    TakeoverInProgress,
    #[msg("Market already resolved")]
    AlreadyResolved,
}
