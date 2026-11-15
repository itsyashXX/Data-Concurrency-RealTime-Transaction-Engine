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
  Smartphone,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
              <div className="p-2 rounded-xl bg-brand-500/15 text-aurora-cyan border border-aurora-cyan/30 shadow-neon-cyan/20 shadow-sm">
                <UsersIcon className="w-5 h-5" />
              </div>
              <span>User & Account Management</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-aurora-mint/15 text-aurora-mint border border-aurora-mint/35 flex items-center shadow-neon-mint/20 shadow-sm">
              <span className="relative flex h-2 w-2 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aurora-mint opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-aurora-mint"></span>
              </span>
              <span>4s Auto-Sync</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Customer identities, associated double-entry ledger accounts, real-time balances, UPI IDs, and transaction activity.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-aurora-cyan" />
            <span>Synced: {lastUpdated.toLocaleTimeString()}</span>
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchUsers(true)}
            className="p-2.5 bg-void-900 hover:bg-void-850 text-slate-200 rounded-xl border border-white/[0.08] transition-colors shadow-sm"
            title="Refresh user database"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-aurora-cyan' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-void-900/90 border border-white/[0.08] hover:border-brand-500/40 rounded-3xl p-5 flex items-center justify-between shadow-xl backdrop-blur-xl transition-all"
        >
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Total Registered Users
            </span>
            <div className="text-3xl font-black text-white font-mono mt-1">{users.length}</div>
            <span className="text-[11px] text-aurora-mint flex items-center gap-1.5 mt-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-aurora-mint animate-pulse"></span>
              All identities synced
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-500/15 text-brand-300 border border-brand-500/30 flex items-center justify-center shadow-neon-violet/20">
            <UsersIcon className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="bg-void-900/90 border border-white/[0.08] hover:border-aurora-cyan/40 rounded-3xl p-5 flex items-center justify-between shadow-xl backdrop-blur-xl transition-all"
        >
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Active Ledger Wallets
            </span>
            <div className="text-3xl font-black text-aurora-cyan font-mono mt-1">{totalAccounts}</div>
            <span className="text-[11px] text-aurora-cyan mt-1 block font-medium">Double-entry verified</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-aurora-cyan/15 text-aurora-cyan border border-aurora-cyan/30 flex items-center justify-center shadow-neon-cyan/20">
            <Wallet className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="bg-void-900/90 border border-white/[0.08] hover:border-aurora-mint/40 rounded-3xl p-5 flex items-center justify-between shadow-xl backdrop-blur-xl transition-all"
        >
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Total System Liquidity Pool
            </span>
            <div className="text-3xl font-black text-aurora-mint font-mono mt-1">
              ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Authoritative balance pool</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-aurora-mint/15 text-aurora-mint border border-aurora-mint/30 flex items-center justify-center shadow-neon-mint/20">
            <CreditCard className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-void-900/85 border border-white/[0.08] p-3.5 rounded-2xl shadow-xl backdrop-blur-xl">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, UPI ID (e.g. alice@dc), or account..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-void-950 border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aurora-cyan font-mono transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400 font-mono">Role:</span>
          {(['ALL', 'USER', 'ADMIN'] as const).map((r) => (
            <motion.button
              key={r}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-xs rounded-xl font-mono font-bold transition-all ${
                roleFilter === r
                  ? 'bg-gradient-to-r from-brand-600/30 to-aurora-cyan/25 text-white border border-aurora-cyan/50 shadow-neon-cyan/20'
                  : 'bg-void-950 border border-white/[0.06] text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-void-900/90 border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-void-950/80 border-b border-white/[0.06] text-slate-400 uppercase tracking-wider font-mono text-[11px]">
              <tr>
                <th className="px-5 py-4 font-bold">User Identity</th>
                <th className="px-5 py-4 font-bold">Role</th>
                <th className="px-5 py-4 font-bold">Associated Account(s) & UPI ID</th>
                <th className="px-5 py-4 font-bold">Operations</th>
                <th className="px-5 py-4 font-bold">Registration Date</th>
                <th className="px-5 py-4 font-bold">Engine Status</th>
                <th className="px-5 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-slate-200">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-slate-400">
                    <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-3 text-aurora-cyan" />
                    <span className="font-mono text-xs">Loading registered customer identities...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-slate-400">
                    <UsersIcon className="w-8 h-8 mx-auto mb-2.5 text-slate-600" />
                    <p className="font-bold text-white text-sm">No matching accounts found</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {searchQuery ? 'Try clearing your search query.' : 'Create an account in the Customer Mobile App to see it here live.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <motion.tr
                    key={u.id}
                    whileHover={{ backgroundColor: 'rgba(21, 21, 44, 0.45)' }}
                    className="transition-colors"
                  >
                    {/* User Profile */}
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-600/40 via-indigo-600/30 to-aurora-cyan/40 border border-aurora-cyan/30 flex items-center justify-center font-bold text-white text-xs font-mono shrink-0 shadow-neon-cyan/20">
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
                            ? 'bg-aurora-violet/15 text-aurora-violet border-aurora-violet/30 shadow-sm'
                            : 'bg-aurora-cyan/15 text-aurora-cyan border-aurora-cyan/30 shadow-sm'
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
                              className="p-2.5 bg-void-950/80 border border-white/[0.07] hover:border-aurora-cyan/30 rounded-xl flex flex-wrap items-center gap-2 transition-all"
                            >
                              <div className="flex items-center space-x-1.5 text-slate-300">
                                <CreditCard className="w-3.5 h-3.5 text-aurora-cyan shrink-0" />
                                <span className="font-mono text-xs font-medium">{acc.account_number}</span>
                              </div>

                              {acc.upi_id && (
                                <motion.button
                                  whileTap={{ scale: 0.92 }}
                                  type="button"
                                  onClick={() => handleCopyUpi(acc.upi_id!)}
                                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-aurora-mint/15 text-aurora-mint border border-aurora-mint/30 text-[10px] font-mono hover:bg-aurora-mint/25 transition-all shadow-sm"
                                  title="Click to copy UPI ID"
                                >
                                  <span>{acc.upi_id}</span>
                                  {copiedUpi === acc.upi_id ? (
                                    <Check className="w-2.5 h-2.5 text-aurora-mint animate-bounce" />
                                  ) : (
                                    <Copy className="w-2.5 h-2.5 text-slate-400" />
                                  )}
                                </motion.button>
                              )}

                              <span className="font-bold text-aurora-mint font-mono ml-auto text-sm">
                                ₹{parseFloat(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>

                              {acc.version !== undefined && (
                                <span
                                  className="text-[9px] font-mono text-slate-400 bg-void-900 px-1.5 py-0.5 rounded border border-white/[0.08]"
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
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-aurora-mint/15 text-aurora-mint border border-aurora-mint/30 shadow-sm">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aurora-mint opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-aurora-mint"></span>
                        </span>
                        <span>Active</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenWalletForUser(u)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-void-950 hover:bg-aurora-cyan/15 text-slate-300 hover:text-aurora-cyan border border-white/[0.08] hover:border-aurora-cyan/40 text-[11px] font-mono transition-all shadow-sm"
                        title="Open Customer Simulator for this user"
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>Wallet</span>
                      </motion.button>
                    </td>
                  </motion.tr>
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
