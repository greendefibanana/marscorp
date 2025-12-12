-- Companies Table (Sim/Metadata)
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticker VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    sector VARCHAR(50) NOT NULL,
    description TEXT,
    region VARCHAR(100),
    production_rate VARCHAR(100),
    socials JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tokens (
    ticker VARCHAR(10) UNIQUE NOT NULL REFERENCES companies(ticker),
    mint_address VARCHAR(44) NOT NULL,
    total_supply BIGINT NOT NULL,
    creator_wallet VARCHAR(44) NOT NULL
);

CREATE TABLE IF NOT EXISTS prices (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL REFERENCES companies(ticker),
    price DECIMAL(18, 9) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(50) DEFAULT 'dex',
    is_latest BOOLEAN DEFAULT true
);

-- Price History (Chart Data)
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    price NUMERIC(20, 9) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Trades Table (Volume)
CREATE TABLE IF NOT EXISTS trades (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    amount_sol NUMERIC(20, 9) NOT NULL,
    is_buy BOOLEAN NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Governance Table (Takeovers)
CREATE TABLE IF NOT EXISTS takeovers (
    ticker VARCHAR(10) PRIMARY KEY,
    is_active BOOLEAN DEFAULT FALSE,
    votes_collected NUMERIC(20, 0) DEFAULT 0,
    votes_required NUMERIC(20, 0) DEFAULT 0,
    end_timestamp TIMESTAMP
);

-- Yield Events (APY)
CREATE TABLE IF NOT EXISTS yield_events (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    amount_sol NUMERIC(20, 9) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);