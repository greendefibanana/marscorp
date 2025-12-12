import { Program, AnchorProvider, Idl, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { Pool } from 'pg';
import idl from '../marscorp-chain/target/idl/marscorp_exchange.json';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const connection = new Connection(process.env.RPC_URL || "http://127.0.0.1:8899");
const wallet = {
    publicKey: PublicKey.default,
    signTransaction: async () => { throw new Error("Read-only"); },
    signAllTransactions: async () => { throw new Error("Read-only"); }
};
const provider = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
const program = new Program(idl as Idl, provider);

const main = async () => {
    console.log("Starting Indexer Listener for program:", idl.metadata.address);

    program.addEventListener("BusinessLaunched", async (event, slot) => {
        console.log(`[Event] BusinessLaunched: ${event.name} (${event.symbol})`);
        const client = await pool.connect();
        try {
            await client.query(
                `INSERT INTO companies (mint_address, ticker, name, sector, description, created_at)
                 VALUES ($1, $2, $3, $4, $5, TO_TIMESTAMP($6))
                 ON CONFLICT (mint_address) DO NOTHING`,
                [
                    event.mint.toBase58(), 
                    event.symbol, 
                    event.name, 
                    'Tech', // Default sector, could be fetched from account
                    'Launched via MarsCorp Exchange', 
                    event.timestamp.toNumber()
                ]
            );
            await client.query(
                `INSERT INTO tokens (ticker, mint_address, total_supply)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (ticker) DO NOTHING`,
                [event.symbol, event.mint.toBase58(), 1_000_000_000]
            );
            // Initial Price: 30 SOL / 800M Tokens (Curve pool) ~ 0.0000000375
            await client.query(
                `INSERT INTO prices (ticker, price, is_latest)
                 VALUES ($1, $2, true)
                 ON CONFLICT (ticker) DO UPDATE SET price = $2`,
                [event.symbol, 0.0000000375]
            );
        } catch (e) {
            console.error("DB Error (Business):", e);
        } finally {
            client.release();
        }
    });

    program.addEventListener("PriceUpdated", async (event, slot) => {
        const mint = event.mint.toBase58();
        const solReserves = event.solReserves.toNumber(); 
        const tokenReserves = event.tokenReserves.toNumber();

        if (tokenReserves === 0) return;

        // Price in SOL per Token
        // SOL (9 decimals) / Token (6 decimals)
        // Price = (SOL_Raw / 1e9) / (Token_Raw / 1e6)
        const priceInSol = (solReserves / 1e9) / (tokenReserves / 1e6);
        
        console.log(`[Event] PriceUpdated: Mint ${mint} => $${priceInSol.toFixed(9)}`);

        const client = await pool.connect();
        try {
            const res = await client.query('SELECT ticker FROM tokens WHERE mint_address = $1', [mint]);
            if (res.rows.length === 0) return;
            const ticker = res.rows[0].ticker;

            // Update Latest Price
            await client.query(
                `INSERT INTO prices (ticker, price, is_latest, updated_at)
                 VALUES ($1, $2, true, TO_TIMESTAMP($3))
                 ON CONFLICT (ticker) DO UPDATE SET price = $2, updated_at = TO_TIMESTAMP($3)`,
                [ticker, priceInSol, event.timestamp.toNumber()]
            );

            // Add History Entry
            await client.query(
                `INSERT INTO price_history (ticker, price, timestamp)
                 VALUES ($1, $2, TO_TIMESTAMP($3))`,
                [ticker, priceInSol, event.timestamp.toNumber()]
            );
        } catch (e) {
            console.error("DB Error (Price):", e);
        } finally {
            client.release();
        }
    });
};

main();
