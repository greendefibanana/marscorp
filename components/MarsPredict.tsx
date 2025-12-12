import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PredictionMarket } from '../types';
import { Target, TrendingUp, CloudRain, Building, Scale, Pickaxe, Plus, X, Wallet, Clock, Info, CheckCircle2, Globe } from 'lucide-react';
import { useStore } from '../store/useStore';
import clsx from 'clsx';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useTheme } from '../store/ThemeContext';
import { useMarsProtocol } from '../hooks/useMarsProtocol';
import { useKalshiMarkets } from '../hooks/useKalshiMarkets'; // Integration
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { Buffer } from 'buffer';

interface MarsPredictProps {
    initialMarkets: PredictionMarket[];
}

const CATEGORIES = [
    { id: 'all', label: 'All Markets', icon: Target },
    { id: 'Atmospheric', label: 'Atmospheric', icon: CloudRain, color: 'text-blue-400' },
    { id: 'Corporate', label: 'Corporate', icon: Building, color: 'text-purple-400' },
    { id: 'Commodities', label: 'Commodities', icon: Pickaxe, color: 'text-yellow-400' },
    { id: 'Governance', label: 'Governance', icon: Scale, color: 'text-red-400' },
];

const generateChartData = (currentProb: number) => {
    let prob = currentProb;
    return Array.from({ length: 24 }, (_, i) => {
        prob = Math.max(0.01, Math.min(0.99, prob + (Math.random() - 0.5) * 0.1));
        return { time: `${i}h`, value: prob * 100 };
    });
};

