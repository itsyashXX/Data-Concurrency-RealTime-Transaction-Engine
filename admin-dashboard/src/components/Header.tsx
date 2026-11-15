import React from 'react';
import { Database, ShieldCheck, Activity } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4">
        {/* PostgreSQL Database Status Badge */}
        <div className="flex items-center space-x-2 px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-full text-xs text-slate-300">
          <Database className="w-3.5 h-3.5 text-brand-400" />
          <span>PostgreSQL:</span>
          <span className="flex items-center text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1"></span>
            Authoritative
          </span>
        </div>

        {/* Engine Security Badge */}
        <div className="flex items-center space-x-2 px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-full text-xs text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Double-Entry Ledger:</span>
          <span className="text-emerald-400 font-medium">Protected</span>
        </div>

        {/* Real-time Indicator */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-400">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Live Feed</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
