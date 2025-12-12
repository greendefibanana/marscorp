
import React, { useState, useEffect } from 'react';
import { WalletContextProvider } from '../components/WalletContextProvider';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Dashboard from '../components/Dashboard';
import ResourceMarket from '../components/ResourceMarket';
import MarsExchange from '../components/MarsExchange';
import MarsPredict from '../components/MarsPredict';
import CommandCenter from '../components/CommandCenter';
import CreateBusinessModal from '../components/CreateBusinessModal';
import { Company, MarketStats, ChartData, Resource, PredictionMarket } from '../types';
import { LayoutGrid, Database, Plus, RefreshCw, Wallet, Target, Hexagon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ThemeProvider } from '../store/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import clsx from 'clsx';
import { useMarsProtocol } from '../hooks/useMarsProtocol';

const INITIAL_COMPANIES: Company[] = [
  { 
      id: '1', ticker: '$MWTR', name: 'Martian Water Corp', price: 42.50, change: 12.4, volume: 8500, sector: 'Terraforming', 
      description: 'Extracting subsurface ice from the polar caps.', region: 'Polar Caps', yield: '+10% H2O', 
      marketCap: 420, apy: 8.5, production: '12k Liters/Day', takeover: { active: false, progress: 12 }
  },
  { 
      id: '2', ticker: '$IRON', name: 'Red Dust Mining', price: 18.20, change: -2.1, volume: 3200, sector: 'Mining', 
      description: 'Heavy metal extraction in the Tharsis region.', region: 'Tharsis Rise', yield: '+20% Iron',
      marketCap: 150, apy: 12.2, production: '500 Tons/Day', takeover: { active: true, progress: 45 } 
  },
  { 
      id: '3', ticker: '$SOLR', name: 'Helios Energy', price: 156.00, change: 5.8, volume: 12000, sector: 'Energy', 
      description: 'Orbital mirror arrays for solar capture.', region: 'Olympus Mons', yield: '+15% Solar',
      marketCap: 890, apy: 6.4, production: '4.5 GW/Day', takeover: { active: false, progress: 2 } 
  },
  { 
      id: '4', ticker: '$BIO', name: 'Green House Gen', price: 89.30, change: 0.5, volume: 5400, sector: 'Tech', 
      description: 'Genetically modified lichen for oxygen production.', region: 'Hellas Basin', yield: '+5% Bio',
      marketCap: 310, apy: 15.0, production: 'Research Data', takeover: { active: false, progress: 8 } 
  },
  { 
      id: '5', ticker: '$ROVR', name: 'Canyon Transport', price: 33.10, change: -0.8, volume: 2100, sector: 'Mining', 
      description: 'Autonomous hauling logistics.', region: 'Valles Marineris', yield: '+12% Logistics',
      marketCap: 95, apy: 9.1, production: '800 Hauls/Day', takeover: { active: true, progress: 68 } 
  },
];

const INITIAL_RESOURCES: Resource[] = [
    { 
        id: 'r1', ticker: 'H2O', name: 'Water Ice', price: 1240.50, change: 4.2, volatility: 'Med', supply: '420k Tons', cornerPercentage: 12,
        history: Array.from({length: 20}, (_, i) => ({ time: `${i}:00`, value: 1200 + Math.random() * 100, event: i === 15 ? 'Polar Melt' : undefined })) 
    },
    { 
        id: 'r2', ticker: 'FE', name: 'Refined Iron', price: 450.20, change: -1.5, volatility: 'Low', supply: '2.1M Tons', cornerPercentage: 45,
        history: Array.from({length: 20}, (_, i) => ({ time: `${i}:00`, value: 450 + Math.random() * 50 })) 
    },
    { 
        id: 'r3', ticker: 'O2', name: 'Oxygen', price: 2800.00, change: 12.5, volatility: 'High', supply: '150k Tons', cornerPercentage: 68,
        history: Array.from({length: 20}, (_, i) => ({ time: `${i}:00`, value: 2500 + Math.random() * 500, event: i === 18 ? 'Leak Detected' : undefined })) 
    },
    { 
        id: 'r4', ticker: 'UR', name: 'Uranium-235', price: 15000.00, change: 0.8, volatility: 'Med', supply: '500 kg', cornerPercentage: 5,
        history: Array.from({length: 20}, (_, i) => ({ time: `${i}:00`, value: 15000 + Math.random() * 200 })) 
    },
    { 
        id: 'r5', ticker: 'Si', name: 'Silicon Wafer', price: 890.00, change: -5.4, volatility: 'High', supply: '800k Units', cornerPercentage: 22,
        history: Array.from({length: 20}, (_, i) => ({ time: `${i}:00`, value: 950 - Math.random() * 100 })) 
    },
];