const FeaturedCarousel = ({ markets, onSelect }: { markets: PredictionMarket[], onSelect: (market: PredictionMarket) => void }) => {
    // Show top 3 markets (prioritize Kalshi/Real-World for featured if available)
    const featured = markets.slice(0, 3);

    return (
        <div className="w-full overflow-x-auto no-scrollbar pb-6">
            <div className="flex gap-4 min-w-max">
                {featured.map((market, idx) => {
                    const bgClass = idx === 0 
                        ? 'bg-gradient-to-br from-orange-900/40 via-red-900/20 to-black' 
                        : idx === 1 
                        ? 'bg-gradient-to-br from-purple-900/40 via-blue-900/20 to-black'
                        : 'bg-gradient-to-br from-emerald-900/40 via-teal-900/20 to-black';

                    return (
                        <div 
                            key={market.id} 
                            onClick={() => onSelect(market)}
                            className={`w-[350px] h-[180px] rounded-3xl border border-white/10 p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:border-white/20 transition-all ${bgClass}`}
                        >
                            <div className="absolute top-0 right-0 p-3 opacity-20">
                                <Target size={60} className="text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={clsx("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/10", 
                                        market.category === 'Atmospheric' ? 'text-blue-400' : 
                                        market.category === 'Corporate' ? 'text-purple-400' : 'text-white'
                                    )}>
                                        {market.category}
                                    </span>
                                    {market.oracle === 'Kalshi Regulated' && (
                                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 flex items-center gap-1">
                                            <Globe size={10} /> Real World
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold leading-snug pr-8 text-white line-clamp-2">{market.question}</h3>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-white/10 h-10 rounded-lg flex overflow-hidden">
                                    <div className="flex-1 flex items-center justify-center bg-solana-green/20 text-solana-green text-xs font-bold font-mono">
                                        YES {(market.probYes * 100).toFixed(0)}%
                                    </div>
                                    <div className="w-[1px] bg-white/10" />
                                    <div className="flex-1 flex items-center justify-center bg-mars-red/20 text-mars-red text-xs font-bold font-mono">
                                        NO {((1 - market.probYes) * 100).toFixed(0)}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const MarsPredict: React.FC<MarsPredictProps> = ({ initialMarkets }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedMarket, setSelectedMarket] = useState<PredictionMarket | null>(null);
    const [wager, setWager] = useState<string>('');
    const [betType, setBetType] = useState<'YES' | 'NO'>('YES');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResolving, setIsResolving] = useState(false);
    
    // Hooks
    const { balance } = useStore();
    const { theme } = useTheme();
    const { placeBet, isConnected, resolveMarket } = useMarsProtocol();
    const { publicKey } = useWallet();
    const isDark = theme === 'dark';

    // Hybrid Data: Merge On-Chain + Kalshi
    const { markets: allMarkets, isLoading } = useKalshiMarkets(initialMarkets);

    // Derived Data
    const filteredMarkets = useMemo(() => {
        return selectedCategory === 'all' 
            ? allMarkets 
            : allMarkets.filter(m => m.category === selectedCategory);
    }, [allMarkets, selectedCategory]);

    const chartData = useMemo(() => selectedMarket ? generateChartData(selectedMarket.probYes) : [], [selectedMarket]);
    
    // Estimates
    const wagerAmount = parseFloat(wager) || 0;
    const price = betType === 'YES' ? selectedMarket?.probYes || 0.5 : (1 - (selectedMarket?.probYes || 0.5));
    const shares = price > 0 ? wagerAmount / price : 0;
    const payout = shares; // 1:1 payout on win (simplified)
    const roi = wagerAmount > 0 ? ((payout - wagerAmount) / wagerAmount) * 100 : 0;

    const PROGRAM_ID = new PublicKey("6zxGVWBs3oFLJbgEYArzgS2p474C6tpFGs1YT1DZHVLC");

    const handlePlaceBet = async () => {
        if (!selectedMarket || !isConnected || !placeBet || !wager || parseFloat(wager) <= 0) {
            console.error("Cannot place bet: check wallet connection or inputs.");
            return;
        }

        setIsSubmitting(true);
        try {
            // For now, assuming ID is numeric for on-chain. Kalshi IDs are strings (tickers).
            // Need to handle ID parsing safely.
            let marketIdBN;
            try {
                marketIdBN = new BN(selectedMarket.id);
            } catch (e) {
                // If ID is string (e.g. 'p1' or 'KX...'), we might hash it or use a mapping.
                // For MVP, if it fails BN, we assume it's string-based ID and hash it
                const hash = Buffer.from(selectedMarket.id.substring(0, 8)); // Simple truncate for MVP demo
                marketIdBN = new BN(hash);
            }

            const [marketAddress] = PublicKey.findProgramAddressSync(
                [Buffer.from("market"), marketIdBN.toBuffer()],
                PROGRAM_ID
            );

            await placeBet(marketAddress, betType === 'YES', parseFloat(wager));
            alert("Bet placed successfully!");
        } catch (error) {
            console.error("Failed to place bet:", error);
            alert("Failed to place bet on-chain.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResolveMarket = async (outcome: boolean) => {
        if (!selectedMarket || !isConnected || !resolveMarket || !publicKey) return;
        setIsResolving(true);
        try {
            let marketIdBN;
            try {
                marketIdBN = new BN(selectedMarket.id);
            } catch {
                const hash = Buffer.from(selectedMarket.id.substring(0, 8));
                marketIdBN = new BN(hash);
            }

            const [marketAddress] = PublicKey.findProgramAddressSync(
                [Buffer.from("market"), marketIdBN.toBuffer()],
                PROGRAM_ID
            );

            await resolveMarket(marketAddress, outcome);
            alert(`Market resolved: ${outcome ? 'YES' : 'NO'}`);
        } catch (error) {
            console.error("Failed to resolve:", error);
            alert("Resolution failed.");
        } finally {
            setIsResolving(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-background text-text-primary flex flex-col relative transition-colors duration-500">
             <div className="w-full max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1 text-text-primary">Mars <span className="text-solana-green">Forecast</span></h1>
                        <p className="text-text-secondary font-mono text-sm flex items-center gap-2">
                            INSTITUTIONAL PREDICTION MARKETS 
                            {isLoading && (
                                <span className="text-solana-purple animate-pulse flex items-center gap-1 text-[10px] ml-2 border border-solana-purple/30 px-2 rounded-full">
                                    <Globe size={10} /> Syncing with Kalshi...
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                <FeaturedCarousel markets={allMarkets} onSelect={setSelectedMarket} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Categories */}
                    <div className="lg:col-span-3 space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4 px-3">Ecosystem</h3>
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={clsx(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                    selectedCategory === cat.id 
                                        ? "bg-surface text-text-primary shadow-sm" 
                                        : "text-text-secondary hover:text-text-primary hover:bg-surface/50"
                                )}
                            >
                                <cat.icon size={18} className={cat.color || 'text-text-primary'} />
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Market List */}
                    <div className="lg:col-span-9">
                        <div className="glass-panel rounded-3xl overflow-hidden min-h-[600px] border border-border">
                            <div className="grid grid-cols-12 px-6 py-4 border-b border-border text-xs font-mono text-text-secondary uppercase tracking-wider bg-surface/50">
                                <div className="col-span-6">Market</div>
                                <div className="col-span-3 text-center">Probability</div>
                                <div className="col-span-2 text-right">Volume</div>
                                <div className="col-span-1 text-right">Expires</div>
                            </div>

                            <div className="divide-y divide-border">
                                {isLoading && filteredMarkets.length === 0 ? (
                                    <div className="p-8 text-center text-text-secondary animate-pulse">Loading Markets...</div>
                                ) : (
                                    filteredMarkets.map((market) => (
                                        <div 
                                            key={market.id}
                                            onClick={() => setSelectedMarket(market)}
                                            className={clsx(
                                                "grid grid-cols-12 px-6 py-4 items-center hover:bg-surface/30 transition-colors cursor-pointer group",
                                                selectedMarket?.id === market.id ? "bg-surface/50" : ""
                                            )}
                                        >
                                            <div className="col-span-6 pr-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                                                        {market.category === 'Atmospheric' && <CloudRain size={16} className="text-blue-400" />}
                                                        {market.category === 'Corporate' && <Building size={16} className="text-purple-400" />}
                                                        {market.category === 'Commodities' && <Pickaxe size={16} className="text-yellow-400" />}
                                                        {market.category === 'Governance' && <Scale size={16} className="text-red-400" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm leading-tight text-text-primary group-hover:text-solana-green transition-colors line-clamp-1">
                                                            {market.question}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] text-text-secondary">{market.oracle || 'Mars Oracle'}</span>
                                                            {market.oracle === 'Kalshi Regulated' && (
                                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                                                    [REAL WORLD]
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-span-3 px-2">
                                                <div className="flex h-8 w-full rounded-md overflow-hidden font-mono text-[10px] font-bold">
                                                    <div className="bg-solana-green/20 text-solana-green flex items-center justify-center transition-all" style={{ width: `${market.probYes * 100}%` }}>
                                                        {Math.round(market.probYes * 100)}%
                                                    </div>
                                                    <div className="bg-mars-red/20 text-mars-red flex items-center justify-center transition-all" style={{ width: `${(1 - market.probYes) * 100}%` }}>
                                                        {Math.round((1 - market.probYes) * 100)}%
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-span-2 text-right font-mono text-sm text-text-secondary">
                                                ${(market.volume / 1000).toFixed(1)}k
                                            </div>

                                            <div className="col-span-1 text-right font-mono text-xs text-text-secondary">
                                                {market.endsAt}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {selectedMarket && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedMarket(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed right-0 top-0 bottom-0 w-full md:w-[480px] bg-background border-l border-border shadow-2xl z-50 flex flex-col text-text-primary"
                        >
                            <div className="p-6 border-b border-border bg-surface/50">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                                        <Target size={12} />
                                        Prediction Market
                                    </div>
                                    <button onClick={() => setSelectedMarket(null)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                                        <X size={20} className="text-text-secondary" />
                                    </button>
                                </div>
                                <h2 className="text-xl font-bold leading-snug text-text-primary">{selectedMarket.question}</h2>
                                {selectedMarket.oracle === 'Kalshi Regulated' && (
                                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">
                                        <Globe size={12} />
                                        Synced with Kalshi Exchange
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                                <div className="h-48 w-full">
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-text-secondary">Probability History</span>
                                        <span className="text-solana-green font-mono">Current: {(selectedMarket.probYes * 100).toFixed(0)}%</span>
                                    </div>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: isDark ? '#09090b' : '#ffffff', border: isDark ? '1px solid #333' : '1px solid #e5e7eb' }}
                                                itemStyle={{ fontSize: '12px' }}
                                            />
                                            <XAxis hide dataKey="time" />
                                            <YAxis hide domain={[0, 100]} />
                                            <Line type="stepAfter" dataKey="value" stroke="#14F195" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-5 border border-border">
                                    <div className="flex gap-2 mb-6">
                                        <button onClick={() => setBetType('YES')} className={clsx("flex-1 py-3 rounded-xl font-bold text-sm transition-all border", betType === 'YES' ? "bg-solana-green text-black border-solana-green" : "bg-transparent text-text-secondary border-border hover:border-text-secondary")}>
                                            YES {(selectedMarket.probYes * 100).toFixed(0)}%
                                        </button>
                                        <button onClick={() => setBetType('NO')} className={clsx("flex-1 py-3 rounded-xl font-bold text-sm transition-all border", betType === 'NO' ? "bg-mars-red text-white border-mars-red" : "bg-transparent text-text-secondary border-border hover:border-text-secondary")}>
                                            NO {((1 - selectedMarket.probYes) * 100).toFixed(0)}%
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={wager} 
                                                onChange={(e) => setWager(e.target.value)} 
                                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-lg font-mono focus:border-text-primary focus:outline-none transition-colors placeholder:text-text-secondary/30" 
                                                placeholder="0.00" 
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-text-secondary font-bold">SOL</span>
                                        </div>
                                        <div className="flex justify-between text-sm pt-2 border-t border-border">
                                            <span className="text-text-secondary">Est. Payout</span>
                                            <span className={clsx("font-mono font-bold", betType === 'YES' ? 'text-solana-green' : 'text-mars-red')}>
                                                ${payout.toFixed(2)}
                                            </span>
                                        </div>
                                        <button onClick={handlePlaceBet} disabled={isSubmitting || !isConnected} className="w-full bg-text-primary text-background font-bold py-4 rounded-xl mt-2 hover:scale-[1.02] transition-transform disabled:opacity-50">
                                            {isSubmitting ? 'Processing...' : 'Place Order'}
                                        </button>
                                        
                                        {selectedMarket.oracle === 'Kalshi Regulated' && (
                                            <div className="pt-2 text-center">
                                                <a 
                                                    href="https://kalshi.com" 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1 transition-colors"
                                                >
                                                    <Globe size={10} /> Verify Market on Kalshi
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MarsPredict;