import { useState, useMemo } from 'react';
import { PredictionMarket } from '../types';

// DEMO DATA for Hackathon
const DEMO_MARKETS: PredictionMarket[] = [
    { 
        id: 'kalshi-1', 
        question: 'Will Mars GDP exceed $50B by Q4 2025?', 
        category: 'Corporate', 
        volume: 450000, 
        liquidity: 120000, 
        probYes: 0.65, 
        endsAt: 'Dec 31',
        description: 'Based on current resource extraction rates from Tharsis Rise.',
        oracle: 'Kalshi Regulated'
    },
    { 
        id: 'kalshi-2', 
        question: 'Will Oxygen levels in Dome Alpha reach 18%?', 
        category: 'Atmospheric', 
        volume: 89000, 
        liquidity: 34000, 
        probYes: 0.88, 
        endsAt: '48h',
        description: 'Algae bloom efficiency has increased by 15% this week.',
        oracle: 'Kalshi Regulated'
    },
    { 
        id: 'kalshi-3', 
        question: 'Will the "Red Dust" strike end before Sol 400?', 
        category: 'Governance', 
        volume: 21000, 
        liquidity: 5000, 
        probYes: 0.32, 
        endsAt: 'Sol 400',
        description: 'Union negotiations have stalled over water rations.',
        oracle: 'Kalshi Regulated'
    },
    { 
        id: 'kalshi-4', 
        question: 'Will Helium-3 exports to Earth double?', 
        category: 'Commodities', 
        volume: 1500000, 
        liquidity: 400000, 
        probYes: 0.51, 
        endsAt: '1 Week',
        description: 'Earth energy crisis is driving demand for He3.',
        oracle: 'Kalshi Regulated'
    }
];

export const useKalshiMarkets = (initialMarkets: PredictionMarket[]) => {
    // In Demo Mode, we just use static data + initial markets
    // No API calls that might fail
    
    const markets = useMemo(() => {
        return [...initialMarkets, ...DEMO_MARKETS];
    }, [initialMarkets]);

    return { 
        markets, 
        isLoading: false, 
        error: null 
    };
};