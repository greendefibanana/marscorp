import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import BN from 'bn.js';
import { Company } from '../types';
import idl from '../marscorp-chain/target/idl/marscorp_exchange.json';
import { Buffer } from 'buffer';
import pg from 'pg';

const { Pool } = pg;

// --- CONFIGURATION ---
const RPC_URL = "https://api.devnet.solana.com";
const PROGRAM_ID = new PublicKey("5GKfHwujgiKLXP84f28HyGL5FJ3AnunKsVGmKDmG6RXi");
const SEED_WALLET_PUBKEY = new PublicKey("9BeBqNy15zt5mq112RrR35GaHNoqkPNFe1brhtEocdpU");

// DB Setup (Vercel Postgres or Local)
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: process.env.POSTGRES_URL ? { rejectUnauthorized: false } : undefined
});

// --- DATASET (Initial Seed) ---
const INITIAL_METADATA = [
    { name: "Red Dust Mining", ticker: "DUST", sector: "Mining", desc: "Extracting rare earth metals from the Tharsis region.", region: "Tharsis Rise" },
    { name: "Olympus Energy", ticker: "SOLR", sector: "Energy", desc: "Orbital mirror arrays providing 24/7 solar power.", region: "Olympus Mons" },
    { name: "Valles Water Corp", ticker: "H2O", sector: "Terraforming", desc: "Deep crust aquifer drilling logistics.", region: "Valles Marineris" },
    { name: "Phobos Transport", ticker: "SHIP", sector: "Logistics", desc: "High-speed maglev connection between colonies.", region: "Phobos" },
    { name: "TerraLabs Bio", ticker: "BIO", sector: "Tech", desc: "Genetically modified lichen for rapid oxygenation.", region: "Hellas Basin" },
    { name: "Martian Realty", ticker: "LAND", sector: "Governance", desc: "Prime crater real estate tokenization.", region: "Global" },
    { name: "Iron Sands Ltd", ticker: "IRON", sector: "Mining", desc: "Ferrous oxide refinement at scale.", region: "Gusev Crater" },
    { name: "Ares Security", ticker: "SEC", sector: "Tech", desc: "Automated drone defense for remote outposts.", region: "Ares Vallis" },
    { name: "Green Dome Inc", ticker: "GRO", sector: "Terraforming", desc: "Hydroponic mega-structures for food independence.", region: "Amazonis" },
    { name: "Helium-3 Ventures", ticker: "HE3", sector: "Energy", desc: "Fusion fuel extraction and processing.", region: "South Pole" },
    { name: "Canyon Echo Comms", ticker: "COMM", sector: "Tech", desc: "Subsurface neutrino communication network.", region: "Valles Marineris" },
    { name: "Rover Logistics", ticker: "ROVR", sector: "Logistics", desc: "Autonomous heavy haulers for mining ops.", region: "Jezero Crater" },
    { name: "Polar Iceworks", ticker: "ICE", sector: "Mining", desc: "Harvesting the northern polar caps.", region: "North Pole" },
    { name: "Atmosphere Gen", ticker: "AIR", sector: "Terraforming", desc: "Industrial CO2 scrubbers and N2 release.", region: "Atmosphere" },
    { name: "Core Geothermal", ticker: "HEAT", sector: "Energy", desc: "Deep bore geothermal taps.", region: "Cerberus Fossae" },
    { name: "DAO Governance", ticker: "VOTE", sector: "Governance", desc: "Decentralized colony management solutions.", region: "Global" },
    { name: "Xenon Propulsion", ticker: "ION", sector: "Tech", desc: "Next-gen ion drives for inter-moon transit.", region: "Orbit" },
    { name: "Regolith Bricks", ticker: "BLD", sector: "Mining", desc: "Sintered regolith for radiation-proof housing.", region: "Cydonia" },
    { name: "SkyHook Elevators", ticker: "LIFT", sector: "Logistics", desc: "Space elevator tether maintenance.", region: "Equator" },
    { name: "Blue Origin Mars", ticker: "BLUE", sector: "Logistics", desc: "Legacy transport contracts.", region: "Landing Zone 1" }
];

let COMPANIES_METADATA = [...INITIAL_METADATA];

// Connection Setup
const connection = new Connection(RPC_URL, "confirmed");
// Mock provider for read-only access
const provider = new AnchorProvider(connection, { publicKey: SEED_WALLET_PUBKEY } as any, { preflightCommitment: "confirmed" });
const program = new Program(idl as unknown as Idl, provider);

// Cache
let cachedData: Company[] = [];
let lastFetch = 0;
const CACHE_TTL = 5000; // 5 seconds

