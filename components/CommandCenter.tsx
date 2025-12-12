
import React, { useState } from 'react';
import { useMarsProtocol } from '../hooks/useMarsProtocol';
import { useStore } from '../store/useStore';
import clsx from 'clsx';
import { Lock, Unlock, Briefcase, Coins, Shield, Skull, Radiation, AlertTriangle, Eye, Activity } from 'lucide-react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface Company {
    ticker: string;
    name: string;
    price: number;
    change: number;
}

interface CommandCenterProps {
    companies: Company[];
}

const CommandCenter: React.FC<CommandCenterProps> = ({ companies }) => {
    const { balance, portfolio, unclaimedYield, claimYield, executeSabotage } = useStore();
    const { initializeConfig, isConnected } = useMarsProtocol();
    const [isBlackMarket, setIsBlackMarket] = useState(false);
    const [sabotageStatus, setSabotageStatus] = useState<string | null>(null);

    // Calculate Net Worth
    const portfolioValue = portfolio.reduce((acc, item) => {
        const currentPrice = companies.find(c => c.ticker === item.ticker)?.price || item.avgBuyPrice;
        return acc + (item.amount * currentPrice);
    }, 0);
    const netWorth = balance + portfolioValue;
    const goal = 1000000;
    const progress = Math.min(100, (netWorth / goal) * 100);

    const chartData = [{ name: 'Progress', value: progress, fill: isBlackMarket ? '#ef4444' : '#14F195' }];

    const handleSabotage = (name: string, cost: number, risk: number) => {
        if (executeSabotage(cost)) {
            const success = Math.random() > (risk / 100);
            setSabotageStatus(success ? `Successfully executed ${name}!` : `Mission Failed: Operatives detected.`);
            setTimeout(() => setSabotageStatus(null), 3000);
        } else {
            setSabotageStatus("Insufficient funds for operation.");
            setTimeout(() => setSabotageStatus(null), 3000);
        }
    };

    const handleInitProtocol = async () => {
        if (isConnected) {
            try {
                await initializeConfig(100, 200); // 1% Platform, 2% Yield
                alert("Protocol Initialized Successfully");
            } catch (e) {
                console.error(e);
                alert("Init failed (May already be initialized)");
            }
        }
    };

    return (
        <div className={clsx("w-full min-h-screen transition-colors duration-700", isBlackMarket ? "bg-[#0f0505]" : "bg-background")}>
            <div className="w-full max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className={clsx("text-4xl font-bold tracking-tight transition-colors", isBlackMarket ? "text-red-500" : "text-text-primary")}>
                            {isBlackMarket ? "Shadow Ops" : "Command Center"}
                        </h1>
                        <p className={clsx("font-mono text-sm mt-1", isBlackMarket ? "text-white/40" : "text-text-secondary")}>
                            {isBlackMarket ? "ENCRYPTED CONNECTION • ID: UNKNOWN" : "USER PROFILE • TIER: BUILDER"}
                        </p>
                    </div>
                    
                    <div className="flex gap-2">
                        {/* Admin Init (Hidden in plain sight for now) */}
                        <button 
                            onClick={handleInitProtocol}
                            className="px-3 py-2 rounded-full border border-border text-xs text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 opacity-50 hover:opacity-100 transition-all"
                            title="Initialize Protocol Config (Admin Only)"
                        >
                            SYS_INIT
                        </button>

                        {/* Black Market Toggle */}
                        <button 
                            onClick={() => setIsBlackMarket(!isBlackMarket)}
                            className={clsx(
                                "flex items-center gap-3 px-5 py-2 rounded-full border transition-all duration-500",
                                isBlackMarket 
                                    ? "bg-red-900/20 border-red-500/50 text-red-500 hover:bg-red-900/40" 
                                    : "bg-black/5 dark:bg-white/5 border-border hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary hover:text-text-primary"
                            )}
                        >
                            <span className="text-xs font-bold tracking-widest uppercase">
                                {isBlackMarket ? "Black Market Open" : "Standard Ops"}
                            </span>
                            {isBlackMarket ? <Unlock size={18} /> : <Lock size={18} />}
                        </button>
                    </div>
                </div>

                {/* Top Row: Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Net Worth Card */}
                    <div className={clsx("glass-panel rounded-3xl p-6 relative overflow-hidden transition-all duration-500", isBlackMarket ? "border-red-900/30" : "")}>
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className={clsx("text-xs font-bold uppercase tracking-wider", isBlackMarket ? "text-white/40" : "text-text-secondary")}>Net Worth</h3>
                                <div className={clsx("text-3xl font-mono font-bold mt-1 transition-colors", isBlackMarket ? "text-red-500" : "text-text-primary")}>
                                    ${netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                            <div className={clsx("p-3 rounded-xl", isBlackMarket ? "bg-red-500/10 text-red-500" : "bg-solana-green/10 text-solana-green")}>
                                <Briefcase size={20} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className={clsx("flex justify-between text-xs", isBlackMarket ? "text-white/50" : "text-text-secondary")}>
                                <span>Liquid SOL</span>
                                <span className={clsx("font-mono", isBlackMarket ? "text-white" : "text-text-primary")}>{balance.toFixed(2)}</span>
                            </div>
                            <div className={clsx("flex justify-between text-xs", isBlackMarket ? "text-white/50" : "text-text-secondary")}>
                                <span>Portfolio</span>
                                <span className={clsx("font-mono", isBlackMarket ? "text-white" : "text-text-primary")}>{portfolioValue.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Victory Progress */}
                    <div className={clsx("glass-panel rounded-3xl p-6 flex items-center justify-between transition-all duration-500", isBlackMarket ? "border-red-900/30" : "")}>
                        <div>
                            <h3 className={clsx("text-xs font-bold uppercase tracking-wider mb-1", isBlackMarket ? "text-white/40" : "text-text-secondary")}>Victory Goal</h3>
                            <div className={clsx("text-lg font-bold mb-2", isBlackMarket ? "text-white" : "text-text-primary")}>$1,000,000 NW</div>
                            <p className={clsx("text-xs max-w-[120px]", isBlackMarket ? "text-white/50" : "text-text-secondary")}>Reach $1M to become a Martian Oligarch.</p>
                        </div>
                        <div className="w-24 h-24 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart 
                                    innerRadius="70%" 
                                    outerRadius="100%" 
                                    data={chartData} 
                                    startAngle={90} 
                                    endAngle={-270}
                                >
                                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                    <RadialBar background dataKey="value" cornerRadius={30} fill={isBlackMarket ? '#ef4444' : '#14F195'} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className={clsx("absolute inset-0 flex items-center justify-center text-xs font-bold", isBlackMarket ? "text-red-500" : "text-solana-green")}>
                                {progress.toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    {/* Unclaimed Yield */}
                    <div className={clsx("glass-panel rounded-3xl p-6 flex flex-col justify-between transition-all duration-500", isBlackMarket ? "border-red-900/30" : "")}>
                        <div>
                            <h3 className={clsx("text-xs font-bold uppercase tracking-wider", isBlackMarket ? "text-white/40" : "text-text-secondary")}>Unclaimed Dividends</h3>
                            <div className={clsx("text-2xl font-mono font-bold mt-1", isBlackMarket ? "text-white" : "text-text-primary")}>${unclaimedYield.toFixed(2)}</div>
                        </div>
                        <button 
                            onClick={claimYield}
                            disabled={unclaimedYield <= 0}
                            className={clsx(
                                "w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                                unclaimedYield > 0 
                                    ? isBlackMarket ? "bg-red-600 text-white hover:bg-red-500" : "bg-text-primary text-surface hover:scale-105"
                                    : "bg-black/5 dark:bg-white/5 text-text-secondary cursor-not-allowed"
                            )}
                        >
                            <Coins size={16} />
                            CLAIM YIELD
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* INVENTORY GRID */}
                    <div className="lg:col-span-2 glass-panel rounded-3xl p-6 min-h-[400px]">
                        <h3 className={clsx("text-lg font-bold mb-6 flex items-center gap-2", isBlackMarket ? "text-white" : "text-text-primary")}>
                            <Briefcase className={isBlackMarket ? "text-red-500" : "text-solana-purple"} size={20} />
                            Asset Inventory
                        </h3>
                        
                        {portfolio.length === 0 ? (
                            <div className={clsx("w-full h-64 flex flex-col items-center justify-center border border-dashed rounded-2xl", isBlackMarket ? "text-white/30 border-white/10" : "text-text-secondary/50 border-border")}>
                                <Briefcase size={32} className="mb-4 opacity-50" />
                                <p>No assets acquired yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {portfolio.map((item) => {
                                    const company = companies.find(c => c.ticker === item.ticker);
                                    const currentValue = (company?.price || 0) * item.amount;
                                    const profit = currentValue - (item.avgBuyPrice * item.amount);
                                    const isProfit = profit >= 0;

                                    return (
                                        <div key={item.ticker} className="bg-black/5 dark:bg-white/5 border border-border rounded-2xl p-4 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-black/10 dark:bg-black/40 flex items-center justify-center font-bold font-mono text-text-primary">
                                                        {item.ticker.substring(1,3)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-text-primary">{item.ticker}</div>
                                                        <div className="text-xs text-text-secondary">{item.amount.toFixed(2)} Shares</div>
                                                    </div>
                                                </div>
                                                <div className={clsx("text-xs px-2 py-1 rounded", isProfit ? "bg-solana-green/10 text-solana-green" : "bg-red-500/10 text-red-500")}>
                                                    {isProfit ? '+' : ''}{profit.toFixed(2)} SOL
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="text-xs text-text-secondary">
                                                    Avg: ${item.avgBuyPrice.toFixed(2)}
                                                </div>
                                                <div className="font-mono font-bold text-text-primary">
                                                    ${currentValue.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* BLACK MARKET / ACTIONS */}
                    <div className="lg:col-span-1">
                        <AnimatePresence mode="wait">
                            {!isBlackMarket ? (
                                <motion.div 
                                    key="standard"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="h-full glass-panel rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-solana-purple/5 to-transparent" />
                                    <Shield size={48} className="text-text-secondary/20 mb-4" />
                                    <h3 className="font-bold text-lg mb-2 text-text-primary">System Secure</h3>
                                    <p className="text-text-secondary text-sm max-w-[200px]">
                                        No active threats detected. Toggle Black Market access to view illicit options.
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="blackmarket"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="h-full bg-[#1a0505] border border-red-900/30 rounded-3xl p-6 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Skull size={100} className="text-red-500" />
                                    </div>
                                    
                                    <h3 className="text-red-500 font-bold flex items-center gap-2 mb-6">
                                        <Radiation size={20} />
                                        Black Market Ops
                                    </h3>

                                    {sabotageStatus && (
                                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                                            {sabotageStatus}
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <button 
                                            onClick={() => handleSabotage("Competitor Sabotage", 200, 30)}
                                            className="w-full bg-red-900/20 border border-red-500/20 p-4 rounded-xl text-left hover:bg-red-900/40 transition-colors group"
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-red-200 group-hover:text-white">Sabotage Output</span>
                                                <span className="text-xs font-mono text-red-500">200 SOL</span>
                                            </div>
                                            <p className="text-xs text-red-400/50 mb-2">Reduce target production by 50% for 24h.</p>
                                            <div className="flex items-center gap-1 text-[10px] text-red-500 uppercase tracking-wider">
                                                <AlertTriangle size={10} /> 30% Detection Risk
                                            </div>
                                        </button>

                                        <button 
                                            onClick={() => handleSabotage("Corporate Espionage", 500, 10)}
                                            className="w-full bg-red-900/20 border border-red-500/20 p-4 rounded-xl text-left hover:bg-red-900/40 transition-colors group"
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-red-200 group-hover:text-white">Buy Espionage Data</span>
                                                <span className="text-xs font-mono text-red-500">500 SOL</span>
                                            </div>
                                            <p className="text-xs text-red-400/50 mb-2">Reveal pending hostile takeover bids.</p>
                                            <div className="flex items-center gap-1 text-[10px] text-red-500 uppercase tracking-wider">
                                                <Eye size={10} /> 10% Detection Risk
                                            </div>
                                        </button>

                                        <button 
                                            onClick={() => handleSabotage("FUD Campaign", 100, 5)}
                                            className="w-full bg-red-900/20 border border-red-500/20 p-4 rounded-xl text-left hover:bg-red-900/40 transition-colors group"
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-red-200 group-hover:text-white">FUD Campaign</span>
                                                <span className="text-xs font-mono text-red-500">100 SOL</span>
                                            </div>
                                            <p className="text-xs text-red-400/50 mb-2">Temporarily suppress target stock price.</p>
                                            <div className="flex items-center gap-1 text-[10px] text-red-500 uppercase tracking-wider">
                                                <Activity size={10} /> 5% Detection Risk
                                            </div>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandCenter;
