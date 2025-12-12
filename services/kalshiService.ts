import { PredictionMarket } from '../types';

interface KalshiMarket {
    ticker: string;
    title: string;
    volume: number;
    yes_bid: number;
    yes_ask: number;
    expiration_time: string;
    category: string;
}

interface KalshiResponse {
    markets: KalshiMarket[];
}

const CATEGORY_MAP: Record<string, 'Atmospheric' | 'Corporate' | 'Commodities' | 'Governance'> = {
    'Economics': 'Corporate',
    'Financials': 'Corporate',
    'Climate': 'Atmospheric',
    'Weather': 'Atmospheric',
    'Politics': 'Governance',
    'Government': 'Governance'
};

export const fetchKalshiMarkets = async (): Promise<PredictionMarket[]> => {
    try {
        const url = 'https://api.elections.kalshi.com/trade-api/v2/markets?limit=20&status=active';
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Kalshi API Error: ${response.statusText}`);
        }

        const data = await response.json() as KalshiResponse;

        return data.markets.map((market) => {
            // Probability Calculation: Midpoint of Bid/Ask
            // Kalshi prices are in cents (1-99). 
            const yesBid = market.yes_bid || 0;
            const yesAsk = market.yes_ask || 100;
            const probYes = ((yesBid + yesAsk) / 2) / 100;

            // Category Mapping
            const mappedCategory = CATEGORY_MAP[market.category] || 'Commodities';

            return {
                id: market.ticker,
                question: market.title,
                category: mappedCategory,
                volume: Number(market.volume),
                liquidity: 0, // Not provided by public endpoint easily, defaulting
                probYes: Number(probYes.toFixed(2)),
                endsAt: new Date(market.expiration_time).toLocaleDateString(),
                description: `Traded on Kalshi. Ticker: ${market.ticker}`,
                oracle: "Kalshi Regulated"
            };
        });

    } catch (error) {
        console.error("Failed to fetch Kalshi markets:", error);
        return []; // Return empty array on failure to not break UI
    }
};
