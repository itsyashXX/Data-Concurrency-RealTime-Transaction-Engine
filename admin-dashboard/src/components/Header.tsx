import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, Activity, Smartphone, Clock } from 'lucide-react';
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
    <header className="h-16 border-b border-slate-200/90 bg-white/90 backdrop-blur-md px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center space-x-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
            <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>LIVE</span>
            </div>
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-500 font-medium tracking-normal mt-0.5 flex items-center space-x-1.5">
              <span>{subtitle}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700 font-mono text-[10px] flex items-center gap-1 font-semibold">
                <Clock className="w-2.5 h-2.5 text-slate-400" />
                {time}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2.5 md:space-x-3">
        {/* PostgreSQL Database Status Badge */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="hidden md:flex items-center space-x-2 px-3 py-1 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-full text-xs text-slate-700 shadow-sm transition-all"
        >
          <Database className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-slate-500 font-medium">PostgreSQL:</span>
          <span className="flex items-center text-emerald-700 font-semibold font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
            Authoritative
          </span>
        </motion.div>

        {/* Engine Security Badge */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-full text-xs text-slate-700 shadow-sm transition-all"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-slate-500 font-medium">Double-Entry:</span>
          <span className="text-indigo-700 font-semibold font-mono text-[11px]">Protected</span>
        </motion.div>

        {/* Feed Active Pulse */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600 shadow-sm">
          <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span className="font-mono text-[11px] text-slate-600 font-medium">Sync: 4s</span>
        </div>

        {/* Direct Link to Live Customer Simulator */}
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Link
            to="/customer-app"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm shadow-indigo-200 hover:shadow-indigo-300"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Launch Wallet</span>
          </Link>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
