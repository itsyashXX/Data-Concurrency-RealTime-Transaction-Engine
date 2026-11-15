import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, Activity, Smartphone, Clock, Menu, X, Maximize2, Minimize2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onToggleSidebar,
  isSidebarOpen = false,
}) => {
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header className="h-16 3xl:h-20 border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-3.5 sm:px-6 md:px-8 3xl:px-12 flex items-center justify-between sticky top-0 z-30 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center space-x-2.5 sm:space-x-3.5">
        {/* Mobile Hamburger Drawer Toggle */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="Toggle navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5 text-indigo-600" /> : <Menu className="w-5 h-5 text-slate-700" />}
          </button>
        )}

        <div>
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            <h2 className="text-sm sm:text-base md:text-lg 3xl:text-xl font-bold text-slate-900 tracking-tight truncate max-w-[190px] sm:max-w-none">
              {title}
            </h2>
            <div className="inline-flex items-center space-x-1 sm:space-x-1.5 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>LIVE</span>
            </div>
          </div>
          {subtitle && (
            <p className="hidden xs:flex text-[11px] text-slate-500 font-medium tracking-normal mt-0.5 items-center space-x-1.5">
              <span className="truncate max-w-[220px] sm:max-w-none">{subtitle}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700 font-mono text-[10px] flex items-center gap-1 font-semibold">
                <Clock className="w-2.5 h-2.5 text-slate-400" />
                {time}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-2.5 md:space-x-3">
        {/* Smart TV / NOC Big-Screen Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all shadow-sm"
          title="Toggle Fullscreen / TV NOC Mode"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-indigo-600" /> : <Maximize2 className="w-3.5 h-3.5 text-slate-500" />}
          <span className="hidden lg:inline">{isFullscreen ? 'Exit TV Mode' : 'TV / NOC Mode'}</span>
        </button>

        {/* PostgreSQL Database Status Badge (Desktop / TV) */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="hidden xl:flex items-center space-x-2 px-3 py-1 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-full text-xs text-slate-700 shadow-sm transition-all"
        >
          <Database className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-slate-500 font-medium">PostgreSQL:</span>
          <span className="flex items-center text-emerald-700 font-semibold font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
            Authoritative
          </span>
        </motion.div>

        {/* Engine Security Badge (Large Desktop / TV) */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="hidden 2xl:flex items-center space-x-2 px-3 py-1 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-full text-xs text-slate-700 shadow-sm transition-all"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-slate-500 font-medium">Double-Entry:</span>
          <span className="text-indigo-700 font-semibold font-mono text-[11px]">Protected</span>
        </motion.div>

        {/* Feed Active Pulse (Tablet / Desktop / TV) */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600 shadow-sm">
          <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span className="font-mono text-[11px] text-slate-600 font-medium">Sync: 4s</span>
        </div>

        {/* Direct Link to Live Customer Simulator (All devices) */}
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Link
            to="/customer-app"
            className="flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-mono font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm shadow-indigo-200"
          >
            <Smartphone className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span>Wallet</span>
          </Link>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
