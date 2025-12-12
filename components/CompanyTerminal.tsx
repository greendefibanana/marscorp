
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Company } from '../types';
import { useStore } from '../store/useStore';
import { X, TrendingUp, TrendingDown, ShieldAlert, Crosshair, AlertTriangle, Users, Check, MapPin, Calendar, User, Globe } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../store/ThemeContext';
import clsx from 'clsx';

interface CompanyTerminalProps {
  company: Company;
  onClose: () => void;
}

const generateMockChartData = (basePrice: number) => {
    let price = basePrice;
    return Array.from({ length: 24 }, (_, i) => {
        price = price * (1 + (Math.random() - 0.5) * 0.05);
        return { time: `${i}:00`, value: price };
    });
};

// Social Icons
const XIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const TelegramIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
);

const DiscordIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
);

import { useMarsProtocol } from '../hooks/useMarsProtocol';

const CompanyTerminal: React.FC<CompanyTerminalProps> = ({ company, onClose }) => {
    const [activeTab, setActiveTab] = useState<'trade' | 'governance'>('trade');
    const [amount, setAmount] = useState<string>('');
    const { balance, buyAsset, sellAsset, getHoldings } = useStore();
    const { theme } = useTheme();
    const { buyShares, sellShares, initiateTakeover, isConnected } = useMarsProtocol();
    const isDark = theme === 'dark';
    
    const holdings = getHoldings(company.ticker);
    const chartData = generateMockChartData(company.price);

    const handleTrade = async (type: 'buy' | 'sell') => {
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) return;

        try {
            if (isConnected) {
                // Use the real Mint Address if available, otherwise fallback (will likely fail on-chain but useful for dev/sim)
                const targetMint = company.mint || company.ticker;
                
                if (!company.mint) {
                    console.warn("No Mint Address found for this company. Trade may fail if not running in simulation mode.");
                }

                if (type === 'buy') {
                    // Buy with SOL (convert to Lamports)
                    console.log(`Buying ${val} SOL of ${company.ticker} (Mint: ${targetMint})`);
                    await buyShares(targetMint, Math.floor(val * 1_000_000_000));
                } else {
                    // Sell Shares (Quantity)
                    console.log(`Selling ${val} shares of ${company.ticker} (Mint: ${targetMint})`);
                    await sellShares(targetMint, Math.floor(val * 1_000_000)); // Assuming 6 decimals for token
                }
            } else {
                console.warn("Wallet not connected, simulating trade.");
            }

            if (type === 'buy') {
                buyAsset(company.ticker, val, company.price);
            } else {
                // Selling by Quantity
                sellAsset(company.ticker, val, company.price);
            }
            setAmount('');
        } catch (e) {
            console.error("Trade failed:", e);
            alert("Transaction failed on-chain.");
        }
    };

    const handleTakeover = async () => {
        try {
            if (isConnected) {
                console.log(`Initiating takeover for ${company.ticker}`);
                await initiateTakeover(company.ticker);
            }
            // No local store update for takeover yet, as it's complex state
            alert("Takeover initiated on-chain!");
        } catch (e) {
            console.error("Takeover failed:", e);
            alert("Failed to initiate takeover.");
        }
    };

    // Calculate ownership % based on arbitrary supply logic for demo
    const ownershipPct = (holdings * company.price) / ((company.marketCap || 100) * 1000000) * 100;
    const canTakeover = ownershipPct > 5;

    // Derived States
    const isVerified = company.socials?.x && company.socials?.telegram && company.socials?.discord;
    const hasDescription = company.description && company.description.length > 0;

    const SocialLink = ({ icon, link, colorClass }: { icon: React.ReactNode, link?: string, colorClass: string }) => (
        <a 
            href={link || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className={clsx(
                "p-2 rounded-lg transition-all",
                link 
                    ? `bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary hover:text-text-primary ${colorClass}` 
                    : "bg-transparent text-text-secondary/30 cursor-not-allowed"
            )}
            onClick={(e) => !link && e.preventDefault()}
        >
            {icon}
        </a>
    );

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8"
        >
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-6xl h-[85vh] bg-surface border border-border rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative text-text-primary"
            >
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                    <X size={20} className="text-text-secondary" />
                </button>

                {/* LEFT COLUMN: VISUALS & INFO */}
                <div className="flex-1 border-r border-border flex flex-col p-6 bg-gradient-to-b from-surface to-background overflow-y-auto custom-scrollbar">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-center text-xl font-bold font-mono border border-border shadow-inner text-text-primary">
                                    {company.ticker.substring(1,3)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl font-bold tracking-tight text-text-primary">{company.name}</h2>
                                        {isVerified && (
                                            <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                                                <Check size={10} strokeWidth={3} />
                                                VERIFIED
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                                            <span className="bg-black/5 dark:bg-white/5 border border-border px-2 py-0.5 rounded text-xs">{company.sector}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1 text-xs">
                                                <MapPin size={10} /> {company.region || 'Mars'}
                                            </span>
                                        </div>
                                        
                                        {/* Social Bar */}
                                        <div className="flex items-center gap-1 border-l border-border pl-3">
                                            <SocialLink icon={<XIcon />} link={company.socials?.x} colorClass="hover:bg-black/10 dark:hover:bg-white/20" />
                                            <SocialLink icon={<TelegramIcon />} link={company.socials?.telegram} colorClass="hover:bg-blue-500/20 hover:text-blue-400" />
                                            <SocialLink icon={<DiscordIcon />} link={company.socials?.discord} colorClass="hover:bg-indigo-500/20 hover:text-indigo-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-mono font-bold text-text-primary">${company.price.toFixed(2)}</div>
                            <div className={`flex items-center justify-end gap-1 font-mono text-sm ${company.change >= 0 ? 'text-solana-green' : 'text-mars-red'}`}>
                                {company.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {company.change}%
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="w-full h-[280px] mb-6 relative bg-black/5 dark:bg-white/[0.02] rounded-2xl border border-border p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="terminalGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={company.change >= 0 ? "#14F195" : "#FF4500"} stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor={company.change >= 0 ? "#14F195" : "#FF4500"} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" hide />
                                <YAxis domain={['auto', 'auto']} hide />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: isDark ? '#09090b' : '#ffffff', 
                                        border: isDark ? '1px solid #333' : '1px solid #e5e7eb', 
                                        borderRadius: '8px',
                                        color: isDark ? '#fff' : '#000'
                                    }}
                                    itemStyle={{ color: isDark ? '#fff' : '#000' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke={company.change >= 0 ? "#14F195" : "#FF4500"} 
                                    strokeWidth={2} 
                                    fill="url(#terminalGradient)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* About Section */}
                    <div className="bg-surface/50 rounded-2xl p-5 border border-border backdrop-blur-md mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Globe size={100} className="text-text-primary" />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary mb-3">About {company.name}</h3>
                        <p className="text-sm text-text-primary/90 leading-relaxed mb-6 max-w-[90%] font-light">
                            {hasDescription ? company.description : "No corporate manifesto published. This entity operates in stealth mode on the Martian blockchain."}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-border pt-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-text-secondary">
                                    <User size={14} />
                                </div>
                                <div>
                                    <div className="text-[10px] text-text-secondary uppercase">CEO</div>
                                    <div className="text-xs font-mono text-text-primary truncate max-w-[100px]">@AnonDev</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-text-secondary">
                                    <MapPin size={14} />
                                </div>
                                <div>
                                    <div className="text-[10px] text-text-secondary uppercase">Territory</div>
                                    <div className="text-xs font-mono text-text-primary">{company.region || 'Unknown'}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-text-secondary">
                                    <Calendar size={14} />
                                </div>
                                <div>
                                    <div className="text-[10px] text-text-secondary uppercase">Founded</div>
                                    <div className="text-xs font-mono text-text-primary">Epoch 420</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mt-auto">
                        <div className="bg-black/5 dark:bg-white/5 border border-border rounded-xl p-3">
                            <div className="text-[10px] text-text-secondary uppercase">Market Cap</div>
                            <div className="font-mono font-bold text-sm text-text-primary">${company.marketCap}M</div>
                        </div>
                        <div className="bg-black/5 dark:bg-white/5 border border-border rounded-xl p-3">
                            <div className="text-[10px] text-text-secondary uppercase">Real Yield APY</div>
                            <div className="font-mono font-bold text-sm text-solana-green">{company.apy}%</div>
                        </div>
                        <div className="bg-black/5 dark:bg-white/5 border border-border rounded-xl p-3">
                            <div className="text-[10px] text-text-secondary uppercase">Production</div>
                            <div className="font-mono font-bold text-xs text-text-primary truncate" title={company.production}>{company.production}</div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: ACTION */}
                <div className="w-full md:w-[400px] flex flex-col bg-background border-l border-border">
                    {/* Tabs */}
                    <div className="flex border-b border-border">
                        <button 
                            onClick={() => setActiveTab('trade')}
                            className={clsx(
                                "flex-1 py-4 text-sm font-bold transition-colors",
                                activeTab === 'trade' 
                                    ? "text-text-primary border-b-2 border-solana-green" 
                                    : "text-text-secondary hover:text-text-primary"
                            )}
                        >
                            TRADE
                        </button>
                        <button 
                            onClick={() => setActiveTab('governance')}
                            className={clsx(
                                "flex-1 py-4 text-sm font-bold transition-colors",
                                activeTab === 'governance' 
                                    ? "text-text-primary border-b-2 border-red-500" 
                                    : "text-text-secondary hover:text-text-primary"
                            )}
                        >
                            GOVERNANCE
                        </button>
                    </div>

                    {/* Trade Tab */}
                    {activeTab === 'trade' && (
                        <div className="flex-1 p-6 flex flex-col gap-6">
                            {/* Visual Order Book (Abstracted) */}
                            <div className="space-y-1">
                                <div className="text-xs text-text-secondary uppercase mb-2">Market Depth</div>
                                <div className="flex h-16 gap-1 items-end">
                                    {[60, 40, 70, 30, 50].map((h, i) => (
                                        <div key={`sell-${i}`} className="flex-1 bg-mars-red/30 rounded-t-sm hover:bg-mars-red/60 transition-colors" style={{ height: `${h}%`}} />
                                    ))}
                                    <div className="w-1 bg-black/10 dark:bg-white/10 h-full mx-1" />
                                    {[50, 80, 40, 90, 60].map((h, i) => (
                                        <div key={`buy-${i}`} className="flex-1 bg-solana-green/30 rounded-t-sm hover:bg-solana-green/60 transition-colors" style={{ height: `${h}%`}} />
                                    ))}
                                </div>
                            </div>

                            {/* Wallet Info */}
                            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl flex justify-between items-center border border-border">
                                <span className="text-sm text-text-secondary">Balance</span>
                                <span className="font-mono font-bold text-text-primary">{balance.toFixed(2)} SOL</span>
                            </div>

                            <div className="flex-1">
                                <label className="block text-xs font-mono text-text-secondary mb-2">AMOUNT</label>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-transparent border-b border-border py-2 text-2xl font-mono focus:border-text-primary focus:outline-none transition-colors text-text-primary placeholder:text-text-secondary/30"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-0 bottom-2 text-text-secondary text-sm">SOL</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => handleTrade('buy')}
                                    className="bg-solana-green text-black font-bold py-4 rounded-xl hover:brightness-110 transition-all active:scale-95 shadow-[0_0_15px_rgba(20,241,149,0.3)]"
                                >
                                    BUY
                                </button>
                                <button 
                                    onClick={() => handleTrade('sell')}
                                    className="bg-mars-red text-white font-bold py-4 rounded-xl hover:brightness-110 transition-all active:scale-95 shadow-[0_0_15px_rgba(255,69,0,0.3)]"
                                >
                                    SELL
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Governance Tab */}
                    {activeTab === 'governance' && (
                        <div className="flex-1 p-6 flex flex-col relative overflow-hidden">
                            {/* Background Threat */}
                            <div className="absolute inset-0 bg-red-500/5 z-0" />
                            
                            <div className="relative z-10 space-y-6">
                                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-start gap-3">
                                    <ShieldAlert className="text-red-500 shrink-0" size={20} />
                                    <div>
                                        <h4 className="font-bold text-red-500 text-sm">Takeover Risk: {company.takeover?.progress || 0}%</h4>
                                        <p className="text-xs text-red-400/70 mt-1">
                                            Accumulation of &gt;51% shares triggers a forced board seat.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs text-text-secondary mb-1">
                                            <span>Your Stake</span>
                                            <span>Target: 51%</span>
                                        </div>
                                        <div className="h-4 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
                                                style={{ width: `${Math.min(ownershipPct, 100)}%`}}
                                            />
                                        </div>
                                        <div className="text-right font-mono text-xs mt-1 text-text-primary/70">
                                            You own {ownershipPct.toFixed(4)}%
                                        </div>
                                    </div>

                                    <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl space-y-3 border border-border">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-text-secondary">Required Stake</span>
                                            <span className="font-mono text-red-400">5.0%</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-text-secondary">Hostile Bid Cost</span>
                                            <span className="font-mono text-text-primary">50,000 SOL</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 flex items-end">
                                    <button 
                                        onClick={handleTakeover}
                                        disabled={!canTakeover}
                                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${canTakeover 
                                            ? 'bg-red-600 text-white border-red-500 hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse' 
                                            : 'bg-transparent text-text-secondary/20 border-border cursor-not-allowed'}`}
                                    >
                                        <Crosshair size={18} />
                                        INITIATE HOSTILE TAKEOVER
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CompanyTerminal;
