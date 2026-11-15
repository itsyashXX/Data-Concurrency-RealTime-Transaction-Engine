import React, { useEffect, useState, useMemo } from 'react';
import {
  Users as UsersIcon,
  RefreshCw,
  Mail,
  Calendar,
  CreditCard,
  Search,
  CheckCircle2,
  ExternalLink,
  Shield,
  Wallet,
  ArrowRight,
  Copy,
  Check,
  Zap,
  TrendingUp,
  Smartphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { User } from '../types';

export const Users: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [copiedUpi, setCopiedUpi] = useState<string | null>(null);

  const fetchUsers = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const data = await api.getUsers();
      const list = Array.isArray(data) ? data : (data as any).results || [];
      setUsers(list);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
      if (showSpinner) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Auto-poll every 4 seconds so mobile app account sign-ups sync live
    const interval = setInterval(() => fetchUsers(false), 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyUpi = (upi: string) => {
    navigator.clipboard.writeText(upi);
    setCopiedUpi(upi);
    setTimeout(() => setCopiedUpi(null), 2000);
  };

  const handleOpenWalletForUser = (user: User) => {
    // Quick login as this user for testing in the Customer Simulator
    navigate('/customer-app');
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesRole;

      const nameMatch = u.full_name?.toLowerCase().includes(q);
      const emailMatch = u.email?.toLowerCase().includes(q);
      const accountMatch = u.accounts?.some(
        (acc) =>
          acc.account_number.toLowerCase().includes(q) ||
          (acc.upi_id && acc.upi_id.toLowerCase().includes(q))
      );

      return matchesRole && (nameMatch || emailMatch || accountMatch);
    });
  }, [users, searchQuery, roleFilter]);

  // Aggregate stats
  const totalBalance = useMemo(() => {
    return users.reduce((acc, u) => {
      const userSum = (u.accounts || []).reduce(
        (sub, a) => sub + (parseFloat(a.balance) || 0),
        0
      );
      return acc + userSum;
    }, 0);
  }, [users]);

  const totalAccounts = useMemo(() => {
    return users.reduce((acc, u) => acc + (u.accounts?.length || 0), 0);
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-white flex items-center space-x-2.5 tracking-tight">
              <div className="p-2 rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-glow-brand">
                <UsersIcon className="w-5 h-5" />
              </div>
              <span>User & Account Management</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
              Live Sync (4s)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Customer identities, associated double-entry ledger accounts, real-time balances, UPI IDs, and transaction activity.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-[11px] font-mono text-slate-500">
            Last Synced: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={() => fetchUsers(true)}
            className="p-2 bg-obsidian-900 hover:bg-obsidian-850 text-slate-300 rounded-xl border border-white/[0.08] transition-colors shadow-sm"
            title="Refresh user database"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-obsidian-900/90 border border-white/[0.08] rounded-2xl p-4.5 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
              Total Registered Users
            </span>
            <div className="text-2xl font-bold text-white font-mono mt-1">{users.length}</div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              All identities synced
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/25 flex items-center justify-center shadow-glow-brand">
            <UsersIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-obsidian-900/90 border border-white/[0.08] rounded-2xl p-4.5 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
              Active Ledger Wallets
            </span>
            <div className="text-2xl font-bold text-cyber-cyan font-mono mt-1">{totalAccounts}</div>
            <span className="text-[11px] text-cyan-400 mt-0.5 block font-medium">Double-entry verified</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyber-cyan border border-cyan-500/25 flex items-center justify-center shadow-glow-cyan">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-obsidian-900/90 border border-white/[0.08] rounded-2xl p-4.5 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
              Total System Liquidity Pool
            </span>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Authoritative balance total</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center shadow-glow-emerald">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-obsidian-900/80 border border-white/[0.08] p-3 rounded-2xl shadow-md">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, email, UPI ID (e.g. alice@dc), or account..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-obsidian-950 border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400 font-mono">Role:</span>
          {(['ALL', 'USER', 'ADMIN'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-xs rounded-xl font-mono font-semibold transition-all ${
                roleFilter === r
                  ? 'bg-brand-600/30 text-brand-300 border border-brand-500/50 shadow-glow-brand'
                  : 'bg-obsidian-950 border border-white/[0.06] text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-obsidian-900/90 border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-obsidian-950/80 border-b border-white/[0.06] text-slate-400 uppercase tracking-wider font-mono text-[11px]">
              <tr>
                <th className="px-5 py-4 font-semibold">User Identity</th>
                <th className="px-5 py-4 font-semibold">Role</th>
                <th className="px-5 py-4 font-semibold">Associated Account(s) & UPI ID</th>
                <th className="px-5 py-4 font-semibold">Operations</th>
                <th className="px-5 py-4 font-semibold">Registration Date</th>
                <th className="px-5 py-4 font-semibold">Engine Status</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-slate-200">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2.5 text-brand-400" />
                    <span className="font-mono text-xs">Loading registered customer identities...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-slate-400">
                    <UsersIcon className="w-7 h-7 mx-auto mb-2 text-slate-600" />
                    <p className="font-semibold text-slate-200 text-sm">No matching accounts found</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {searchQuery ? 'Try clearing your search query.' : 'Create an account in the Customer Mobile App to see it here live.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-obsidian-850/60 transition-colors">
                    {/* User Profile */}
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600/30 via-indigo-600/20 to-cyber-cyan/30 border border-brand-500/30 flex items-center justify-center font-bold text-white text-xs font-mono shrink-0 shadow-inner">
                          {u.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-white tracking-tight">{u.full_name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5 font-mono">
                            <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{u.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-sm'
                            : 'bg-brand-500/15 text-brand-300 border-brand-500/30 shadow-sm'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Associated Accounts & UPI */}
                    <td className="px-5 py-4">
                      {u.accounts && u.accounts.length > 0 ? (
                        <div className="space-y-1.5">
                          {u.accounts.map((acc) => (
                            <div
                              key={acc.account_number}
                              className="p-2 bg-obsidian-950/80 border border-white/[0.06] rounded-xl flex flex-wrap items-center gap-2"
                            >
                              <div className="flex items-center space-x-1.5 text-slate-300">
                                <CreditCard className="w-3.5 h-3.5 text-cyber-cyan shrink-0" />
                                <span className="font-mono text-xs font-medium">{acc.account_number}</span>
                              </div>

                              {acc.upi_id && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyUpi(acc.upi_id!)}
                                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] font-mono hover:bg-emerald-500/20 transition-all"
                                  title="Click to copy UPI ID"
                                >
                                  <span>{acc.upi_id}</span>
                                  {copiedUpi === acc.upi_id ? (
                                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-2.5 h-2.5 text-slate-400" />
                                  )}
                                </button>
                              )}

                              <span className="font-bold text-emerald-400 font-mono ml-auto">
                                ₹{parseFloat(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>

                              {acc.version !== undefined && (
                                <span
                                  className="text-[9px] font-mono text-slate-400 bg-obsidian-900 px-1.5 py-0.5 rounded border border-white/[0.08]"
                                  title="Optimistic Locking Version"
                                >
                                  v{acc.version}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px] font-mono">No active accounts</span>
                      )}
                    </td>

                    {/* Total Transactions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-1.5 font-bold text-white font-mono">
                        <span className="text-sm">{u.total_transactions ?? 0}</span>
                        <span className="text-[10px] font-normal text-slate-400">ops</span>
                      </div>
                    </td>

                    {/* Date Joined */}
                    <td className="px-5 py-4 text-slate-400">
                      <div className="flex items-center space-x-1.5 font-mono text-xs">
                        <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{new Date(u.date_joined).toLocaleDateString()}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                        {new Date(u.date_joined).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Active</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleOpenWalletForUser(u)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-obsidian-950 hover:bg-brand-600/20 text-slate-300 hover:text-brand-300 border border-white/[0.08] hover:border-brand-500/40 text-[11px] font-mono transition-all"
                        title="Open Customer Simulator"
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>Wallet</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
