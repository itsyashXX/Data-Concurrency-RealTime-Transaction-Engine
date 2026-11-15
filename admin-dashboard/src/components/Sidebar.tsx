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
  Smartphone
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
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-tight">DataCore</h1>
          <p className="text-xs text-brand-400 font-medium">Engine Admin v1.0</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Observability
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600/15 text-brand-400 border border-brand-500/30'
                    : item.highlight
                    ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`
              }
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${item.highlight ? 'text-blue-400' : ''}`} />
              <span>{item.label}</span>
              {item.highlight && (
                <span className="ml-auto text-[9px] bg-blue-500/25 text-blue-300 px-1.5 py-0.5 rounded font-mono uppercase font-bold tracking-wider">
                  Live
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Session */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between mb-3">
          <div className="overflow-hidden">
            <p className="text-xs text-slate-400">Authenticated as</p>
            <p className="text-xs font-medium text-slate-200 truncate">{userEmail || 'Admin'}</p>
          </div>
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
            ADMIN
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
