import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Terminal, 
  TrendingUp, 
  Box, 
  Activity, 
  Zap, 
  ShieldAlert, 
  Crosshair, 
  Globe,
  Check,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import HeroSection from './components/HeroSection';
import FeatureLayers from './components/FeatureLayers';
import EconomicLoop from './components/EconomicLoop';
import LiveTicker from './components/LiveTicker';
import PersonaCards from './components/PersonaCards';
import Footer from './components/Footer';

// Pixel Art Astronaut Logo Component
const Logo = () => (
  <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-bold text-xs font-mono rounded-sm pixelated overflow-hidden relative">
    <div className="absolute inset-0 bg-white" />
    {/* Simple pixel face representation */}
    <div className="relative z-10 w-6 h-4 bg-black rounded-sm" />
    <div className="absolute top-2 w-8 h-6 border-2 border-black rounded-full opacity-20" />
  </div>
);

// Navbar Component
const Navbar = ({ onShowToast }: { onShowToast: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-background/80 backdrop-blur-md border-border py-4' : 'bg-transparent border-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="font-bold tracking-tight text-xl">MarsCorp</span>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button onClick={onShowToast} className="text-sm font-mono text-text-secondary hover:text-text-primary transition-colors">Docs</button>
          <button className="bg-white text-black px-5 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform">
            Join Devnet
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-text-primary" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-6 flex flex-col gap-4 shadow-2xl">
          <button onClick={() => { onShowToast(); setIsOpen(false); }} className="text-lg font-medium text-left">Docs</button>
          <button className="bg-white text-black w-full py-3 rounded-xl font-bold mt-4">
            Join Devnet
          </button>
        </div>
      )}
    </nav>
  );
};

// Toast Component
const Toast = ({ message }: { message: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.95 }}
    className="fixed bottom-6 right-6 z-50 bg-black/90 backdrop-blur border border-solana-green/50 text-solana-green px-6 py-4 rounded-xl shadow-[0_0_30px_-5px_rgba(20,241,149,0.3)] flex items-center gap-4 font-mono text-xs md:text-sm max-w-[90vw]"
  >
    <div className="w-2 h-2 bg-solana-green rounded-full animate-pulse shrink-0" />
    <span className="uppercase tracking-wide">{message}</span>
  </motion.div>
);

