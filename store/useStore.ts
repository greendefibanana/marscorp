
import { create } from 'zustand';

interface PortfolioItem {
  ticker: string;
  amount: number;
  avgBuyPrice: number;
}

interface StoreState {
  balance: number; // SOL
  portfolio: PortfolioItem[];
  unclaimedYield: number; // Accumulated dividends
  
  // Actions
  buyAsset: (ticker: string, amountSOL: number, currentPrice: number) => void;
  sellAsset: (ticker: string, quantity: number, currentPrice: number) => void;
  getHoldings: (ticker: string) => number;
  claimYield: () => void;
  executeSabotage: (cost: number) => boolean;
  setBalance: (newBalance: number) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  balance: 1000, // Initial Mock Balance
  portfolio: [],
  unclaimedYield: 124.50, // Mock initial yield

  buyAsset: (ticker, amountSOL, currentPrice) => {
    const { balance, portfolio } = get();
    if (amountSOL > balance) return; // Insufficient funds

    const quantity = amountSOL / currentPrice;

    const existingItem = portfolio.find(p => p.ticker === ticker);
    let newPortfolio;

    if (existingItem) {
      // Calculate new average
      const totalCost = (existingItem.amount * existingItem.avgBuyPrice) + amountSOL;
      const totalAmount = existingItem.amount + quantity;
      
      newPortfolio = portfolio.map(p => 
        p.ticker === ticker 
          ? { ...p, amount: totalAmount, avgBuyPrice: totalCost / totalAmount }
          : p
      );
    } else {
      newPortfolio = [...portfolio, { ticker, amount: quantity, avgBuyPrice: currentPrice }];
    }

    set({
      balance: balance - amountSOL,
      portfolio: newPortfolio
    });
  },

  sellAsset: (ticker, quantity, currentPrice) => {
    const { balance, portfolio } = get();
    const item = portfolio.find(p => p.ticker === ticker);
    
    if (!item || item.amount < quantity) return; // Insufficient assets

    const revenue = quantity * currentPrice;
    
    const newPortfolio = portfolio.map(p => 
      p.ticker === ticker 
        ? { ...p, amount: p.amount - quantity }
        : p
    ).filter(p => p.amount > 0.0001); // Remove if practically zero

    set({
      balance: balance + revenue,
      portfolio: newPortfolio
    });
  },

  getHoldings: (ticker) => {
    const item = get().portfolio.find(p => p.ticker === ticker);
    return item ? item.amount : 0;
  },

  claimYield: () => {
    const { balance, unclaimedYield } = get();
    if (unclaimedYield <= 0) return;
    set({
      balance: balance + unclaimedYield,
      unclaimedYield: 0
    });
  },

  executeSabotage: (cost) => {
    const { balance } = get();
    if (balance < cost) return false;
    set({ balance: balance - cost });
    return true;
  },

  setBalance: (newBalance: number) => set({ balance: newBalance }),
}));
