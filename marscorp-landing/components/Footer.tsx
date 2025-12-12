import React from 'react';
import { Twitter, Github, Disc } from 'lucide-react';

interface FooterProps {
  onLinkClick?: () => void;
}

const Footer = ({ onLinkClick }: FooterProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLinkClick) onLinkClick();
  };

  return (
    <footer className="bg-surface border-t border-border pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <h3 className="font-bold text-xl mb-4">MarsCorp</h3>
            <p className="text-text-secondary max-w-sm">
              The first on-chain civilization economy. Built on Solana for sub-second finality.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Ecosystem</h4>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li><button onClick={handleClick} className="hover:text-solana-green text-left transition-colors">Explorer</button></li>
              <li><button onClick={handleClick} className="hover:text-solana-green text-left transition-colors">Governance</button></li>
              <li><button onClick={handleClick} className="hover:text-solana-green text-left transition-colors">Documentation</button></li>
              <li><button onClick={handleClick} className="hover:text-solana-green text-left transition-colors">Brand Assets</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <Github size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <Disc size={18} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-text-secondary">
          <p>© 2024 MarsCorp Industries. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;