// Helper: Fetch Metadata from DB or Fallback
const getMetadata = async () => {
    try {
        const client = await pool.connect();
        try {
            // Ensure Table Exists (Auto-migration for Demo)
            await client.query(`
                CREATE TABLE IF NOT EXISTS companies (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    ticker VARCHAR(10) UNIQUE NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    sector VARCHAR(50) NOT NULL,
                    description TEXT,
                    region VARCHAR(100),
                    socials JSONB DEFAULT '{}',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `);

            // Check if table exists and has data
            const res = await client.query('SELECT ticker, name, sector, description, region FROM companies');
            if (res.rows.length > 0) {
                // Map DB rows to Metadata format
                return res.rows.map((row: any) => ({
                    ticker: row.ticker,
                    name: row.name,
                    sector: row.sector,
                    desc: row.description,
                    region: row.region
                }));
            } else {
                // Seed DB
                console.log("Seeding DB...");
                for (const meta of INITIAL_METADATA) {
                     await client.query(
                        `INSERT INTO companies (ticker, name, sector, description, region)
                         VALUES ($1, $2, $3, $4, $5)
                         ON CONFLICT (ticker) DO NOTHING`,
                        [meta.ticker, meta.name, meta.sector, meta.desc, meta.region]
                    );
                }
                return INITIAL_METADATA;
            }
        } finally {
            client.release();
        }
    } catch (e) {
        console.warn("DB Connection failed, using in-memory metadata:", e);
        return COMPANIES_METADATA;
    }
};

export const getExchangeTable = async (): Promise<Company[]> => {
    // Return cache if fresh
    if (Date.now() - lastFetch < CACHE_TTL && cachedData.length > 0) {
        return cachedData;
    }

    console.log("Fetching live on-chain data...");
    
    // Get Metadata source
    const metadata = await getMetadata();
    
    const companies: Company[] = [];

    // Parallel fetch for speed
    const promises = metadata.map(async (meta: any) => {
        try {
            // Derive Addresses Deterministically
            const [mintAddress] = PublicKey.findProgramAddressSync(
                [Buffer.from("mint"), SEED_WALLET_PUBKEY.toBuffer(), Buffer.from(meta.ticker)],
                program.programId
            );

            const [curveAddress] = PublicKey.findProgramAddressSync(
                [Buffer.from("curve"), mintAddress.toBuffer()],
                program.programId
            );

            // Fetch Account
            const curveAccount = await program.account.bondingCurve.fetch(curveAddress);

            // Calculate Metrics
            const virtualSol = new BN(curveAccount.virtualSol);
            const virtualTokens = new BN(curveAccount.virtualTokens);
            const realSol = new BN(curveAccount.realSol);

            const price = virtualSol.toNumber() / virtualTokens.toNumber(); 
            const marketCap = price * 1_000_000_000;
            const volume = realSol.toNumber() / LAMPORTS_PER_SOL; 
            const apy = (volume * 0.1) + 2; 

            return {
                id: mintAddress.toString(),
                mint: mintAddress.toString(),
                ticker: meta.ticker,
                name: meta.name,
                price: price, 
                change: (Math.random() * 10) - 5, 
                volume: volume * 1000, 
                sector: meta.sector as any,
                description: meta.desc,
                region: meta.region,
                yield: `${apy.toFixed(1)}% APY`,
                marketCap: marketCap,
                apy: apy,
                production: "Active",
                takeover: { 
                    active: curveAccount.takeoverActive as boolean, 
                    progress: 0 
                }
            };

        } catch (e) {
            // console.warn(`Failed to fetch ${meta.ticker}:`, e);
            return null;
        }
    });

    const results = await Promise.all(promises);
    const validCompanies = results.filter(c => c !== null) as Company[];
    
    cachedData = validCompanies;
    lastFetch = Date.now();

    return validCompanies;
};

export const addCompanyToIndexer = async (company: { name: string, ticker: string, sector: string, desc: string, region: string }) => {
    // Update In-Memory
    COMPANIES_METADATA.unshift(company); 
    cachedData = []; 

    // Update DB
    try {
        const client = await pool.connect();
        try {
            await client.query(
                `INSERT INTO companies (ticker, name, sector, description, region)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (ticker) DO NOTHING`,
                [company.ticker, company.name, company.sector, company.desc, company.region]
            );
            console.log(`[Indexer] Persisted ${company.ticker} to DB.`);
        } finally {
            client.release();
        }
    } catch (e) {
        console.warn("DB Write failed (using in-memory only):", e);
    }
    
    console.log(`[Indexer] Added new company: ${company.name} ($${company.ticker})`);
};
