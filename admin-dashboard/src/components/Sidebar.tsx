import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Cpu,
  FlaskConical,
  CopyX,
  Scale,
  Users,
  ShieldAlert,
  LogOut,
  Zap,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  userEmail?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ userEmail }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('datacore_admin_token');
    localStorage.removeItem('datacore_admin_user');
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/transactions', label: 'Live Transactions', icon: ArrowLeftRight },
    { to: '/concurrency', label: 'Concurrency Monitor', icon: Cpu },
    { to: '/race-lab', label: 'Race-Condition Lab', icon: FlaskConical },
    { to: '/duplicates', label: 'Duplicate Detection', icon: CopyX },
    { to: '/consistency', label: 'Consistency Ledger', icon: Scale },
    { to: '/users', label: 'User Management', icon: Users },
    { to: '/audit-logs', label: 'Audit Trail', icon: ShieldAlert },
    { to: '/customer-app', label: 'Customer Mobile App', icon: Smartphone, highlight: true },
  ];

  return (
    <aside className="w-64 bg-void-950/95 border-r border-white/[0.08] flex flex-col h-screen sticky top-0 shrink-0 select-none backdrop-blur-2xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/[0.08] flex items-center space-x-3.5">
        <motion.div
          whileHover={{ rotate: 180, scale: 1.1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="w-9 h-9 rounded-xl bg-gradient-to-tr from-aurora-cyan via-brand-500 to-aurora-fuchsia flex items-center justify-center text-white shadow-neon-cyan shrink-0 cursor-pointer"
        >
          <Zap className="w-5 h-5 text-white fill-white" />
        </motion.div>
        <div className="overflow-hidden">
          <div className="flex items-center space-x-1.5">
            <h1 className="font-black text-base text-white tracking-tight">DataCore</h1>
            <span className="text-[9px] font-mono px-1 py-0.2 bg-gradient-to-r from-aurora-cyan/20 to-brand-500/20 text-aurora-cyan rounded font-bold border border-aurora-cyan/30">
              AURORA
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Fintech Engine v3.0</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
          <span>Platform Observability</span>
          <Sparkles className="w-2.5 h-2.5 text-aurora-cyan animate-pulse" />
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group relative flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600/25 to-aurora-cyan/15 text-white font-semibold border border-aurora-cyan/40 shadow-neon-cyan/20 shadow-sm before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-aurora-cyan before:rounded-r'
                    : item.highlight
                    ? 'text-aurora-cyan bg-aurora-cyan/10 border border-aurora-cyan/25 hover:bg-aurora-cyan/20'
                    : 'text-slate-400 hover:text-white hover:bg-void-850 hover:border-white/[0.06] border border-transparent'
                }`
              }
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${item.highlight ? 'text-aurora-cyan' : ''}`} />
              <span className="truncate">{item.label}</span>
              {item.highlight && (
                <span className="ml-auto flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/40 shadow-neon-cyan/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-aurora-cyan animate-pulse"></span>
                  <span>LIVE</span>
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-4 border-t border-white/[0.08] bg-void-900/60 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-aurora-cyan p-[1px] shrink-0">
              <div className="w-full h-full bg-void-950 rounded-lg flex items-center justify-center text-aurora-cyan font-bold text-xs font-mono">
                AD
              </div>
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Active Operator</p>
              <p className="text-xs font-medium text-slate-200 truncate">{userEmail || 'admin@datacore.io'}</p>
            </div>
          </div>
          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-aurora-mint/15 text-aurora-mint border border-aurora-mint/30 rounded shadow-sm">
            ROOT
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-aurora-pink hover:bg-aurora-pink/10 border border-white/[0.08] hover:border-aurora-pink/30 rounded-xl transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Disconnect Session</span>
        </motion.button>
      </div>
    </aside>
  );
};

export default Sidebar;
