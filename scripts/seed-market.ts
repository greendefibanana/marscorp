import * as anchor from "@coral-xyz/anchor";
import { Program, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, ComputeBudgetProgram, SystemProgram, LAMPORTS_PER_SOL, BN } from "@solana/web3.js";
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

// --- DATASET ---
const COMPANIES = [
    { name: "Red Dust Mining", ticker: "DUST", sector: { mining: {} }, desc: "Extracting rare earth metals from the Tharsis region." },
    { name: "Olympus Energy", ticker: "SOLR", sector: { energy: {} }, desc: "Orbital mirror arrays providing 24/7 solar power." },
    { name: "Valles Water Corp", ticker: "H2O", sector: { terraforming: {} }, desc: "Deep crust aquifer drilling logistics." },
    { name: "Phobos Transport", ticker: "SHIP", sector: { logistics: {} }, desc: "High-speed maglev connection between colonies." },
    { name: "TerraLabs Bio", ticker: "BIO", sector: { tech: {} }, desc: "Genetically modified lichen for rapid oxygenation." },
    { name: "Martian Realty", ticker: "LAND", sector: { governance: {} }, desc: "Prime crater real estate tokenization." },
    { name: "Iron Sands Ltd", ticker: "IRON", sector: { mining: {} }, desc: "Ferrous oxide refinement at scale." },
    { name: "Ares Security", ticker: "SEC", sector: { tech: {} }, desc: "Automated drone defense for remote outposts." },
    { name: "Green Dome Inc", ticker: "GRO", sector: { terraforming: {} }, desc: "Hydroponic mega-structures for food independence." },
    { name: "Helium-3 Ventures", ticker: "HE3", sector: { energy: {} }, desc: "Fusion fuel extraction and processing." },
    { name: "Canyon Echo Comms", ticker: "COMM", sector: { tech: {} }, desc: "Subsurface neutrino communication network." },
    { name: "Rover Logistics", ticker: "ROVR", sector: { logistics: {} }, desc: "Autonomous heavy haulers for mining ops." },
    { name: "Polar Iceworks", ticker: "ICE", sector: { mining: {} }, desc: "Harvesting the northern polar caps." },
    { name: "Atmosphere Gen", ticker: "AIR", sector: { terraforming: {} }, desc: "Industrial CO2 scrubbers and N2 release." },
    { name: "Core Geothermal", ticker: "HEAT", sector: { energy: {} }, desc: "Deep bore geothermal taps." },
    { name: "DAO Governance", ticker: "VOTE", sector: { governance: {} }, desc: "Decentralized colony management solutions." },
    { name: "Xenon Propulsion", ticker: "ION", sector: { tech: {} }, desc: "Next-gen ion drives for inter-moon transit." },
    { name: "Regolith Bricks", ticker: "BLD", sector: { mining: {} }, desc: "Sintered regolith for radiation-proof housing." },
    { name: "SkyHook Elevators", ticker: "LIFT", sector: { logistics: {} }, desc: "Space elevator tether maintenance." },
    { name: "Blue Origin Mars", ticker: "BLUE", sector: { logistics: {} }, desc: "Legacy transport contracts." }
];

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

// --- MAIN ---
async function main() {
    const connection = new Connection(RPC_URL, "confirmed");
    const wallet = new Wallet(walletKeypair);
    const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "confirmed" });
    anchor.setProvider(provider);
    const program = new Program(idl as anchor.Idl, provider);

    console.log(`Starting Market Seed with ${COMPANIES.length} companies...`);
    console.log(`Wallet: ${wallet.publicKey.toString()}`);

    for (const [index, company] of COMPANIES.entries()) {
        console.log(`\n--- [${index + 1}/20] Processing ${company.name} ($${company.ticker}) ---`);
        
        let mintAddress: PublicKey;
        let curveAddress: PublicKey;
        let configAddress: PublicKey;
        let curveTokenVault: PublicKey;
        let userTokenAccount: PublicKey;

        // 1. Derive Addresses
        try {
            // Add randomness to ticker to avoid "already exists" if re-running
            const ticker = company.ticker; // + Math.floor(Math.random() * 999); 
            
            [mintAddress] = PublicKey.findProgramAddressSync(
                [Buffer.from("mint"), wallet.publicKey.toBuffer(), Buffer.from(ticker)],
                program.programId
            );

            [curveAddress] = PublicKey.findProgramAddressSync(
                [Buffer.from("curve"), mintAddress.toBuffer()],
                program.programId
            );
            const [vestingAddress] = PublicKey.findProgramAddressSync(
                [Buffer.from("vesting"), mintAddress.toBuffer()],
                program.programId
            );
            [configAddress] = PublicKey.findProgramAddressSync(
                [Buffer.from("config")],
                program.programId
            );
            curveTokenVault = getAssociatedTokenAddress(mintAddress, curveAddress);
            const [vestingTokenVault] = PublicKey.findProgramAddressSync(
                [Buffer.from("vesting_vault"), mintAddress.toBuffer()],
                program.programId
            );
            userTokenAccount = getAssociatedTokenAddress(mintAddress, wallet.publicKey);

            // 2. Launch (Try/Catch in case already exists)
            try {
                const tx = await program.methods
                .createBusiness(company.name, ticker, company.desc, company.sector)
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
                .preInstructions([ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 })])
                .rpc();
                console.log(`✅ Launched! TX: ${tx}`);
            } catch (e: any) {
                if (e.message && e.message.includes("0x0")) { // Account already in use
                    console.log(`⚠️  Already launched. Continuing to trade...`);
                } else {
                    console.log(`❌ Launch Error: ${e.message}`);
                    // If launch failed and it wasn't "already in use", we probably can't trade.
                    // But maybe we can.
                }
            }

            // 3. Execute Random Trades (3-5 trades per company)
            const numTrades = 3 + Math.floor(Math.random() * 3);
            console.log(`📊 Executing ${numTrades} trades...`);

            for (let i = 0; i < numTrades; i++) {
                const isBuy = Math.random() > 0.3; // 70% chance to buy
                let amount;
                
                if (isBuy) {
                    // Buy 0.01 - 0.2 SOL
                    amount = new BN((0.01 + Math.random() * 0.19) * LAMPORTS_PER_SOL);
                } else {
                    // Sell tokens (need to ensure we have some)
                    // We just bought some, so we should have tokens.
                    // Estimate tokens: 1 SOL ~ 33M tokens initially. 0.1 SOL ~ 3M.
                    // Sell 1M - 5M tokens
                    amount = new BN((1_000_000 + Math.random() * 4_000_000) * 1_000_000); // Decimals 6
                }

                try {
                    const tx = await program.methods
                    .swap(isBuy, amount, new BN(0))
                    .accounts({
                        config: configAddress,
                        curve: curveAddress,
                        user: wallet.publicKey,
                        userTokenAccount: userTokenAccount,
                        curveTokenVault: curveTokenVault,
                        adminTreasury: wallet.publicKey,
                        yieldDistributor: wallet.publicKey,
                        tokenProgram: TOKEN_PROGRAM_ID,
                        systemProgram: SystemProgram.programId,
                    } as any)
                    .preInstructions([ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 })])
                    .rpc();
                    process.stdout.write(isBuy ? "🟢" : "🔴");
                } catch (e: any) {
                    process.stdout.write("❌");
                }
                await new Promise(r => setTimeout(r, 500)); // Rate limit
            }
            console.log(""); // Newline

        } catch (err) {
            console.error(`Error processing ${company.ticker}:`, err);
        }
    }
import * as readline from 'readline';

// ... (previous code)

    console.log("Done seeding market!");
}

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