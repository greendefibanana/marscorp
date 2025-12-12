import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, TrendingUp, Crosshair } from 'lucide-react';

const LAYERS = [
  {
    id: 'layer1',
    title: 'Layer 1: Production',
    subtitle: 'The Sim Game',
    icon: Box,
    desc: 'Players claim Martian territories and build resource extraction facilities in a stunning isometric 3D environment. Every building is an asset. Every resource has real market value.',
    stat: '240 H₂O / day',
    color: 'bg-blue-500',
    highlight: 'Production feeds finance.'
  },
  {
    id: 'layer2',
    title: 'Layer 2: Capital Markets',
    subtitle: 'IPOs & Trading',
    icon: TrendingUp,
    desc: 'Every business becomes a tradeable SPL token. Built a profitable water company? Launch it as an IPO. Trading fees flow directly to token holders as resource dividends.',
    stat: '3% Yield on Volume',
    color: 'bg-solana-green',
    highlight: 'Revenue sharing, not inflation.'
  },
  {
    id: 'layer3',
    title: 'Layer 3: Speculation',
    subtitle: 'Prediction Markets',
    icon: Crosshair,
    desc: 'Every event spawns prediction markets. Will $MWTR hit $0.25? Will the hostile takeover succeed? Speculators never build; they bet on the chaos builders create.',
    stat: '$50B Market Opportunity',
    color: 'bg-mars-red',
    highlight: 'Information is edge.'
  }
];

const FeatureLayers = () => {
  const [activeLayer, setActiveLayer] = useState(0);

  return (
    <div className="py-24 px-6 max-w-7xl mx-auto">
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Three Economies. One System.</h2>
        <p className="text-text-secondary max-w-2xl">
          Most games focus on one mechanic. MarsCorp integrates three distinct economic layers into a single vertical slice.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8 h-[600px] md:h-[500px]">
        {/* Layer Selection */}
        <div className="md:col-span-5 flex flex-col justify-between h-full gap-4">
          {LAYERS.map((layer, idx) => (
            <div 
              key={layer.id}
              onClick={() => setActiveLayer(idx)}
              className={`flex-1 p-6 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                activeLayer === idx 
                  ? 'bg-white/5 border-solana-green/50' 
                  : 'bg-transparent border-border hover:border-text-secondary/50'
              }`}
            >
              <div className="relative z-10 flex items-center gap-4">
                <div className={`p-3 rounded-lg ${activeLayer === idx ? 'bg-white/10 text-white' : 'bg-surface text-text-secondary'}`}>
                  <layer.icon size={24} />
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${activeLayer === idx ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {layer.title}
                  </h3>
                  <p className="text-xs font-mono text-text-secondary uppercase">{layer.subtitle}</p>
                </div>
              </div>
              
              {/* Progress Bar for Active */}
              {activeLayer === idx && (
                <motion.div 
                  layoutId="active-glow"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-solana-green" 
                />
              )}
            </div>
          ))}
        </div>

        {/* Layer Detail View */}
        <div className="md:col-span-7 bg-surface rounded-3xl border border-border p-8 relative overflow-hidden flex flex-col justify-center">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px]" />
            
            <AnimatePresence mode='wait'>
              <motion.div
                key={activeLayer}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
              >
                <div className="inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono mb-6">
                  {LAYERS[activeLayer].highlight}
                </div>
                
                <h3 className="text-3xl font-bold mb-6">{LAYERS[activeLayer].title}</h3>
                
                <p className="text-lg text-text-secondary leading-relaxed mb-8">
                  {LAYERS[activeLayer].desc}
                </p>

                <div className="p-6 bg-black/20 rounded-2xl border border-white/5">
                  <div className="text-xs font-mono text-text-secondary uppercase mb-2">Key Metric</div>
                  <div className={`text-2xl font-mono font-bold ${activeLayer === 1 ? 'text-solana-green' : activeLayer === 2 ? 'text-mars-red' : 'text-white'}`}>
                    {LAYERS[activeLayer].stat}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FeatureLayers;