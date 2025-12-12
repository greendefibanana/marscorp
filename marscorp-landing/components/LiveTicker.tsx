import React from 'react';
import { motion } from 'framer-motion';

const MOCK_TICKERS = [
  { name: 'MWTR', price: 0.42, change: 5.2 },
  { name: 'MIRON', price: 1.05, change: -2.1 },
  { name: 'OXYG', price: 0.88, change: 12.4 },
  { name: 'SOLR', price: 2.30, change: 0.8 },
  { name: 'DUST', price: 0.05, change: -15.3 },
  { name: 'TERRA', price: 15.40, change: 3.2 },
  { name: 'H3', price: 4.20, change: 69.0 },
];

const LiveTicker = () => {
  return (
    <div className="w-full bg-surface border-y border-border py-3 overflow-hidden flex z-20">
      <motion.div 
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      >
        {[...MOCK_TICKERS, ...MOCK_TICKERS, ...MOCK_TICKERS].map((t, i) => (
          <div key={i} className="flex items-center gap-3 font-mono text-xs">
            <span className="font-bold text-text-primary">{t.name}</span>
            <span className="text-text-secondary">${t.price.toFixed(2)}</span>
            <span className={t.change >= 0 ? 'text-solana-green' : 'text-mars-red'}>
              {t.change > 0 ? '+' : ''}{t.change}%
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default LiveTicker;