import * as anchor from "@coral-xyz/anchor";
import { Program, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, ComputeBudgetProgram, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import fs from "fs";
import path from "path";
import os from "os";
import idl from "../marscorp-chain/target/idl/marscorp_exchange.json";
import { Buffer } from "buffer";

// --- CONFIGURATION ---
const RPC_URL = "https://api.devnet.solana.com";

// --- CONSTANTS ---
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const RENT_SYSVAR_ID = new PublicKey("SysvarRent111111111111111111111111111111111");

// --- SETUP WALLET ---
const homeDir = os.homedir();
const defaultKeypairPath = path.join(homeDir, ".config", "solana", "id.json");
let walletKeypair: Keypair;

try {
    if (fs.existsSync(defaultKeypairPath)) {
        const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(defaultKeypairPath, "utf-8")));
        walletKeypair = Keypair.fromSecretKey(secretKey);
    } else {
        throw new Error(`Default wallet not found at ${defaultKeypairPath}`);
    }
} catch (e) {
    console.error("Could not load default wallet.");
    process.exit(1);
}

// --- UTILS ---
const getAssociatedTokenAddress = (mint: PublicKey, owner: PublicKey) => {
    return PublicKey.findProgramAddressSync(
        [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
    )[0];
};

// --- MAIN FUNCTION ---
async function main() {
    const connection = new Connection(RPC_URL, "confirmed");
    const wallet = new Wallet(walletKeypair);
    const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "confirmed" });
    anchor.setProvider(provider);

    const program = new Program(idl as anchor.Idl, provider);

    // 1. Check Balance
    const balance = await connection.getBalance(wallet.publicKey);
    console.log(`Wallet: ${wallet.publicKey.toString()}`);
    console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

    if (balance < 0.05 * LAMPORTS_PER_SOL) {
        console.log("⚠️ Balance is low! Requesting airdrop...");
        try {
            const sig = await connection.requestAirdrop(wallet.publicKey, 1 * LAMPORTS_PER_SOL);
            await connection.confirmTransaction(sig);
            console.log("Airdrop successful.");
        } catch (e) {
            console.warn("Airdrop failed (rate limit or mainnet). Proceeding anyway...");
        }
    }

    console.log("Launching Test Business...");

    const ticker = "TEST" + Math.floor(Math.random() * 1000);
    const name = "Test Corp " + Math.floor(Math.random() * 1000);
    const description = "Automated test launch";
    const sectorEnum = { tech: {} }; // Try lowercase 'tech' as per Anchor standard

    try {
        const [mintAddress] = PublicKey.findProgramAddressSync(
            [Buffer.from("mint"), wallet.publicKey.toBuffer(), Buffer.from(ticker)],
            program.programId
        );

        const [curveAddress] = PublicKey.findProgramAddressSync(
            [Buffer.from("curve"), mintAddress.toBuffer()],
            program.programId
        );

        const [vestingAddress] = PublicKey.findProgramAddressSync(
            [Buffer.from("vesting"), mintAddress.toBuffer()],
            program.programId
        );

        const [configAddress] = PublicKey.findProgramAddressSync(
            [Buffer.from("config")],
            program.programId
        );

        const curveTokenVault = getAssociatedTokenAddress(mintAddress, curveAddress);
        const [vestingTokenVault] = PublicKey.findProgramAddressSync(
            [Buffer.from("vesting_vault"), mintAddress.toBuffer()],
            program.programId
        );

        console.log(`Ticker: ${ticker}`);
        console.log(`Mint: ${mintAddress.toString()}`);

        const tx = await program.methods
            .createBusiness(name, ticker, description, sectorEnum)
            .accounts({
                config: configAddress,
                mint: mintAddress,
                curve: curveAddress,
                vesting: vestingAddress,
                curveTokenVault: curveTokenVault,
                vestingTokenVault: vestingTokenVault,
                creator: wallet.publicKey,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                rent: RENT_SYSVAR_ID,
            } as any)
            .preInstructions([
                ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 })
            ])
            .rpc();

        console.log("✅ SUCCESS! Business Launched. TX:", tx);

    } catch (e: any) {
        console.error("❌ FAILED TO LAUNCH BUSINESS");
        if (e.logs) {
            console.error("--- SIMULATION LOGS ---");
            e.logs.forEach((log: string) => console.log(log));
            console.error("-----------------------");
        } else {
            console.error(e);
        }
    }
}

import * as readline from 'readline';

// ... (previous imports)

// ... (rest of the file until main() call)

main().then(() => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('\nPress Enter to exit...', () => {
        rl.close();
        process.exit(0);
    });
});