
export interface Company {
  id: string;
  mint?: string; // SPL Token Mint Address
  ticker: string;
  name: string;
  price: number;
  change: number; // percentage
  volume: number;
  sector: 'Energy' | 'Mining' | 'Tech' | 'Terraforming';
  description?: string;
  region?: string;
  yield?: string;
  socials?: {
    x?: string;
    telegram?: string;
    discord?: string;
  };
  marketCap?: number; // In millions
  apy?: number; // Real Yield APY %
  production?: string; // e.g. "500 Iron/Day"
  takeover?: {
    active: boolean;
    progress: number; // 0-100%
  };
}

export interface Resource {
  id: string;
  ticker: string;
  name: string;
  price: number;
  change: number;
  volatility: 'Low' | 'Med' | 'High';
  supply: string; // e.g. "2.4M Tons"
  cornerPercentage: number; // 0-100, how much one player owns
  history: { time: string; value: number; event?: string }[];
}

export interface PredictionMarket {
  id: string;
  question: string;
  category: 'Atmospheric' | 'Corporate' | 'Commodities' | 'Governance';
  volume: number;
  liquidity: number;
  probYes: number; // 0.0 to 1.0
  endsAt: string;
  image?: string;
  description?: string;
  oracle?: string;
}

export interface MarketStats {
  globalVolume: number; // 0 to 100 scale for simplicity
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  activeIpo: { x: number; y: number; z: number } | null; // 3D coordinates on sphere
  lastCrash: boolean;
}

export interface ChartData {
  time: string;
  value: number;
}