export default function App() {
  const [toast, setToast] = useState<string | null>(null);
  const [applyState, setApplyState] = useState<'idle' | 'loading' | 'success'>('idle');

  const triggerToast = () => {
    // Prevent spamming
    if (toast) return;
    setToast("> SYSTEM_MSG: MODULE_UNDER_CONSTRUCTION. STAY_TUNED.");
    setTimeout(() => setToast(null), 3000);
  };

  const handleApply = () => {
    if (applyState !== 'idle') return;
    setApplyState('loading');
    
    // Simulate network request
    setTimeout(() => {
      setApplyState('success');
      setTimeout(() => setApplyState('idle'), 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-solana-green/30 selection:text-solana-green font-sans">
      <Navbar onShowToast={triggerToast} />
      
      <main>
        <HeroSection />
        <LiveTicker />
        
        <div id="vision" className="py-24 px-6 max-w-7xl mx-auto border-b border-border/50">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-sm font-mono text-solana-green mb-4">THE PROBLEM</h2>
              <h3 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                Crypto games are broken.<br />
                <span className="text-text-secondary">Simulations are traps.</span>
              </h3>
              <p className="text-text-secondary text-lg leading-relaxed mb-6">
                Current blockchain games are either terrible visuals with extractive ponzi-nomics, 
                or great games with closed economies where you own nothing.
              </p>
              <p className="text-text-primary text-lg font-medium border-l-2 border-solana-green pl-4">
                MarsCorp is the bridge: Genuine strategic depth meets true digital ownership in a ruthless, open market.
              </p>
            </div>
            <div className="relative h-[300px] w-full bg-surface rounded-2xl border border-border overflow-hidden group">
               <div className="absolute inset-0 bg-[url('https://picsum.photos/800/600?grayscale')] bg-cover opacity-20 mix-blend-overlay" />
               <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
               <div className="absolute bottom-6 left-6 right-6">
                 <div className="font-mono text-xs text-mars-red mb-2 animate-pulse">SYSTEM FAILURE: TRADITIONAL_GAMING.EXE</div>
                 <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-mars-red w-3/4" />
                 </div>
               </div>
            </div>
          </div>
        </div>

        <FeatureLayers />
        
        <div id="economy" className="py-24 bg-surface/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">The Flywheel</h2>
              <p className="text-text-secondary text-lg">
                Three economies. One system. A self-sustaining loop where every builder, trader, and speculator creates value for the others.
              </p>
            </div>
            <EconomicLoop />
          </div>
        </div>

        <div id="gameplay" className="py-24 px-6 max-w-7xl mx-auto">
          <PersonaCards />
        </div>

        <div id="token" className="py-24 px-6 border-t border-border bg-black relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-solana-purple/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-16">
              <div>
                <h2 className="text-4xl md:text-6xl font-bold mb-4">$MARS</h2>
                <p className="text-xl text-text-secondary max-w-md">
                  Not a farm token. A governance primitive for a planetary economy.
                </p>
              </div>
              <div className="text-right hidden md:block">
                <div className="text-sm font-mono text-text-secondary mb-1">CURRENT SUPPLY</div>
                <div className="text-4xl font-mono font-bold">1,000,000,000</div>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { label: "Deflationary", desc: "50% of platform fees buy & burn $MARS", icon: <TrendingUp className="text-solana-green" /> },
                { label: "Governance", desc: "Vote on planetary tax rates & events", icon: <Globe className="text-blue-400" /> },
                { label: "Yield", desc: "Staking multiplies territorial output", icon: <Activity className="text-solana-purple" /> },
                { label: "Utility", desc: "Required for IPOs & Land Claims", icon: <Box className="text-white" /> },
              ].map((item, i) => (
                <div key={i} className="p-6 border border-border bg-surface/50 backdrop-blur rounded-2xl hover:border-text-secondary transition-colors">
                  <div className="mb-4">{item.icon}</div>
                  <h4 className="font-bold text-lg mb-2">{item.label}</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="py-32 px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
            Mars is real.<br/>
            The profits are real.<br/>
            <span className="text-text-secondary">You're just playing from Earth.</span>
          </h2>
          
          <div className="mt-8 flex justify-center">
            <motion.button 
              onClick={handleApply}
              animate={applyState === 'loading' ? { width: '280px' } : { width: 'auto' }}
              className={`
                relative overflow-hidden px-12 py-4 rounded-full font-bold text-lg transition-all duration-300
                ${applyState === 'idle' ? 'bg-white text-black hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]' : ''}
                ${applyState === 'loading' ? 'bg-transparent border border-solana-green text-solana-green cursor-wait' : ''}
                ${applyState === 'success' ? 'bg-solana-green text-black scale-105' : ''}
              `}
            >
              <div className="flex items-center justify-center gap-2">
                {applyState === 'idle' && (
                  <span>Apply for Early Access</span>
                )}
                
                {applyState === 'loading' && (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span className="font-mono text-sm tracking-widest">ESTABLISHING UPLINK...</span>
                  </>
                )}
                
                {applyState === 'success' && (
                  <>
                    <Check size={24} strokeWidth={3} />
                    <span className="font-bold tracking-tight">TRANSMISSION RECEIVED. STANDBY.</span>
                  </>
                )}
              </div>
            </motion.button>
          </div>
        </div>
      </main>

      <Footer onLinkClick={triggerToast} />
      
      <AnimatePresence>
        {toast && <Toast message={toast} />}
      </AnimatePresence>
    </div>
  );
}