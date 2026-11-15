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
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 select-none shadow-[1px_0_3px_rgba(0,0,0,0.02)]">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 flex items-center space-x-3.5">
        <motion.div
          whileHover={{ rotate: 180, scale: 1.08 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0 cursor-pointer"
        >
          <Zap className="w-5 h-5 text-white fill-white" />
        </motion.div>
        <div className="overflow-hidden">
          <div className="flex items-center space-x-1.5">
            <h1 className="font-extrabold text-base text-slate-900 tracking-tight">DataCore</h1>
            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded font-bold border border-indigo-200">
              CORE v3.0
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase font-medium">Fintech Engine</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
          <span>Platform Observability</span>
          <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group relative flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/90 shadow-sm before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-indigo-600 before:rounded-r'
                    : item.highlight
                    ? 'text-indigo-700 bg-indigo-50/70 border border-indigo-200/70 hover:bg-indigo-100/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                }`
              }
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${item.highlight ? 'text-indigo-600' : ''}`} />
              <span className="truncate">{item.label}</span>
              {item.highlight && (
                <span className="ml-auto flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>LIVE</span>
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs font-mono shrink-0">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold">Active Operator</p>
              <p className="text-xs font-semibold text-slate-800 truncate">{userEmail || 'admin@datacore.io'}</p>
            </div>
          </div>
          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
            ROOT
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Disconnect Session</span>
        </motion.button>
      </div>
    </aside>
  );
};

export default Sidebar;
