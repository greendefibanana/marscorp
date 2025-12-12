
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Map, TrendingUp, Wallet, ArrowRight, ArrowLeft, Check, Hexagon, Globe } from 'lucide-react';
import { generateCompanyDescription } from '../services/geminiService';
import clsx from 'clsx';

interface CreateBusinessModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

const REGIONS = [
    { id: 'olympus', name: 'Olympus Mons', resource: 'Energy', yield: '+15% Solar', cost: 0.5 },
    { id: 'tharsis', name: 'Tharsis Rise', resource: 'Mining', yield: '+20% Iron', cost: 0.3 },
    { id: 'hellas', name: 'Hellas Basin', resource: 'Terraforming', yield: '+10% Oxygen', cost: 0.2 },
    { id: 'valles', name: 'Valles Marineris', resource: 'Tech', yield: '+25% Bandwidth', cost: 0.8 },
];

const STEPS = [
    { id: 0, title: "Entity Identity", icon: Sparkles },
    { id: 1, title: "Bonding Curve", icon: TrendingUp },
];

// Brand Icons
const XIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const TelegramIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
);

const DiscordIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
);

const CreateBusinessModal: React.FC<CreateBusinessModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(0);

    // Form State
    const [name, setName] = useState('');
    const [ticker, setTicker] = useState('$');
    const [sector, setSector] = useState('Tech');
    const [desc, setDesc] = useState('');
    const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
    const [devBuy, setDevBuy] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Socials
    const [socialX, setSocialX] = useState('');
    const [socialTG, setSocialTG] = useState('');
    const [socialDC, setSocialDC] = useState('');

    const handleGenerateDesc = async () => {
        if (!name) return;
        setIsGenerating(true);
        const generated = await generateCompanyDescription(name, sector);
        setDesc(generated);
        setIsGenerating(false);
    };

    const nextStep = () => {
        if (step < STEPS.length - 1) {
            setDirection(1);
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        if (step > 0) {
            setDirection(-1);
            setStep(step - 1);
        }
    };

    const handleSubmit = () => {
        onSubmit({ 
            name, 
            ticker, 
            sector, 
            description: desc,
            region: selectedRegion.name,
            yield: selectedRegion.yield,
            socials: {
                x: socialX,
                telegram: socialTG,
                discord: socialDC
            }
        });
        resetForm();
    };

    const resetForm = () => {
        setStep(0);
        setName('');
        setTicker('$');
        setDesc('');
        setDevBuy(1);
        setSocialX('');
        setSocialTG('');
        setSocialDC('');
        onClose();
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                    />
                    
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-x-0 bottom-0 md:top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[700px] md:h-[650px] bg-surface/95 backdrop-blur-xl border border-border md:rounded-3xl rounded-t-3xl shadow-[0_0_50px_rgba(0,0,0,0.4)] flex flex-col z-50 overflow-hidden text-text-primary"
                    >
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-surface/50">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <span className="text-solana-purple">Launch</span> IPO
                                </h2>
                                <div className="flex gap-2 mt-2">
                                    {STEPS.map((s) => (
                                        <div 
                                            key={s.id} 
                                            className={`h-1 rounded-full transition-all duration-300 ${step >= s.id ? 'w-8 bg-solana-green' : 'w-4 bg-black/10 dark:bg-white/10'}`} 
                                        />
                                    ))}
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                                <X size={20} className="text-text-secondary" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden relative p-8">
                            <AnimatePresence initial={false} custom={direction} mode="wait">
                                <motion.div
                                    key={step}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                    className="h-full flex flex-col"
                                >
                                    {/* STEP 1: IDENTITY */}
                                    {step === 0 && (
                                        <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2">
                                            <div className="text-center mb-6">
                                                <h3 className="text-2xl font-bold mb-2 text-text-primary">Define Entity</h3>
                                                <p className="text-text-secondary text-sm">Create the corporate identity for the blockchain.</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-mono text-text-secondary mb-2">CORPORATE NAME</label>
                                                    <input 
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-4 py-4 text-text-primary text-lg focus:border-solana-purple focus:outline-none transition-colors placeholder:text-text-secondary/30"
                                                        placeholder="Mars Heavy Industries"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="md:col-span-1">
                                                    <label className="block text-xs font-mono text-text-secondary mb-2">TICKER</label>
                                                    <input 
                                                        value={ticker}
                                                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                                                        className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-4 py-4 text-text-primary font-mono text-lg focus:border-solana-green focus:outline-none transition-colors text-center placeholder:text-text-secondary/30"
                                                        placeholder="$MHI"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-mono text-text-secondary mb-2">SECTOR</label>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                    {['Tech', 'Mining', 'Energy', 'Terra'].map((s) => (
                                                        <button 
                                                            key={s}
                                                            onClick={() => setSector(s === 'Terra' ? 'Terraforming' : s)}
                                                            className={clsx(
                                                                "py-3 rounded-lg text-sm font-medium transition-all border",
                                                                sector === (s === 'Terra' ? 'Terraforming' : s) 
                                                                    ? "bg-surface text-text-primary border-solana-purple shadow-sm" 
                                                                    : "bg-transparent text-text-secondary border-border hover:border-text-secondary"
                                                            )}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-mono text-text-secondary mb-2">SOCIAL UPLINK (OPTIONAL)</label>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div className="flex items-center bg-black/5 dark:bg-white/5 border border-border rounded-xl px-3 py-2 focus-within:border-border transition-colors group">
                                                        <div className="text-text-secondary group-focus-within:text-text-primary transition-colors mr-2">
                                                            <XIcon />
                                                        </div>
                                                        <input 
                                                            value={socialX}
                                                            onChange={(e) => setSocialX(e.target.value)}
                                                            className="bg-transparent border-none text-sm text-text-primary focus:outline-none w-full placeholder:text-text-secondary/30"
                                                            placeholder="@handle"
                                                        />
                                                    </div>
                                                    <div className="flex items-center bg-black/5 dark:bg-white/5 border border-border rounded-xl px-3 py-2 focus-within:border-blue-400 transition-colors group">
                                                        <div className="text-text-secondary group-focus-within:text-blue-400 transition-colors mr-2">
                                                            <TelegramIcon />
                                                        </div>
                                                        <input 
                                                            value={socialTG}
                                                            onChange={(e) => setSocialTG(e.target.value)}
                                                            className="bg-transparent border-none text-sm text-text-primary focus:outline-none w-full placeholder:text-text-secondary/30"
                                                            placeholder="t.me/..."
                                                        />
                                                    </div>
                                                    <div className="flex items-center bg-black/5 dark:bg-white/5 border border-border rounded-xl px-3 py-2 focus-within:border-indigo-400 transition-colors group">
                                                        <div className="text-text-secondary group-focus-within:text-indigo-400 transition-colors mr-2">
                                                            <DiscordIcon />
                                                        </div>
                                                        <input 
                                                            value={socialDC}
                                                            onChange={(e) => setSocialDC(e.target.value)}
                                                            className="bg-transparent border-none text-sm text-text-primary focus:outline-none w-full placeholder:text-text-secondary/30"
                                                            placeholder="discord.gg/..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="block text-xs font-mono text-text-secondary">MANIFESTO</label>
                                                    <button 
                                                        onClick={handleGenerateDesc}
                                                        disabled={!name || isGenerating}
                                                        className="text-[10px] text-solana-purple flex items-center gap-1 hover:text-text-primary transition-colors"
                                                    >
                                                        <Sparkles size={10} />
                                                        {isGenerating ? "Processing..." : "Auto-Generate"}
                                                    </button>
                                                </div>
                                                <textarea 
                                                    value={desc}
                                                    onChange={(e) => setDesc(e.target.value)}
                                                    rows={2}
                                                    className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-4 py-3 text-text-primary focus:border-solana-purple focus:outline-none transition-colors resize-none text-sm placeholder:text-text-secondary/30"
                                                    placeholder="Describe the company's mission..."
                                                />
                                            </div>
                                        </div>
                                    )}



                                    {/* STEP 3: TOKENOMICS */}
                                    {step === 2 && (
                                        <div className="space-y-6">
                                            <div className="text-center">
                                                <h3 className="text-2xl font-bold mb-2 text-text-primary">Bonding Curve</h3>
                                                <p className="text-text-secondary text-sm">Configure initial liquidity and developer buy. Also select your base of operations.</p>
                                            </div>

                                            {/* Territory Selection - Moved from Step 2 */}
                                            <div className="space-y-6 mt-4">
                                                <h4 className="text-xl font-bold text-text-primary">Select Territory</h4>
                                                <p className="text-text-secondary text-sm">Choose a base of operations. Impacts yield.</p>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {REGIONS.map((region) => (
                                                        <button
                                                            key={region.id}
                                                            onClick={() => setSelectedRegion(region)}
                                                            className={clsx(
                                                                "relative p-4 rounded-2xl border text-left transition-all overflow-hidden group",
                                                                selectedRegion.id === region.id 
                                                                    ? "bg-solana-purple/10 border-solana-purple" 
                                                                    : "bg-black/5 dark:bg-white/5 border-border hover:border-text-secondary"
                                                            )}
                                                        >
                                                            <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                                                <Hexagon size={48} className={selectedRegion.id === region.id ? 'text-solana-purple' : 'text-text-primary'} />
                                                            </div>
                                                            <div className="relative z-10">
                                                                <div className="text-xs font-mono text-text-secondary uppercase mb-1">{region.resource}</div>
                                                                <div className="font-bold text-lg mb-1 text-text-primary">{region.name}</div>
                                                                <div className="inline-block px-2 py-0.5 rounded bg-surface text-[10px] text-solana-green border border-solana-green/30">
                                                                    {region.yield}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 border border-border mt-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm text-text-secondary">Land Tax</span>
                                                        <span className="font-mono text-text-primary">{selectedRegion.cost} SOL</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-text-secondary">Ownership Rights</span>
                                                        <span className="font-mono text-solana-green">PERMANENT</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Original Bonding Curve Content continues below */}
                                            {/* Graph Visualization */}
                                            <div className="h-48 w-full bg-black/5 dark:bg-white/5 rounded-xl relative overflow-hidden flex items-end border border-border group">
                                                <div className="absolute inset-0 bg-gradient-to-t from-solana-green/10 to-transparent opacity-50" />
                                                
                                                {/* Simulated Curve */}
                                                <svg viewBox="0 0 400 200" className="w-full h-full">
                                                    <path 
                                                        d="M0,200 C100,200 200,180 300,100 C350,50 400,0 400,0 L400,200 Z" 
                                                        fill="rgba(20, 241, 149, 0.1)" 
                                                    />
                                                    <path 
                                                        d="M0,200 C100,200 200,180 300,100 C350,50 400,0 400,0" 
                                                        fill="none" 
                                                        stroke="#14F195" 
                                                        strokeWidth="3"
                                                        strokeDasharray="4 4" 
                                                    />
                                                    {/* Dev Buy Fill */}
                                                    <motion.rect 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(devBuy / 10) * 100}%` }}
                                                        height="100%" 
                                                        fill="rgba(20, 241, 149, 0.2)"
                                                    />
                                                </svg>

                                                <div className="absolute top-4 right-4 text-right">
                                                    <div className="text-[10px] text-text-secondary uppercase">Graduation Cap</div>
                                                    <div className="font-mono font-bold text-solana-green">$64,000</div>
                                                </div>
                                                <div className="absolute bottom-4 left-4">
                                                    <div className="text-[10px] text-text-secondary uppercase">Start Price</div>
                                                    <div className="font-mono font-bold text-text-primary">$0.000042</div>
                                                </div>
                                            </div>

                                            {/* Dev Buy Slider */}
                                            <div className="space-y-4">
                                                <div className="flex justify-between">
                                                    <label className="text-sm font-medium flex items-center gap-2 text-text-primary">
                                                        <Wallet size={14} className="text-solana-purple" />
                                                        Dev Buy (SOL)
                                                    </label>
                                                    <span className="font-mono font-bold text-solana-purple">{devBuy.toFixed(2)} SOL</span>
                                                </div>
                                                <input 
                                                    type="range" 
                                                    min="0.1" 
                                                    max="10" 
                                                    step="0.1" 
                                                    value={devBuy} 
                                                    onChange={(e) => setDevBuy(parseFloat(e.target.value))}
                                                    className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-solana-purple"
                                                />
                                                <div className="flex justify-between text-[10px] text-text-secondary font-mono">
                                                    <span>0.1 SOL</span>
                                                    <span>10 SOL (MAX)</span>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-solana-green/10 border border-solana-green/20 rounded-xl flex gap-3">
                                                <div className="bg-solana-green/20 p-2 rounded-full h-fit">
                                                    <TrendingUp size={16} className="text-solana-green" />
                                                </div>
                                                <div className="text-xs">
                                                    <div className="font-bold text-text-primary mb-1">Sniper Protection Active</div>
                                                    <div className="text-text-secondary">Your transaction is bundled in the first block. Cannot be front-run.</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Footer Controls */}
                        <div className="p-6 border-t border-border bg-surface/50 flex justify-between items-center">
                            {step > 0 ? (
                                <button 
                                    onClick={prevStep}
                                    className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors px-4 py-2"
                                >
                                    <ArrowLeft size={16} /> Back
                                </button>
                            ) : (
                                <div /> /* Spacer */
                            )}

                            {step < STEPS.length - 1 ? (
                                <button 
                                    onClick={nextStep}
                                    disabled={!name || !ticker}
                                    className="bg-text-primary text-surface px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                                >
                                    Next <ArrowRight size={16} />
                                </button>
                            ) : (
                                <button 
                                    onClick={handleSubmit}
                                    className="bg-gradient-to-r from-solana-purple to-solana-green text-white px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(20,241,149,0.3)] hover:scale-105 transition-transform flex items-center gap-2"
                                >
                                    Launch Token <Check size={16} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CreateBusinessModal;