const INITIAL_PREDICTIONS: PredictionMarket[] = [
    { 
        id: 'p1', 
        question: 'Will a Class 5 Dust Storm hit Tharsis Region within 48h?', 
        category: 'Atmospheric', 
        volume: 125000, 
        liquidity: 55000, 
        probYes: 0.82, 
        endsAt: '12h 30m',
        description: 'Meteorological sensors at Olympus Base indicate a 980mb pressure drop. A "Yes" outcome triggers insurance payouts for solar farm operators in the region.',
        oracle: 'Mars Climate Orbiter V'
    },
    { 
        id: 'p2', 
        question: 'Will $MWTR acquire $IRON before Q4?', 
        category: 'Corporate', 
        volume: 45000, 
        liquidity: 12000, 
        probYes: 0.34, 
        endsAt: '2d 14h',
        description: 'Merger rumors have circulated since $MWTR CEO visited the Tharsis mines. Antitrust council vote is the primary blocker.',
        oracle: 'SEC (Solana Exchange Commission)'
    },
    { 
        id: 'p3', 
        question: 'Will Water Prices exceed $5.00/unit this epoch?', 
        category: 'Commodities', 
        volume: 210000, 
        liquidity: 85000, 
        probYes: 0.55, 
        endsAt: '14d',
        description: 'Polar extraction yields are down 15%. Speculators are hedging against a supply shock.',
        oracle: 'Chainlink Commodity Feed'
    },
    { 
        id: 'p4', 
        question: 'Will the Mars Council approve the new Oxygen Tax?', 
        category: 'Governance', 
        volume: 8900, 
        liquidity: 3200, 
        probYes: 0.15, 
        endsAt: '5d 2h',
        description: 'Proposal 402 introduces a 2% tax on O2 venting. Landowners are lobbying heavily against it.',
        oracle: 'Governance DAO On-Chain Vote'
    },
    { 
        id: 'p5', 
        question: 'Will SpaceX Starship V9 land successfully?', 
        category: 'Atmospheric', 
        volume: 67000, 
        liquidity: 22000, 
        probYes: 0.92, 
        endsAt: '6h',
        description: 'Incoming supply run from Earth. Weather conditions are optimal for descent.',
        oracle: 'Space Traffic Control'
    },
];

const INITIAL_STATS: MarketStats = {
  globalVolume: 65,
  sentiment: 'Bullish',
  activeIpo: null,
  lastCrash: false,
};

const generateChartData = (): ChartData[] => {
  const data = [];
  let value = 100;
  for (let i = 0; i < 24; i++) {
    value = value + (Math.random() - 0.5) * 5;
    data.push({
      time: `${i}:00`,
      value: Math.max(50, value),
    });
  }
  return data;
};

