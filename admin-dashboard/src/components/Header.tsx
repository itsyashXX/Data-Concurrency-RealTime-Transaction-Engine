import React from 'react';
import { Database, ShieldCheck, Activity, Gauge, Smartphone, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="h-16 border-b border-white/[0.06] bg-obsidian-950/75 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-base font-bold text-slate-100 tracking-tight">{title}</h2>
            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono">ONLINE</span>
            </span>
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-400 font-medium tracking-normal mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* PostgreSQL Database Status Badge */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-obsidian-900/90 border border-slate-800 rounded-full text-xs text-slate-300 shadow-sm">
          <Database className="w-3.5 h-3.5 text-cyber-cyan" />
          <span className="text-slate-400">PostgreSQL:</span>
          <span className="flex items-center text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1"></span>
            Authoritative
          </span>
        </div>

        {/* Engine Security Badge */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-obsidian-900/90 border border-slate-800 rounded-full text-xs text-slate-300 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-slate-400">Double-Entry:</span>
          <span className="text-emerald-400 font-medium">Protected</span>
        </div>

        {/* Real-time Indicator */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-obsidian-900/90 border border-slate-800 rounded-full text-xs text-slate-300">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] text-slate-300">Feed Active</span>
        </div>

        {/* Direct Link to Live Customer Simulator */}
        <Link
          to="/customer-app"
          className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-glow-brand"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Launch Wallet</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
