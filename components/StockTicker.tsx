import React from 'react';
import { motion } from 'framer-motion';
import { Company } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockTickerProps {
  companies: Company[];
}

const StockTicker: React.FC<StockTickerProps> = ({ companies }) => {
  // Duplicate list for seamless loop
  const duplicatedCompanies = [...companies, ...companies];

  return (
    <div className="w-full bg-[#050505] border-b border-white/5 overflow-hidden flex h-10 items-center relative z-30">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#050505] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#050505] to-transparent z-10" />
        
        <motion.div 
            className="flex gap-8 items-center px-4 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
                repeat: Infinity, 
                ease: "linear", 
                duration: 20 
            }}
        >
            {duplicatedCompanies.map((company, idx) => (
                <div key={`${company.id}-${idx}`} className="flex items-center gap-2 text-xs font-mono">
                    <span className="font-bold text-white/80">{company.ticker}</span>
                    <span className={`flex items-center gap-0.5 ${company.change >= 0 ? 'text-solana-green' : 'text-mars-red'}`}>
                        {company.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {Math.abs(company.change)}%
                    </span>
                    <span className="text-white/30 ml-1">${company.price.toFixed(2)}</span>
                </div>
            ))}
        </motion.div>
    </div>
  );
};

export default StockTicker;