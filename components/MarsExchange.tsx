
import React, { useState, useEffect } from 'react';
import { Company } from '../types';
import StockTicker from './StockTicker';
import CompanyTerminal from './CompanyTerminal';
import { ArrowUp, ArrowDown, Search, AlertTriangle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface MarsExchangeProps {
    companies: Company[];
    initialSelectedTicker?: string | null;
}

const MarsExchange: React.FC<MarsExchangeProps> = ({ companies, initialSelectedTicker }) => {
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Company; direction: 'asc' | 'desc' } | null>(null);

    // Auto-open if deep linked
    useEffect(() => {
        if (initialSelectedTicker) {
            const match = companies.find(c => c.ticker === initialSelectedTicker);
            if (match) setSelectedCompany(match);
        }
    }, [initialSelectedTicker, companies]);

    const sortedCompanies = React.useMemo(() => {
        if (!sortConfig) return companies;
        return [...companies].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            
            if (aVal === undefined || bVal === undefined) return 0;
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [companies, sortConfig]);

    const handleSort = (key: keyof Company) => {
        let direction: 'asc' | 'desc' = 'desc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="w-full min-h-screen bg-background flex flex-col transition-colors duration-500">
            <StockTicker companies={companies} />

            <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">Mars <span className="text-solana-green">Exchange</span></h1>
                        <p className="text-text-secondary text-sm mt-1">Secondary Market • 24h Vol: $842M</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search Ticker..." 
                            className="bg-black/5 dark:bg-white/5 border border-border rounded-full pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-text-primary/30 w-64 placeholder:text-text-secondary/50"
                        />
                    </div>
                </div>

                {/* Data Grid */}
                <div className="w-full glass-panel rounded-3xl overflow-hidden border border-border">
                    <div className="grid grid-cols-12 bg-black/5 dark:bg-white/5 p-4 text-xs font-mono text-text-secondary uppercase tracking-wider border-b border-border">
                        <div className="col-span-2 cursor-pointer hover:text-text-primary transition-colors" onClick={() => handleSort('name')}>Asset</div>
                        <div className="col-span-3 pl-2 cursor-pointer hover:text-text-primary transition-colors" onClick={() => handleSort('description')}>Description</div>
                        <div className="col-span-2 text-right cursor-pointer hover:text-text-primary transition-colors" onClick={() => handleSort('price')}>Price</div>
                        <div className="col-span-2 text-right cursor-pointer hover:text-text-primary transition-colors" onClick={() => handleSort('change')}>24h Change</div>
                        <div className="col-span-1 text-right cursor-pointer hover:text-text-primary transition-colors" onClick={() => handleSort('marketCap')}>Mkt Cap</div>
                        <div className="col-span-2 pl-4">Gov Risk</div>
                    </div>

                    <div className="divide-y divide-border">
                        {sortedCompanies.map((company) => (
                            <motion.div 
                                key={company.id}
                                layoutId={company.id}
                                onClick={() => setSelectedCompany(company)}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-12 p-4 items-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                            >
                                {/* Asset */}
                                <div className="col-span-2 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-black/10 dark:bg-white/10 flex items-center justify-center font-bold text-xs group-hover:bg-solana-purple group-hover:text-black transition-colors text-text-primary">
                                        {company.ticker.substring(1,3)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-text-primary">{company.ticker}</div>
                                        <div className="text-[10px] text-text-secondary">{company.sector}</div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="col-span-3 text-xs text-text-secondary truncate pl-2 pr-4 font-sans">
                                    {company.description || "No description available"}
                                </div>

                                {/* Price */}
                                <div className="col-span-2 text-right font-mono text-sm text-text-primary">
                                    ${company.price.toFixed(2)}
                                </div>

                                {/* Change */}
                                <div className={clsx("col-span-2 text-right font-mono text-sm", company.change >= 0 ? "text-solana-green" : "text-mars-red")}>
                                    {company.change > 0 ? "+" : ""}{company.change}%
                                </div>

                                {/* Market Cap */}
                                <div className="col-span-1 text-right font-mono text-sm text-text-secondary">
                                    ${company.marketCap}M
                                </div>

                                {/* Governance / Takeover Risk */}
                                <div className="col-span-2 pl-4">
                                    {company.takeover?.active ? (
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-xs text-red-500 font-bold animate-pulse">
                                                <AlertTriangle size={12} />
                                                HOSTILE TAKEOVER
                                            </div>
                                            <div className="w-full h-1.5 bg-red-900/30 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-red-500" 
                                                    style={{ width: `${company.takeover.progress}%`}}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-xs text-text-secondary/50">
                                            <Users size={12} />
                                            Stable Board
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {selectedCompany && (
                    <CompanyTerminal 
                        company={selectedCompany} 
                        onClose={() => setSelectedCompany(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default MarsExchange;
