
import React, { useState, useEffect } from 'react';
import { Resource } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Crosshair, Droplets, Zap, Box, Anchor, Layers, Activity, Wind, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import clsx from 'clsx';
import { useTheme } from '../store/ThemeContext';

interface ResourceMarketProps {
    resources: Resource[];
    initialSelectedTicker?: string | null;
}

// Mock Order Book Data Generator
const generateOrderBook = (basePrice: number) => {
    return Array.from({ length: 12 }, (_, i) => {
        const isBid = i > 5;
        const priceOffset = (i - 5.5) * (basePrice * 0.005);
        return {
            price: basePrice - priceOffset,
            size: Math.floor(Math.random() * 1000) + 100,
            type: isBid ? 'bid' : 'ask'
        };
    }).sort((a, b) => b.price - a.price);
};

const ResourceIcon = ({ ticker }: { ticker: string }) => {
    switch (ticker) {
        case 'H2O': return <Droplets size={16} className="text-blue-400" />;
        case 'FE': return <Box size={16} className="text-orange-400" />;
        case 'O2': return <Wind size={16} className="text-teal-400" />;
        case 'UR': return <Zap size={16} className="text-yellow-400" />;
        default: return <Layers size={16} className="text-purple-400" />;
    }
};

const ResourceMarket: React.FC<ResourceMarketProps> = ({ resources, initialSelectedTicker }) => {
    const [selectedId, setSelectedId] = useState<string>(resources[0].id);
    const activeResource = resources.find(r => r.id === selectedId) || resources[0];
    const orderBookData = generateOrderBook(activeResource.price);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Trading State
    const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
    const [amount, setAmount] = useState<string>('');
    const { balance, buyAsset, sellAsset, getHoldings } = useStore();
    
    // Derived Trade Calculations
    const holdings = getHoldings(activeResource.ticker);
    const numAmount = parseFloat(amount) || 0;
    const estimatedQty = tradeType === 'buy' ? numAmount / activeResource.price : numAmount;
    const estimatedTotal = tradeType === 'buy' ? numAmount : numAmount * activeResource.price;

    useEffect(() => {
        if (initialSelectedTicker) {
            const match = resources.find(r => r.ticker === initialSelectedTicker);
            if (match) setSelectedId(match.id);
        }
    }, [initialSelectedTicker, resources]);

    const handleTrade = () => {
        if (numAmount <= 0) return;
        
        if (tradeType === 'buy') {
            buyAsset(activeResource.ticker, numAmount, activeResource.price);
        } else {
            sellAsset(activeResource.ticker, numAmount, activeResource.price);
        }
        setAmount('');
    };

    return (
        <div className="w-full h-[calc(100vh-140px)] max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
            
            {/* LEFT COLUMN: Resource List (Sidebar) */}
            <div className="md:col-span-1 lg:col-span-1 glass-panel rounded-3xl overflow-hidden flex flex-col border border-border">
                <div className="p-4 border-b border-border bg-black/5 dark:bg-white/5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Commodities</h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {resources.map((res) => (
                        <div 
                            key={res.id}
                            onClick={() => setSelectedId(res.id)}
                            className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${selectedId === res.id ? 'bg-black/10 dark:bg-white/10 border-l-4 border-l-solana-green' : 'border-l-4 border-l-transparent'}`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2 font-bold text-text-primary">
                                    <ResourceIcon ticker={res.ticker} />
                                    <span>{res.ticker}</span>
                                </div>
                                <span className={`text-xs font-mono ${res.change >= 0 ? 'text-solana-green' : 'text-mars-red'}`}>
                                    {res.change > 0 ? '+' : ''}{res.change}%
                                </span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="font-mono text-sm text-text-secondary">${res.price.toFixed(2)}</span>
                                {/* Mini Sparkline */}
                                <div className="w-16 h-8">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={res.history.slice(-10)}>
                                            <Line type="monotone" dataKey="value" stroke={res.change >= 0 ? '#14F195' : '#FF4500'} strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CENTER COLUMN: Main Chart & Details */}
            <div className="md:col-span-3 lg:col-span-3 flex flex-col gap-6">
                
                {/* Chart Container */}
                <div className="flex-1 glass-panel rounded-3xl p-6 relative flex flex-col min-h-[400px] border border-border">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-3xl font-bold text-text-primary">{activeResource.name}</h2>
                                <span className="bg-black/5 dark:bg-white/10 text-xs px-2 py-1 rounded text-text-secondary font-mono">{activeResource.supply} Supply</span>
                            </div>
                            <div className="flex items-baseline gap-4">
                                <span className="text-4xl font-mono font-medium text-text-primary">${activeResource.price.toFixed(2)}</span>
                                <span className={`text-lg font-mono flex items-center ${activeResource.change >= 0 ? 'text-solana-green' : 'text-mars-red'}`}>
                                    {activeResource.change >= 0 ? <TrendingUp size={20} className="mr-1"/> : <TrendingDown size={20} className="mr-1"/>}
                                    {Math.abs(activeResource.change)}%
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="text-xs text-text-secondary uppercase mb-1">Volatility Index</div>
                             <div className={`text-sm font-bold px-3 py-1 rounded-full inline-block ${activeResource.volatility === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                {activeResource.volatility} Risk
                             </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activeResource.history}>
                                <defs>
                                    <linearGradient id="resourceGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={activeResource.change >= 0 ? "#14F195" : "#FF4500"} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={activeResource.change >= 0 ? "#14F195" : "#FF4500"} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#ffffff05" : "#00000005"} vertical={false} />
                                <XAxis dataKey="time" stroke={isDark ? "#ffffff30" : "#00000030"} fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis domain={['auto', 'auto']} stroke={isDark ? "#ffffff30" : "#00000030"} fontSize={10} tickLine={false} axisLine={false} orientation="right" />
                                <Tooltip 
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const dataPoint = payload[0].payload;
                                            return (
                                                <div className={clsx(
                                                    "border p-3 rounded-lg shadow-xl backdrop-blur-md",
                                                    isDark ? "bg-black/90 border-white/20" : "bg-white/90 border-black/10"
                                                )}>
                                                    <p className="text-xs text-text-secondary mb-1">{label}</p>
                                                    <p className="text-lg font-mono font-bold text-text-primary">${Number(payload[0].value).toFixed(2)}</p>
                                                    {dataPoint.event && (
                                                        <div className="mt-2 flex items-center gap-1 text-xs text-yellow-400">
                                                            <AlertTriangle size={12} />
                                                            {dataPoint.event}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke={activeResource.change >= 0 ? "#14F195" : "#FF4500"} 
                                    strokeWidth={3} 
                                    fill="url(#resourceGradient)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bottom Row: Corner Market & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[200px]">
                    {/* Corner Market Mechanic */}
                    <div className="glass-panel rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden group border border-border">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[40px] -mr-10 -mt-10" />
                        
                        <div className="flex justify-between items-center mb-4 relative z-10">
                            <h4 className="font-bold flex items-center gap-2 text-text-primary">
                                <Crosshair size={18} className="text-yellow-500" />
                                Market Corner
                            </h4>
                            <span className="text-xs text-text-secondary">Target: 70%</span>
                        </div>
                        
                        <div className="relative h-6 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mb-2">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${activeResource.cornerPercentage}%` }}
                                transition={{ duration: 1 }}
                                className={`h-full ${activeResource.cornerPercentage > 50 ? 'bg-yellow-500' : 'bg-text-secondary/30'}`}
                            />
                        </div>
                        <div className="flex justify-between text-xs font-mono relative z-10">
                            <span className="text-text-secondary">Current Ownership</span>
                            <span className="text-text-primary font-bold">{activeResource.cornerPercentage}%</span>
                        </div>
                        <p className="text-[10px] text-text-secondary/60 mt-3">
                            Warning: Cornering the market ({'>'}70%) triggers a regulatory crackdown from MarsCorp.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between border border-border">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                                 <Activity size={20} className="text-solana-purple" />
                             </div>
                             <div>
                                 <div className="text-xs text-text-secondary">24h Volume</div>
                                 <div className="font-mono font-bold text-xl text-text-primary">$42.8M</div>
                             </div>
                         </div>
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                                 <Anchor size={20} className="text-blue-400" />
                             </div>
                             <div>
                                 <div className="text-xs text-text-secondary">Largest Holder</div>
                                 <div className="font-mono font-bold text-xl text-blue-400">Elon_Doge_69</div>
                             </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Order Book & Quick Trade */}
            <div className="md:col-span-4 lg:col-span-1 flex flex-col gap-6">
                
                {/* Order Book */}
                <div className="glass-panel rounded-3xl p-6 flex-1 flex flex-col min-h-[300px] border border-border">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-4">Order Book</h3>
                    <div className="flex-1 flex flex-col justify-center space-y-1">
                        {orderBookData.map((order, i) => (
                            <div key={i} className="flex items-center justify-between text-xs font-mono group cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-0.5 rounded">
                                <span className={`${order.type === 'bid' ? 'text-solana-green' : 'text-mars-red'} opacity-80`}>
                                    {order.price.toFixed(2)}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-text-secondary group-hover:text-text-primary transition-colors">{order.size}</span>
                                    <div 
                                        className={`h-1.5 rounded-full ${order.type === 'bid' ? 'bg-solana-green' : 'bg-mars-red'}`} 
                                        style={{ width: `${Math.min(order.size / 10, 60)}px`}}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border text-center">
                        <span className="text-2xl font-mono font-bold text-text-primary">${activeResource.price.toFixed(2)}</span>
                        <div className="text-xs text-text-secondary mt-1">Spread: 0.2%</div>
                    </div>
                </div>

                {/* Quick Trade Widget - Upgraded */}
                <div className="glass-panel rounded-3xl p-6 bg-gradient-to-br from-black/5 to-transparent border border-border">
                    <h3 className="font-bold mb-4 text-text-primary">Quick Trade</h3>
                    
                    {/* Toggle */}
                    <div className="flex gap-2 mb-4">
                        <button 
                            onClick={() => setTradeType('buy')}
                            className={clsx(
                                "flex-1 py-3 rounded-xl font-bold transition-all text-sm",
                                tradeType === 'buy' 
                                    ? "bg-solana-green text-black" 
                                    : "bg-black/5 dark:bg-white/5 text-text-secondary hover:bg-black/10 dark:hover:bg-white/10"
                            )}
                        >
                            Buy
                        </button>
                        <button 
                             onClick={() => setTradeType('sell')}
                             className={clsx(
                                "flex-1 py-3 rounded-xl font-bold transition-all text-sm",
                                tradeType === 'sell' 
                                    ? "bg-mars-red text-white" 
                                    : "bg-black/5 dark:bg-white/5 text-text-secondary hover:bg-black/10 dark:hover:bg-white/10"
                            )}
                        >
                            Sell
                        </button>
                    </div>

                    <div className="space-y-4">
                         <div>
                            <div className="flex justify-between text-xs text-text-secondary mb-1">
                                <span>Amount ({tradeType === 'buy' ? 'SOL' : activeResource.ticker})</span>
                                <span className="flex items-center gap-1"><Wallet size={10} /> {balance.toFixed(2)} SOL</span>
                            </div>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary font-mono focus:outline-none focus:border-text-primary transition-colors"
                                    placeholder="0.00"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-text-secondary">
                                    {tradeType === 'buy' ? 'SOL' : activeResource.ticker}
                                </span>
                            </div>
                         </div>

                         {/* Estimates */}
                         <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 text-xs space-y-2 border border-border">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Price</span>
                                <span className="font-mono text-text-primary">${activeResource.price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Est. {tradeType === 'buy' ? 'Receive' : 'Total'}</span>
                                <span className={clsx("font-mono font-bold", tradeType === 'buy' ? 'text-solana-green' : 'text-mars-red')}>
                                    {tradeType === 'buy' ? `+${estimatedQty.toFixed(2)} ${activeResource.ticker}` : `+${estimatedTotal.toFixed(2)} SOL`}
                                </span>
                            </div>
                         </div>

                         <button 
                            onClick={handleTrade}
                            className={clsx(
                                "w-full font-bold py-3 rounded-xl hover:scale-105 transition-transform",
                                tradeType === 'buy' ? "bg-text-primary text-background" : "bg-mars-red text-white"
                            )}
                         >
                             Place {tradeType.toUpperCase()} Order
                         </button>
                         
                         <div className="text-center text-[10px] text-text-secondary">
                             Balance: {holdings.toFixed(2)} {activeResource.ticker} owned
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceMarket;
