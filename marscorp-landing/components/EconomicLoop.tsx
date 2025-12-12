import React from 'react';
import { motion } from 'framer-motion';
import { Box, TrendingUp, Crosshair, Landmark, RefreshCw } from 'lucide-react';

const EconomicLoop = () => {
  // SVG Config
  const width = 1000;
  const height = 600;

  return (
    <div className="relative w-full aspect-[16/10] md:aspect-[2/1] bg-black border border-border rounded-3xl overflow-hidden flex items-center justify-center select-none group">
      <div className="absolute inset-0 grid-bg opacity-30" />
      
      {/* Animated Background Pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-solana-green/5 rounded-full blur-3xl animate-pulse" />

      {/* SVG Layer for Flow Lines */}
      <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14F195" stopOpacity="0" />
            <stop offset="50%" stopColor="#14F195" stopOpacity="1" />
            <stop offset="100%" stopColor="#14F195" stopOpacity="0" />
          </linearGradient>
          
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#14F195" fillOpacity="0.8"/>
          </marker>
        </defs>

        {/* Path 1: Builder (Top) -> Trader (Bottom Right) */}
        {/* Adjusted coordinates for responsiveness feeling */}
        <motion.path 
          d="M 560 140 C 750 140, 820 250, 820 420"
          fill="none"
          stroke="url(#gradient-line)"
          strokeWidth="2"
          strokeDasharray="8 8"
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          markerEnd="url(#arrow)"
        />
        
        {/* Path 2: Trader (Bottom Right) -> Speculator (Bottom Left) */}
        <motion.path 
          d="M 770 470 C 650 540, 350 540, 230 470"
          fill="none"
          stroke="url(#gradient-line)"
          strokeWidth="2"
          strokeDasharray="8 8"
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear", delay: 1.3 }}
          markerEnd="url(#arrow)"
        />

        {/* Path 3: Speculator (Bottom Left) -> Builder (Top) */}
        <motion.path 
          d="M 180 420 C 180 250, 250 140, 440 140"
          fill="none"
          stroke="url(#gradient-line)"
          strokeWidth="2"
          strokeDasharray="8 8"
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear", delay: 2.6 }}
          markerEnd="url(#arrow)"
        />

        {/* Particles traveling the paths */}
        <circle r="4" fill="#ffffff" filter="drop-shadow(0 0 4px #14F195)">
          <animateMotion dur="4s" repeatCount="indefinite" path="M 560 140 C 750 140, 820 250, 820 420" />
        </circle>
        <circle r="4" fill="#ffffff" filter="drop-shadow(0 0 4px #14F195)">
          <animateMotion dur="4s" repeatCount="indefinite" begin="1.3s" path="M 770 470 C 650 540, 350 540, 230 470" />
        </circle>
        <circle r="4" fill="#ffffff" filter="drop-shadow(0 0 4px #14F195)">
          <animateMotion dur="4s" repeatCount="indefinite" begin="2.6s" path="M 180 420 C 180 250, 250 140, 440 140" />
        </circle>

        {/* Connection to Center (Treasury) */}
        <motion.path 
          d="M 780 440 L 560 320"
          stroke="#9945FF" 
          strokeWidth="1" 
          strokeDasharray="4 4" 
          opacity="0.4"
          animate={{ strokeDashoffset: [20, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        />
        <motion.path 
          d="M 220 440 L 440 320"
          stroke="#9945FF" 
          strokeWidth="1" 
          strokeDasharray="4 4" 
          opacity="0.4"
          animate={{ strokeDashoffset: [20, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        />
      </svg>

      {/* --- NODES --- */}

      {/* CENTER: TREASURY */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[20%] z-20 flex flex-col items-center">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-black border border-solana-purple/50 flex flex-col items-center justify-center shadow-[0_0_60px_-10px_rgba(153,69,255,0.3)] relative">
            <div className="absolute inset-0 rounded-full border border-white/10 animate-spin-slow" />
            <Landmark className="text-solana-purple mb-1" size={28} />
            <div className="text-[10px] md:text-xs font-bold tracking-widest text-white">TREASURY</div>
        </div>
        <div className="mt-2 text-[10px] font-mono text-solana-purple bg-solana-purple/10 px-2 py-1 rounded">
            FEE CAPTURE
        </div>
      </div>

      {/* TOP: BUILDER */}
      <motion.div 
        className="absolute top-[8%] left-1/2 -translate-x-1/2 z-20"
        initial={{ y: -20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="bg-surface border border-border p-4 rounded-xl flex items-center gap-4 shadow-2xl hover:border-blue-500/50 transition-colors w-64">
            <div className="bg-blue-500/20 p-3 rounded-lg text-blue-500">
                <Box size={24} />
            </div>
            <div>
                <div className="text-xs font-mono text-blue-500 mb-0.5">LAYER 1</div>
                <h3 className="font-bold text-lg">Builder</h3>
                <p className="text-[10px] text-text-secondary">Produces Assets</p>
            </div>
        </div>
      </motion.div>

      {/* BOTTOM RIGHT: TRADER */}
      <motion.div 
        className="absolute bottom-[10%] right-[5%] md:right-[15%] z-20"
        initial={{ x: 20, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="bg-surface border border-border p-4 rounded-xl flex items-center gap-4 shadow-2xl hover:border-solana-green/50 transition-colors w-64">
            <div className="bg-solana-green/20 p-3 rounded-lg text-solana-green">
                <TrendingUp size={24} />
            </div>
            <div>
                <div className="text-xs font-mono text-solana-green mb-0.5">LAYER 2</div>
                <h3 className="font-bold text-lg">Trader</h3>
                <p className="text-[10px] text-text-secondary">Provides Liquidity</p>
            </div>
        </div>
      </motion.div>

      {/* BOTTOM LEFT: SPECULATOR */}
      <motion.div 
        className="absolute bottom-[10%] left-[5%] md:left-[15%] z-20"
        initial={{ x: -20, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="bg-surface border border-border p-4 rounded-xl flex flex-row-reverse md:flex-row items-center gap-4 shadow-2xl hover:border-mars-red/50 transition-colors w-64 text-right md:text-left">
            <div className="bg-mars-red/20 p-3 rounded-lg text-mars-red">
                <Crosshair size={24} />
            </div>
            <div>
                <div className="text-xs font-mono text-mars-red mb-0.5">LAYER 3</div>
                <h3 className="font-bold text-lg">Speculator</h3>
                <p className="text-[10px] text-text-secondary">Bets on Outcomes</p>
            </div>
        </div>
      </motion.div>

      {/* FLOATING LABELS */}
      <div className="absolute top-[30%] right-[22%] z-10 hidden md:block">
        <div className="bg-black/50 backdrop-blur px-3 py-1 rounded border border-white/10 text-[10px] font-mono text-solana-green flex items-center gap-2">
            IPOs Launch <RefreshCw size={10} className="animate-spin" />
        </div>
      </div>
      
      <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 z-10 hidden md:block">
        <div className="bg-black/50 backdrop-blur px-3 py-1 rounded border border-white/10 text-[10px] font-mono text-mars-red">
            &larr; Volatility Events &rarr;
        </div>
      </div>

      <div className="absolute top-[30%] left-[22%] z-10 hidden md:block">
        <div className="bg-black/50 backdrop-blur px-3 py-1 rounded border border-white/10 text-[10px] font-mono text-blue-400">
            Market Feedback
        </div>
      </div>

    </div>
  );
};

export default EconomicLoop;