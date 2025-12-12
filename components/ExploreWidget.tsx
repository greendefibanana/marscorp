
import React from 'react';
import { motion } from 'framer-motion';
import { Company } from '../types';
import { TrendingUp, ArrowRight } from 'lucide-react';

interface ExploreWidgetProps {
  companies: Company[];
  onNavigate: (tab: 'exchange') => void;
}

const ExploreWidget: React.FC<ExploreWidgetProps> = ({ companies, onNavigate }) => {
  // Filter for top performers
  const hotCompanies = companies.filter(c => c.change > 0).slice(0, 5);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full relative overflow-hidden rounded-[2rem] min-h-[320px] p-6 flex flex-col justify-between"
      style={{
        background: 'linear-gradient(135deg, #3B0D18 0%, #1a0b2e 100%)',
      }}
    >
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-solana-purple/20 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-mars-red/20 rounded-full blur-[60px] -ml-12 -mb-12 pointer-events-none" />

        {/* Header */}
        <div className="relative z-10">
            <div className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                <TrendingUp size={14} className="text-solana-green" />
                <span>Mars Economy Live</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Trending <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-solana-green to-blue-400">
                    Sectors
                </span>
            </h2>
        </div>

        {/* Horizontal Scroll Content */}
        <div className="relative z-10 w-full mt-8 overflow-x-auto pb-4 snap-x snap-mandatory flex gap-4 no-scrollbar">
            {hotCompanies.map((company, index) => (
                <div 
                    key={company.id}
                    onClick={() => onNavigate('exchange')} // Assuming linking to exchange generally for now, could link specific
                    className="flex-shrink-0 w-40 h-40 glass-panel rounded-2xl p-4 flex flex-col justify-between snap-center hover:bg-white/10 transition-colors cursor-pointer group"
                >
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-transparent flex items-center justify-center text-lg font-bold">
                            {company.ticker[1]}
                        </div>
                        <span className="text-solana-green font-mono text-xs">
                            +{company.change}%
                        </span>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-white mb-1 group-hover:text-solana-green transition-colors">{company.name}</h4>
                        <p className="text-[10px] text-white/50 uppercase">{company.ticker}</p>
                    </div>
                </div>
            ))}
            
            {/* View All Card */}
            <div 
                onClick={() => onNavigate('exchange')}
                className="flex-shrink-0 w-40 h-40 border border-white/5 rounded-2xl flex items-center justify-center snap-center hover:bg-white/5 cursor-pointer transition-colors"
            >
                <div className="text-center">
                    <div className="w-10 h-10 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-2">
                        <ArrowRight size={20} className="text-white" />
                    </div>
                    <span className="text-xs text-white/60">View All</span>
                </div>
            </div>
        </div>
    </motion.div>
  );
};

export default ExploreWidget;
