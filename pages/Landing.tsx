
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Pickaxe, TrendingUp, BrainCircuit, Rocket, 
  Users, Globe, Zap, ShieldCheck, 
  ArrowRight, Factory, Hexagon, Cpu, Target,
  Coins, BarChart3, ChevronRight, Play, LayoutGrid
} from '../components/Icons';
import { TokenomicsChart } from '../components/TokenomicsChart';
import { BondingCurveChart } from '../components/BondingCurveChart';

// --- Assets ---
const LOGO_URL = "/marscorp-icon.png"; 

const Landing = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Welcome to MarsCorp, citizen ${email}. You have been added to the whitelist.`);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-mars-500 selection:text-white">
      
      {/* --- Navigation --- */}
      <nav className="fixed top-0 w-full z-50 glass-nav transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 overflow-hidden rounded-lg bg-surfaceHighlight border border-white/10">
               <img src={LOGO_URL} alt="MarsCorp Logo" className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
            </div>
            <span className="font-medium text-lg tracking-tight">MarsCorp</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <a href="#economy" className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-full hover:bg-white/5">Economy</a>
            <a href="#gameplay" className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-full hover:bg-white/5">Gameplay</a>
            <a href="#token" className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-full hover:bg-white/5">Token</a>
            <a href="#roadmap" className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-full hover:bg-white/5">Roadmap</a>
          </div>
          <button className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors">
            Connect Wallet
          </button>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header className="relative pt-40 pb-32 overflow-hidden flex flex-col items-center justify-center text-center">
        {/* Subtle Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-mars-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-1.5 rounded-full mb-8 backdrop-blur-md animate-fade-in">
            <span className="w-1.5 h-1.5 bg-solana-green rounded-full animate-pulse"></span>
            <span className="text-xs font-medium text-text-secondary tracking-wide">Network Live on Devnet</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Civilization,<br/>On-Chain.
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl md:text-2xl text-text-secondary mb-12 leading-relaxed font-light">
            Merge city-building, real-time capital markets, and prediction betting into a single, infinite economic loop.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
                onClick={() => navigate('/app')}
                className="px-8 py-4 bg-white text-black rounded-full font-medium text-lg hover:scale-105 transition-transform flex items-center gap-2 group"
            >
              Start Terminal <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-surfaceHighlight border border-white/10 text-white rounded-full font-medium text-lg hover:bg-white/10 transition-colors">
              Read Whitepaper
            </button>
          </div>
          
          <div className="mt-20">
            <img 
              src="https://images.unsplash.com/photo-1614728853913-1e32005e360c?q=80&w=2070&auto=format&fit=crop" 
              alt="Dashboard Preview" 
              className="rounded-2xl border border-white/10 shadow-2xl opacity-80 mx-auto w-full max-w-5xl" 
            />
          </div>
        </div>
      </header>

      {/* --- The Problem (Bento) --- */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">The new standard for<br/>crypto gaming.</h2>
            <p className="text-text-secondary text-lg">Solving the sustainability crisis in play-to-earn.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-panel p-10 rounded-[32px] flex flex-col justify-between h-full">
              <div>
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 text-red-500">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-2xl font-semibold mb-3">The Old Way</h3>
                <p className="text-text-secondary leading-relaxed">
                  Traditional crypto games are often glorified yield farms with extractive economies. Players extract value until the token collapses, leaving latecomers with nothing.
                </p>
              </div>
            </div>
            <div className="glass-panel p-10 rounded-[32px] flex flex-col justify-between h-full relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-solana-green/5 blur-[80px] rounded-full pointer-events-none"></div>
              <div>
                <div className="w-12 h-12 bg-solana-green/10 rounded-2xl flex items-center justify-center mb-6 text-solana-green">
                  <LayoutGrid size={24} />
                </div>
                <h3 className="text-2xl font-semibold mb-3">The MarsCorp Way</h3>
                <p className="text-text-secondary leading-relaxed">
                  A closed-loop economy where production feeds finance, and finance feeds speculation. Value is retained within the system through aligned incentives and asset ownership.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Three Economies (Bento Grid) --- */}
      <section id="economy" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-4xl font-semibold tracking-tight mb-4">Three Layers.<br/><span className="text-text-secondary">One System.</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Layer 1 */}
            <div className="glass-panel p-8 rounded-[32px] flex flex-col h-full hover:bg-white/5 transition-colors duration-300 group">
              <div className="w-14 h-14 bg-surfaceHighlight rounded-full flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-transform">
                <Pickaxe className="text-mars-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Production</h3>
              <p className="text-xs font-mono text-mars-500 mb-4 uppercase tracking-widest">The Sim Game</p>
              <p className="text-text-secondary mb-8 flex-1">
                Build extraction facilities. Every building is an asset. Resources like H₂O and Iron are sold automatically for real SOL yield.
              </p>
              <div className="mt-auto">
                <div className="bg-surfaceHighlight/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                  <div className="flex justify-between text-xs text-text-secondary mb-1">
                     <span>Ice Extractor</span>
                     <span className="text-white">Active</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                     <div className="bg-mars-500 h-full w-3/4"></div>
                  </div>
                  <div className="text-right text-xs mt-1 font-mono text-mars-500">+240 H₂O/day</div>
                </div>
              </div>
            </div>

            {/* Layer 2 */}
            <div className="glass-panel p-8 rounded-[32px] flex flex-col h-full hover:bg-white/5 transition-colors duration-300 group">
              <div className="w-14 h-14 bg-surfaceHighlight rounded-full flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-transform">
                <TrendingUp className="text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Capital Markets</h3>
              <p className="text-xs font-mono text-blue-400 mb-4 uppercase tracking-widest">IPO & Trading</p>
              <p className="text-text-secondary mb-8 flex-1">
                Launch your business as a tradeable token. Trading fees automatically buy resources and distribute them to shareholders.
              </p>
              <div className="mt-auto">
                 <BondingCurveChart />
              </div>
            </div>

            {/* Layer 3 */}
            <div className="glass-panel p-8 rounded-[32px] flex flex-col h-full hover:bg-white/5 transition-colors duration-300 group">
              <div className="w-14 h-14 bg-surfaceHighlight rounded-full flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-transform">
                <BrainCircuit className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Speculation</h3>
              <p className="text-xs font-mono text-purple-400 mb-4 uppercase tracking-widest">Prediction Markets</p>
              <p className="text-text-secondary mb-8 flex-1">
                Bet on outcomes. Will $MWTR hit $0.25? Speculators never build, they just profit from the chaos builders create.
              </p>
              <div className="mt-auto space-y-2">
                 <div className="bg-surfaceHighlight/50 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                    <span className="text-xs text-text-secondary">Region 4 Flood?</span>
                    <span className="text-xs font-bold text-purple-400">YES 32%</span>
                 </div>
                 <div className="bg-surfaceHighlight/50 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                    <span className="text-xs text-text-secondary">$IRON > $5.00</span>
                    <span className="text-xs font-bold text-solana-green">NO 88%</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Flywheel (Process) --- */}
      <section className="py-24 bg-surface border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
           <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight">The Flywheel</h2>
            <p className="text-text-secondary mt-2">Aligned incentives across all player types.</p>
          </div>
          
          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10"></div>

            <div className="grid md:grid-cols-4 gap-4 text-center">
              {[
                { icon: Factory, color: "text-mars-500", title: "Builder", desc: "Produces Resources" },
                { icon: Target, color: "text-blue-400", title: "Trader", desc: "Provides Capital" },
                { icon: Coins, color: "text-yellow-400", title: "Treasury", desc: "Buys Resources" },
                { icon: Zap, color: "text-purple-400", title: "Speculator", desc: "Bets on Outcome" },
              ].map((item, i) => (
                <div key={i} className="bg-background border border-white/10 p-6 rounded-2xl z-10 hover:border-white/20 transition-colors">
                  <item.icon className={`mx-auto ${item.color} mb-3`} size={24} />
                  <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-text-secondary">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- Gameplay Tabs --- */}
      <section id="gameplay" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                 <h2 className="text-4xl font-semibold tracking-tight mb-6">Play Your Way</h2>
                 <p className="text-text-secondary text-lg mb-12">MarsCorp supports three distinct playstyles. Whether you want to manage a complex supply chain or flip tokens.</p>
                 
                 <div className="space-y-4">
                    {[
                      { icon: Hexagon, color: "text-mars-500", bg: "bg-mars-500/10", title: "Builder Mode", desc: "Strategic sim. Claim land, build facilities.", goal: "$1M Net Worth" },
                      { icon: BarChart3, color: "text-blue-400", bg: "bg-blue-400/10", title: "Trader Mode", desc: "Pure DeFi. Yield farm companies, arbitrage.", goal: "200% APY" },
                      { icon: Zap, color: "text-purple-400", bg: "bg-purple-400/10", title: "Hybrid Meta", desc: "The 5D Chess. Build, IPO, Corner, Bet.", goal: "Market Domination" },
                    ].map((mode, i) => (
                      <div key={i} className="flex gap-6 p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-default">
                         <div className={`w-12 h-12 ${mode.bg} rounded-xl flex items-center justify-center shrink-0`}>
                            <mode.icon className={mode.color} size={24} />
                         </div>
                         <div>
                            <h4 className="font-semibold text-lg text-white mb-1">{mode.title}</h4>
                            <p className="text-text-secondary text-sm mb-2">{mode.desc}</p>
                            <span className="text-xs font-mono px-2 py-1 rounded bg-white/5 text-white/80 border border-white/10">Goal: {mode.goal}</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
              
              <div className="relative">
                 <div className="aspect-square bg-surfaceHighlight rounded-[40px] border border-white/10 overflow-hidden relative shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:scale-105 transition-transform cursor-pointer">
                           <Play className="text-white ml-1" fill="white" size={24} />
                        </div>
                    </div>
                    <div className="absolute bottom-8 left-8 right-8">
                       <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                          <div className="flex items-center gap-3 mb-2">
                             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                             <span className="text-xs font-medium text-white uppercase tracking-wider">Live Footage</span>
                          </div>
                          <p className="text-sm text-text-secondary">Building Sector 7... 80% Complete</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- Tokenomics --- */}
      <section id="token" className="py-24 bg-surface">
         <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div>
               <div className="inline-block px-3 py-1 bg-mars-500/10 rounded-full text-mars-500 text-xs font-medium mb-6">Tokenomics</div>
               <h2 className="text-4xl font-semibold tracking-tight mb-6">$MARS Token</h2>
               <p className="text-text-secondary mb-8 text-lg">Deflationary platform governance. 50% of all platform fees buy and burn $MARS.</p>
               
               <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    "Required for Land",
                    "Staking Yield Boosts",
                    "Governance Voting",
                    "Reduced Trading Fees"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-text-primary">
                      <ShieldCheck className="text-solana-green shrink-0" size={18}/>
                      {item}
                    </div>
                  ))}
               </div>

               <div className="p-6 bg-background rounded-2xl border border-white/5 inline-block min-w-[200px]">
                  <h4 className="text-xs text-text-secondary uppercase tracking-widest mb-1">Total Supply</h4>
                  <p className="text-3xl font-mono text-white tracking-tight">1,000,000,000</p>
               </div>
            </div>
            <div className="glass-panel p-6 rounded-[32px]">
               <TokenomicsChart />
               <p className="text-center text-xs text-text-secondary mt-6">Vesting: 4 Years Linear with 1 Year Cliff for Team</p>
            </div>
         </div>
      </section>

      {/* --- Roadmap --- */}
      <section id="roadmap" className="py-24">
         <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-semibold mb-16 text-center">Expansion Plan</h2>
            <div className="space-y-0 relative border-l border-white/10 ml-6 md:ml-0 md:pl-0">
               {[
                 { year: "Phase 1", title: "Foundation", desc: "Devnet launch. Mining, Trading, Basic IPOs.", active: true },
                 { year: "Phase 2", title: "Society", desc: "Prediction markets. Corporations merge. Alliances.", active: false },
                 { year: "Phase 3", title: "Expansion", desc: "Interplanetary travel. Asteroid belt mining. Mobile App.", active: false }
               ].map((item, i) => (
                 <div key={i} className="relative pl-12 pb-12 last:pb-0">
                    <div className={`absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full border-2 ${item.active ? 'bg-mars-500 border-mars-500 shadow-[0_0_10px_rgba(255,87,51,0.5)]' : 'bg-background border-white/20'}`}></div>
                    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
                       <div>
                          <span className={`text-xs font-mono mb-1 block ${item.active ? 'text-mars-500' : 'text-text-secondary'}`}>{item.year}</span>
                          <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                       </div>
                       <p className="text-text-secondary text-sm md:max-w-xs md:text-right">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- Footer CTA --- */}
      <section className="py-32 relative overflow-hidden text-center">
         <div className="max-w-2xl mx-auto px-6 relative z-10">
            <h2 className="text-5xl md:text-7xl font-semibold tracking-tighter mb-8 text-white">Mars is Real.</h2>
            <p className="text-xl text-text-secondary mb-10">Secure your founding territory.</p>
            
            <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto p-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
               <input 
                  type="email" 
                  placeholder="email@address.com" 
                  className="flex-1 bg-transparent px-6 py-3 rounded-full text-white placeholder-text-tertiary focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
               />
               <button type="submit" className="bg-white text-black font-medium px-8 py-3 rounded-full hover:bg-gray-200 transition-colors">
                  Join
               </button>
            </form>
         </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 border-t border-white/5 bg-background">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-6 h-6 rounded bg-white/10"></div>
               <span className="font-medium text-sm">MarsCorp</span>
            </div>
            <div className="flex gap-8 text-sm text-text-secondary">
              <a href="https://x.com/MarsCorpSol?s=20" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">Discord</a>
              <a href="#" className="hover:text-white transition-colors">Docs</a>
            </div>
            <div className="text-xs text-text-tertiary font-mono">
               © 2024 MARSCORP. SOLANA.
            </div>
         </div>
      </footer>
    </div>
  );
};

export default Landing;
