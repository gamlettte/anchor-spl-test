use anchor_lang::prelude::*;

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

declare_id!("4f7ch2gvDGd78bGdotv5rzMKzB2hynxjKaWvWAs8MJwt");

#[program]
pub mod an {
    use super::*;

    pub fn initialize(ctx: Context<SomeSplFunction>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

// #[event_cpi]
#[derive(Accounts)]
pub struct SomeSplFunction<'info> {

    #[account(mut)]
    pub sender_account: Signer<'info>,

    #[account(mut)]
    pub signer_authority: Signer<'info>,

    #[account(mut)]
    pub mint_account: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = sender_account,
        associated_token::mint = mint_account,
        associated_token::authority = sender_account,
    )]
    pub sender_associated_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,

    #[account(
        init_if_needed,
        payer = signer_authority,
        seeds = [b"first", mint_account.key().as_ref()],
        bump,
        token::mint = mint_account,
        token::authority = signer_authority,
    )]
    pub first: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = signer_authority,
        seeds = [b"second", mint_account.key().as_ref()],
        bump,
        token::mint = mint_account,
        token::authority = signer_authority,
    )]
    pub second: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
}
