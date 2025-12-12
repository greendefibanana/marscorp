
import React, { useState } from 'react';
import { Company, ChartData, MarketStats } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Zap, Globe, Activity, Plus } from 'lucide-react';
import LivingMars from './LivingMars';
import ExploreWidget from './ExploreWidget';
import CreateBusinessModal from './CreateBusinessModal';
import { analyzeMarketTrend } from '../services/geminiService';
import clsx from 'clsx';

interface DashboardProps {
    stats: MarketStats;
    companies: Company[];
    chartData: ChartData[];
    onCreateBusiness: (data: any) => void;
    onNavigate: (tab: 'exchange' | 'resources', ticker?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, companies, chartData, onCreateBusiness, onNavigate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [analysis, setAnalysis] = useState<string>("");
    const [analyzing, setAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        setAnalyzing(true);
        const result = await analyzeMarketTrend(chartData);
        setAnalysis(result);
        setAnalyzing(false);
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-text-primary">MarsCorp <span className="text-solana-purple">Terminal</span></h1>
                    <p className="text-text-secondary font-mono text-sm mt-1">SOLANA MAINNET • BLOCK 249,102,442</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-text-primary text-surface px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                    <Plus size={18} />
                    Launch IPO
                </button>
            </div>

            {/* Top Grid: Hero & 3D */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5">
                    <ExploreWidget companies={companies} onNavigate={onNavigate} />
                </div>
                <div className="lg:col-span-7 h-[320px] lg:h-auto">
                    <LivingMars stats={stats} />
                </div>
            </div>

            {/* Bottom Grid: Market Data */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: Chart */}
                <div className="lg:col-span-2 glass-panel rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-text-primary">
                            <Activity className="text-solana-green" size={20} />
                            Market Index ($MCORP)
                        </h3>
                         <button 
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className="text-xs border border-border px-3 py-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2 text-text-secondary"
                        >
                            <Zap size={12} className={analyzing ? "animate-pulse" : ""} />
                            {analyzing ? "Analyzing..." : "AI Insight"}
                        </button>
                    </div>
                    
                    {analysis && (
                        <div className="mb-4 p-3 bg-solana-purple/10 border border-solana-purple/30 rounded-xl text-xs font-mono text-solana-purple">
                            {analysis}
                        </div>
                    )}

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#14F195" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#14F195" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="time" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                                    itemStyle={{ color: '#14F195' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#14F195" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right: Order Book / Live Feed */}
                <div className="glass-panel rounded-3xl p-6 flex flex-col h-[400px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-text-primary">
                            <Globe size={18} className="text-blue-400" />
                            Live Feed
                        </h3>
                        <button 
                            onClick={() => onNavigate('resources')}
                            className="text-[10px] text-text-secondary hover:text-text-primary uppercase tracking-wider underline decoration-dotted"
                        >
                            View Commodities
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {companies.map((company) => (
                            <div 
                                key={company.id} 
                                onClick={() => onNavigate('exchange', company.ticker)}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center font-mono text-xs font-bold text-text-primary/70">
                                        {company.ticker.substring(1,3)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm text-text-primary">{company.ticker}</div>
                                        <div className="text-[10px] text-text-secondary">{company.sector}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-sm text-text-primary">${company.price.toFixed(2)}</div>
                                    <div className={`text-xs font-mono flex items-center justify-end gap-1 ${company.change >= 0 ? 'text-solana-green' : 'text-rose-500'}`}>
                                        {company.change >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                        {Math.abs(company.change)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <CreateBusinessModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={onCreateBusiness} 
            />
        </div>
    );
};

export default Dashboard;
