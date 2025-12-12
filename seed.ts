import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const initialCompanies = [
    {
        ticker: "MCA",
        name: "Mars Colony Architects",
        sector: "Terraforming",
        description: "Pioneering the future of Martian habitation. Building sustainable domes and infrastructure.",
        region: "Valles Marineris",
        production_rate: "10 Habitat Units/Day",
        price: 1.5,
        total_supply: 1000000,
        socials: JSON.stringify({ x: "https://x.com/MCA", telegram: "https://t.me/MCA" })
    },
    {
        ticker: "ORE",
        name: "Olympus Resources Inc.",
        sector: "Mining",
        description: "Extracting valuable minerals from the Martian crust. Specializing in rare earth elements.",
        region: "Olympus Mons",
        production_rate: "500 Iron/Day",
        price: 0.8,
        total_supply: 1000000,
        socials: JSON.stringify({ discord: "https://discord.gg/ORE" })
    },
    {
        ticker: "AQUA",
        name: "Ares Water Systems",
        sector: "Energy",
        description: "Providing sustainable water and energy solutions for Martian settlements through ice mining and fusion.",
        region: "North Pole",
        production_rate: "1000L Water/Day",
        price: 3.2,
        total_supply: 1000000,
        socials: JSON.stringify({ x: "https://x.com/AQUA" })
    },
    {
        ticker: "BIO",
        name: "Bio-Harvest Martian",
        sector: "Tech",
        description: "Innovating in Martian agriculture and biotechnology to ensure food security.",
        region: "Amazonis Planitia",
        production_rate: "200 Food Units/Day",
        price: 2.1,
        total_supply: 1000000,
        socials: JSON.stringify({})
    },
    {
        ticker: "GOV",
        name: "Mars Governance DAO",
        sector: "Governance",
        description: "Decentralized autonomous organization overseeing Mars development policies.",
        region: "Global Mars",
        production_rate: "Policy Decisions",
        price: 10.0,
        total_supply: 1000000,
        socials: JSON.stringify({ discord: "https://discord.gg/MGD" })
    }
];

const seed = async () => {
    console.log("Seeding database...");
    
    try {
        for (const company of initialCompanies) {
            // 1. Insert Company
            const res = await pool.query(`
                INSERT INTO companies (ticker, name, sector, description, region, production_rate, socials)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (ticker) DO NOTHING
                RETURNING id;
            `, [company.ticker, company.name, company.sector, company.description, company.region, company.production_rate, company.socials]);

            if (res.rowCount === 0) {
                console.log(`Skipping ${company.ticker} (already exists)`);
                continue;
            }

            // 2. Insert Initial Token
            await pool.query(`
                INSERT INTO tokens (ticker, mint_address, total_supply, creator_wallet)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (ticker) DO NOTHING
            `, [company.ticker, `mock_mint_${company.ticker}`, company.total_supply, 'mock_creator_wallet']);

            // 3. Insert Initial Price
            await pool.query(`
                INSERT INTO prices (ticker, price, source)
                VALUES ($1, $2, 'seed_script')
            `, [company.ticker, company.price]);

            console.log(`Seeded ${company.ticker}`);
        }
        console.log("Database seeding complete!");
    } catch (e) {
        console.error("Seeding failed:", e);
    } finally {
        await pool.end();
    }
};

seed();