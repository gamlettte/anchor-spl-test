import * as anchor from "@coral-xyz/anchor";
import * as assert from "assert";
import { GetVersionedTransactionConfig, PublicKey } from "@solana/web3.js";
import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
} from "@solana/spl-token";



import { Program } from "@coral-xyz/anchor";
import { An } from "../target/types/an";

async function initalize_with_1000_SOL(
    provider: anchor.AnchorProvider
): Promise<anchor.web3.Keypair> {
    const recipient = anchor.web3.Keypair.generate();
    await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(recipient.publicKey, 1_000_000_000),
        'confirmed'
    );
    return recipient;
}

describe("an", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.An as Program<An>;
    const provider = anchor.AnchorProvider.local();

    anchor.setProvider(provider);
    const connection = provider.connection;
    const payer = provider.wallet.payer;

    const amountToFundIn = 1_000_000;
    const stableCommissionPercent = 0.01;
    const gasCommission = 5_000;

    let mintAddress: anchor.web3.PublicKey = null;
    let funder: anchor.web3.Keypair = null;
    let funderTokenAccount: Account = null;

    const destinationChain = 'eth';
    const destinationAddress = "hello world";
    const nonce = new anchor.BN(123_123_123);
    const transactionId = new anchor.BN(2);

    before(async () => {
        const mintAuthority =  await initalize_with_1000_SOL(provider);
        const freezeAuthority =  await initalize_with_1000_SOL(provider);
        const destination1 = await initalize_with_1000_SOL(provider);

        const decimals = 9;
        const mintAddress1 = await createMint(
            connection,
            payer,                       // Payer of the transaction fees
            mintAuthority.publicKey,     // Mint authority
            freezeAuthority.publicKey,   // Freeze authority
            decimals                     // Number of decimals for the token
        );
        assert.ok(mintAddress1);

        // Step 4: Create an associated token account for the destination
        const destinationTokenAccount1 = await getOrCreateAssociatedTokenAccount(
            connection,
            payer,                  // Payer for the account creation
            mintAddress1,         // Token mint
            destination1.publicKey // Destination account that will hold the minted tokens
        );
        assert.ok(destinationTokenAccount1);

        // Step 5: Mint tokens to the destination's token account
        const amountToMint = 100500 * Math.pow(10, decimals); // Mint ungodly amount of tokens

        await mintTo(
            connection,
            payer,                               // Payer for transaction fees
            mintAddress1,                      // Token mint address
            destinationTokenAccount1.address, // Associated token account of the destination
            mintAuthority,                       // Mint authority must sign
            amountToMint
        );

        mintAddress = mintAddress1;
        funder = destination1;
        funderTokenAccount = destinationTokenAccount1;
    });

  it("Is initialized!", async () => {
    // Add your test here.
    const senderAccount = await initalize_with_1000_SOL(provider);
    const signerAuthority = await initalize_with_1000_SOL(provider);

    const tx = await program.methods
            .initialize()
            .accounts({
                mintAccount: mintAddress,
                senderAccount: senderAccount.publicKey,
                signerAuthority: signerAuthority.publicKey,
            })
            .signers([
                signerAuthority,
                senderAccount,
            ])
            .rpc();

    console.log("Your transaction signature", tx);
  });
});
