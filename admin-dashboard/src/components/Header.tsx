import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, Activity, Smartphone, Zap, Sparkles, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 border-b border-white/[0.08] bg-void-950/80 backdrop-blur-2xl px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 transition-all">
      <div className="flex items-center space-x-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-base md:text-lg font-black text-white tracking-tight">{title}</h2>
            <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-aurora-mint/15 text-aurora-mint border border-aurora-mint/30 shadow-neon-mint/30 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aurora-mint opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-aurora-mint"></span>
              </span>
              <span>LIVE</span>
            </div>
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-400 font-medium tracking-normal mt-0.5 flex items-center space-x-1.5">
              <span>{subtitle}</span>
              <span className="text-slate-600">•</span>
              <span className="text-aurora-cyan font-mono text-[10px] flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {time}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2.5 md:space-x-3">
        {/* PostgreSQL Database Status Badge */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="hidden md:flex items-center space-x-2 px-3 py-1 bg-void-900/90 border border-white/[0.08] hover:border-aurora-cyan/40 rounded-full text-xs text-slate-300 shadow-sm transition-all"
        >
          <Database className="w-3.5 h-3.5 text-aurora-cyan" />
          <span className="text-slate-400">PostgreSQL:</span>
          <span className="flex items-center text-aurora-mint font-semibold font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-aurora-mint animate-pulse mr-1"></span>
            Authoritative
          </span>
        </motion.div>

        {/* Engine Security Badge */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-void-900/90 border border-white/[0.08] hover:border-brand-400/40 rounded-full text-xs text-slate-300 shadow-sm transition-all"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-slate-400">Double-Entry:</span>
          <span className="text-aurora-cyan font-semibold font-mono text-[11px]">Protected</span>
        </motion.div>

        {/* Feed Active Pulse */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-void-900/90 border border-white/[0.08] rounded-full text-xs text-slate-300">
          <Activity className="w-3.5 h-3.5 text-aurora-mint animate-pulse" />
          <span className="font-mono text-[11px] text-slate-300">Sync: 4s</span>
        </div>

        {/* Direct Link to Live Customer Simulator */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/customer-app"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-gradient-to-r from-brand-600 via-indigo-600 to-aurora-cyan text-white transition-all shadow-neon-violet hover:shadow-neon-cyan"
          >
            <Smartphone className="w-3.5 h-3.5 animate-bounce" />
            <span>Launch Wallet</span>
          </Link>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