const DApp = () => {
    const [activeTab, setActiveTab] = useState<'terminal' | 'exchange' | 'resources' | 'predict' | 'command'>('terminal');
    const [stats, setStats] = useState<MarketStats>(INITIAL_STATS);
    const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
    const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
    const [markets, setMarkets] = useState<PredictionMarket[]>(INITIAL_PREDICTIONS);
    const [chartData, setChartData] = useState<ChartData[]>(generateChartData());
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Deep Linking State
    const [initialSelectedTicker, setInitialSelectedTicker] = useState<string | null>(null);
    
    // Connect to Zustand store for balance display
    const { balance } = useStore();
    
    // Blockchain Hook
    const { createBusiness, isConnected } = useMarsProtocol();

    // Data Sync: Fetch from Indexer
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${apiUrl}/api/companies`);
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    // Merge with existing state to preserve local Optimistic updates if needed
                    // For now, replace strictly to trust the indexer
                    setCompanies(data);
                }
            } catch (e) {
                console.warn("Indexer API offline, using mock data.");
            }
        };
        
        fetchCompanies();
        const interval = setInterval(fetchCompanies, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    // Fetch Kalshi Prediction Markets
    useEffect(() => {
        const fetchPredictions = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${apiUrl}/api/kalshi/markets`);
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setMarkets(data);
                }
            } catch (e) {
                console.warn("Kalshi API offline, using mock data.");
            }
        };
        fetchPredictions();
    }, []);

    // Game Loop
    useEffect(() => {
        const interval = setInterval(() => {
            // 1. Simulate Company Ticker Movement
            setCompanies(prev => prev.map(c => ({
                ...c,
                price: Math.max(0.1, c.price + (Math.random() - 0.48) * 2),
                change: parseFloat((c.change + (Math.random() - 0.5)).toFixed(2)),
                volume: c.volume + Math.floor(Math.random() * 100),
            })));

            // 2. Simulate Resource Market Movement
            setResources(prev => prev.map(r => ({
                ...r,
                price: Math.max(1, r.price + (Math.random() - 0.5) * (r.price * 0.02)),
                change: parseFloat((r.change + (Math.random() - 0.5)).toFixed(2)),
                cornerPercentage: Math.random() > 0.9 ? Math.min(100, Math.max(0, r.cornerPercentage + (Math.random() - 0.5) * 2)) : r.cornerPercentage,
                history: [...r.history.slice(1), { time: 'Live', value: Math.max(1, r.price + (Math.random() - 0.5) * (r.price * 0.02)) }]
            })));

            // 3. Update Main Index Chart
            setChartData(prev => {
                const lastValue = prev[prev.length - 1].value;
                const newValue = Math.max(50, lastValue + (Math.random() - 0.45) * 5);
                return [...prev.slice(1), { time: "Live", value: newValue }];
            });
            
            // 4. Update Prediction Odds occasionally
             if (Math.random() > 0.7) {
                setMarkets(prev => prev.map(m => ({
                    ...m,
                    probYes: Math.max(0.01, Math.min(0.99, m.probYes + (Math.random() - 0.5) * 0.05)),
                    volume: m.volume + Math.floor(Math.random() * 500)
                })));
            }

            // 5. Random Events (IPO Beams)
            if (Math.random() > 0.95) {
                 setStats(prev => ({
                     ...prev,
                     activeIpo: {
                         x: (Math.random() - 0.5) * 3,
                         y: (Math.random() - 0.5) * 3,
                         z: 2
                     }
                 }));
                 // clear beam after 3s
                 setTimeout(() => setStats(prev => ({ ...prev, activeIpo: null })), 3000);
            }

        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const handleCreateBusiness = async (data: any) => {
        try {
            let mintAddressString = undefined;

            if (isConnected) {
                // Call Blockchain
                console.log("Creating business on-chain...", data);
                // launchBusiness returns { tx, mintAddress, curveAddress }
                const result = await createBusiness(data.ticker, data.name, data.description, data.sector); 
                mintAddressString = result?.mintAddress?.toString();
                console.log("Business Mint:", mintAddressString);

                // Persist to Indexer (In-Memory) so it shows up on reload
                try {
                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    await fetch(`${apiUrl}/api/companies`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: data.name,
                            ticker: data.ticker,
                            sector: data.sector,
                            description: data.description,
                            region: data.region
                        })
                    });
                    console.log("Persisted to indexer.");
                } catch (err) {
                    console.error("Failed to persist to indexer:", err);
                }
            } else {
                console.warn("Wallet not connected, skipping on-chain creation.");
            }

            // Update UI optimistically
            const newCompany: Company = {
                id: mintAddressString || Date.now().toString(),
                mint: mintAddressString, // Store the real mint
                name: data.name,
                ticker: data.ticker,
                price: 0.00003, // Starting price ~30 SOL / 1B Supply
                change: 0,
                volume: 0,
                sector: data.sector,
                description: data.description,
                region: data.region,
                yield: data.yield,
                socials: data.socials,
                marketCap: 0.03, // 30 SOL
                apy: 0,
                production: 'Just Launched',
                takeover: { active: false, progress: 0 }
            };
            setCompanies([newCompany, ...companies]);
            setIsModalOpen(false);
        } catch (e) {
            console.error("Failed to create business:", e);
            alert("Failed to launch IPO on-chain. Check console for details.");
        }
    };

    const handleNavigate = (tab: 'terminal' | 'exchange' | 'resources' | 'predict' | 'command', ticker?: string) => {
        setActiveTab(tab);
        if (ticker) {
            setInitialSelectedTicker(ticker);
            // Reset after a brief delay so it doesn't persist on subsequent tab switches if user closes modal
            setTimeout(() => setInitialSelectedTicker(null), 1000); 
        }
    };

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-solana-green/30 pb-20 md:pb-0 transition-colors duration-500">
            {/* Global Navigation */}
            <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 md:px-6 py-4 transition-colors duration-500">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-solana-purple to-solana-green flex items-center justify-center shadow-[0_0_15px_rgba(153,69,255,0.3)]">
                            <img src="/marscorp-icon.png" alt="MarsCorp" className="w-8 h-8" />
                        </div>
                        <div className="hidden md:block">
                            <h1 className="font-bold tracking-tight text-lg leading-none">MarsCorp</h1>
                            <span className="text-[10px] text-text-secondary font-mono tracking-widest">ECONOMY SIM V1.0</span>
                        </div>
                    </div>

                    {/* DEMO MODE INDICATOR */}
                    <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                        DEMO MODE
                    </div>

                    <div className="flex items-center bg-surface/5 rounded-full p-1 border border-border overflow-x-auto no-scrollbar max-w-[200px] md:max-w-none">
                        <button 
                            onClick={() => setActiveTab('terminal')}
                            className={clsx(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                                activeTab === 'terminal' ? "bg-surface text-text-primary shadow-lg" : "text-text-secondary hover:text-text-primary"
                            )}
                        >
                            <LayoutGrid size={16} />
                            <span className="hidden md:inline">Terminal</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('exchange')}
                            className={clsx(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                                activeTab === 'exchange' ? "bg-surface text-text-primary shadow-lg" : "text-text-secondary hover:text-text-primary"
                            )}
                        >
                            <RefreshCw size={16} />
                            <span className="hidden md:inline">Exchange</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('resources')}
                            className={clsx(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                                activeTab === 'resources' ? "bg-surface text-text-primary shadow-lg" : "text-text-secondary hover:text-text-primary"
                            )}
                        >
                            <Database size={16} />
                            <span className="hidden md:inline">Resources</span>
                        </button>
                         <button 
                            onClick={() => setActiveTab('predict')}
                            className={clsx(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                                activeTab === 'predict' ? "bg-surface text-text-primary shadow-lg" : "text-text-secondary hover:text-text-primary"
                            )}
                        >
                            <Target size={16} />
                            <span className="hidden md:inline">Forecast</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('command')}
                            className={clsx(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                                activeTab === 'command' ? "bg-surface text-text-primary shadow-lg" : "text-text-secondary hover:text-text-primary"
                            )}
                        >
                            <Hexagon size={16} />
                            <span className="hidden md:inline">Command</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Wallet Display */}
                        <div className="hidden lg:flex items-center gap-2">
                             <WalletMultiButton className="!bg-solana-purple !h-9 !px-4 !text-sm !font-bold !rounded-full hover:!bg-solana-purple/80 transition-colors" />
                        </div>

                        <button 
                             onClick={() => setIsModalOpen(true)}
                             className="bg-solana-purple/10 hover:bg-solana-purple/20 text-solana-purple border border-solana-purple/50 px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2"
                        >
                            <Plus size={16} />
                            <span className="hidden md:inline">Launch IPO</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main>
                {activeTab === 'terminal' && (
                    <Dashboard 
                        stats={stats} 
                        companies={companies} 
                        chartData={chartData} 
                        onCreateBusiness={handleCreateBusiness}
                        onNavigate={handleNavigate}
                    />
                )}
                {activeTab === 'exchange' && (
                    <MarsExchange 
                        companies={companies} 
                        initialSelectedTicker={initialSelectedTicker}
                    />
                )}
                {activeTab === 'resources' && (
                    <ResourceMarket 
                        resources={resources} 
                        initialSelectedTicker={initialSelectedTicker}
                    />
                )}
                {activeTab === 'predict' && (
                    <MarsPredict initialMarkets={markets} />
                )}
                {activeTab === 'command' && (
                    <CommandCenter companies={companies} />
                )}
            </main>
            
            <CreateBusinessModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleCreateBusiness} 
            />
        </div>
    );
}

export default DApp;
