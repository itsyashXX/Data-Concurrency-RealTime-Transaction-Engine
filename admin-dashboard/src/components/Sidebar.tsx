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
  ChevronRight
} from 'lucide-react';

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
    <aside className="w-64 bg-obsidian-950 border-r border-white/[0.06] flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/[0.06] flex items-center space-x-3.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyber-cyan flex items-center justify-center text-white shadow-glow-brand shrink-0">
          <Zap className="w-5 h-5 text-white fill-white" />
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center space-x-1.5">
            <h1 className="font-bold text-base text-white tracking-tight">DataCore</h1>
            <span className="text-[9px] font-mono px-1 py-0.2 bg-brand-500/20 text-brand-300 rounded font-semibold border border-brand-500/30">
              PRO
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Fintech Engine v2.4</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-widest">
          Engine Observability
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-300 font-semibold border border-brand-500/30 shadow-inner-light before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-brand-500 before:rounded-r'
                    : item.highlight
                    ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/15'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-850'
                }`
              }
            >
              <Icon className={`w-4 h-4 shrink-0 ${item.highlight ? 'text-cyber-cyan' : ''}`} />
              <span className="truncate">{item.label}</span>
              {item.highlight && (
                <span className="ml-auto text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase border border-cyan-500/30">
                  Live
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-4 border-t border-white/[0.06] bg-obsidian-900/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-300 font-bold text-xs shrink-0 font-mono">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Operator</p>
              <p className="text-xs font-medium text-slate-200 truncate">{userEmail || 'admin@datacore.io'}</p>
            </div>
          </div>
          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded">
            ADMIN
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/[0.06] hover:border-rose-500/30 rounded-xl transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Disconnect Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
