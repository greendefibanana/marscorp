import * as anchor from "@coral-xyz/anchor";
import { Program, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, ComputeBudgetProgram } from "@solana/web3.js";
import fs from "fs";
import path from "path";
import os from "os";
import idl from "../marscorp-chain/target/idl/marscorp_exchange.json";

// --- CONFIGURATION ---
const PROGRAM_ID = new PublicKey("5GKfHwujgiKLXP84f28HyGL5FJ3AnunKsVGmKDmG6RXi");
const RPC_URL = "https://api.devnet.solana.com"; // CHANGE THIS IF ON MAINNET OR LOCALHOST
// const RPC_URL = "http://127.0.0.1:8899"; 

// --- SETUP WALLET ---
// Try to find the default Solana wallet
const homeDir = os.homedir();
const defaultKeypairPath = path.join(homeDir, ".config", "solana", "id.json");
let walletKeypair: Keypair;

try {
    if (fs.existsSync(defaultKeypairPath)) {
        const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(defaultKeypairPath, "utf-8")));
        walletKeypair = Keypair.fromSecretKey(secretKey);
        console.log(`Using wallet from: ${defaultKeypairPath}`);
    } else {
        throw new Error("Default wallet not found");
    }
} catch (e) {
    console.error("Could not load default wallet. Please ensure ~/.config/solana/id.json exists.");
    console.error("Or update this script to point to your keypair file.");
    process.exit(1);
}

// --- MAIN FUNCTION ---
async function main() {
    const connection = new Connection(RPC_URL, "confirmed");
    const wallet = new Wallet(walletKeypair);
    const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "confirmed" });
    anchor.setProvider(provider);

    const program = new Program(idl as anchor.Idl, provider); // programId from IDL or override if needed
    // If IDL doesn't have the correct address, override it:
    // const program = new Program(idl as anchor.Idl, PROGRAM_ID, provider);

    console.log("Initializing Protocol Config...");
    console.log("Program ID:", program.programId.toString());
    console.log("Wallet:", wallet.publicKey.toString());

    try {
        const [configAddress] = PublicKey.findProgramAddressSync(
            [Buffer.from("config")],
            program.programId
        );

        console.log("Config PDA:", configAddress.toString());

        const tx = await program.methods
            .initializeConfig(100, 200) // 1% Platform Fee, 2% Yield Fee
            .accounts({
                config: configAddress,
                admin: wallet.publicKey,
                yieldDistributor: wallet.publicKey,
                systemProgram: PublicKey.default, // SystemProgram.programId
            } as any)
            .preInstructions([
                ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 })
            ])
            .rpc();

        console.log("✅ SUCCESS! Transaction signature:", tx);
        console.log("Protocol initialized.");

    } catch (e: any) {
        if (e.message && e.message.includes("already in use")) {
            console.log("⚠️  Protocol already initialized (Account already exists).");
        } else {
            console.error("❌ FAILED:", e);
        }
    }
}

main();
