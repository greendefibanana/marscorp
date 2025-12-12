import React from 'react';
import { motion } from 'framer-motion';
import { Hammer, Wallet, Eye } from 'lucide-react';

const PERSONAS = [
  {
    title: 'Builder',
    icon: Hammer,
    desc: 'Strategic sim gameplay. Claim territories, construct facilities, manage operations, launch IPOs.',
    win: 'Victory: $1M Net Worth',
    color: 'hover:border-blue-500/50 hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)]'
  },
  {
    title: 'Trader',
    icon: Wallet,
    desc: 'Never touch Mars. Buy IPO tokens, flip for profit, yield farm profitable companies, arbitrage markets.',
    win: 'Victory: 200% Portfolio APY',
    color: 'hover:border-solana-green/50 hover:shadow-[0_0_30px_-10px_rgba(20,241,149,0.3)]'
  },
  {
    title: 'Speculator',
    icon: Eye,
    desc: 'Pure prediction markets. Bet on company performance, random events, and hostile takeovers.',
    win: 'Victory: 75% Win Rate',
    color: 'hover:border-mars-red/50 hover:shadow-[0_0_30px_-10px_rgba(255,69,0,0.3)]'
  }
];

const PersonaCards = () => {
  return (
    <div>
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">Choose Your Role</h2>
        <p className="text-text-secondary">Play the sim. Play the market. Or play the odds.</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {PERSONAS.map((p, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-surface border border-border p-8 rounded-3xl transition-all duration-300 group ${p.color}`}
          >
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <p.icon className="text-text-primary" size={24} />
            </div>
            
            <h3 className="text-2xl font-bold mb-4">{p.title}</h3>
            <p className="text-text-secondary leading-relaxed mb-8 h-24">
              {p.desc}
            </p>
            
            <div className="pt-6 border-t border-border/50">
              <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">Goal</span>
              <div className="font-bold text-text-primary mt-1">{p.win}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PersonaCards;