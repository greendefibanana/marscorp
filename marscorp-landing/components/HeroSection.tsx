import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative min-h-[90vh] flex flex-col justify-center items-center px-6 overflow-hidden pt-20">
      {/* Background Grid */}
      <div className="absolute inset-0 grid-bg opacity-40 z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background z-0 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-white/5 text-xs font-mono text-solana-green mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-solana-green animate-pulse" />
          SYSTEM LIVE ON DEVNET
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50"
        >
          MARSCORP
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-light"
        >
          The First On-Chain Civilization Economy. <br/>
          <span className="text-text-primary">Build. Trade. Speculate.</span>
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col md:flex-row items-center justify-center gap-4"
        >
          <button className="w-full md:w-auto px-8 py-4 bg-white text-black rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
            Start Terminals <ArrowRight size={18} />
          </button>
          <button className="w-full md:w-auto px-8 py-4 bg-transparent border border-border text-text-primary rounded-full font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-colors group">
            <Terminal size={18} className="text-text-secondary group-hover:text-solana-green transition-colors" />
            Read Manifesto
          </button>
        </motion.div>
      </div>

      {/* Abstract Abstract */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-6 hidden md:block max-w-xs"
      >
        <h4 className="text-xs font-mono text-text-secondary mb-2 uppercase tracking-widest">Abstract</h4>
        <p className="text-xs text-text-secondary/60 leading-relaxed border-l border-border pl-3">
          MarsCorp revolutionizes blockchain gaming by merging city-building simulation, real-time capital markets, and prediction markets into a single, interconnected economy.
        </p>
      </motion.div>
    </div>
  );
};

export default HeroSection;