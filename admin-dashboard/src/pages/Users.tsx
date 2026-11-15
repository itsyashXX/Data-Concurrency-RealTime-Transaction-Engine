import React, { useEffect, useState, useMemo } from 'react';
import {
  Users as UsersIcon,
  RefreshCw,
  Mail,
  Calendar,
  CreditCard,
  Search,
  Wallet,
  Copy,
  Check,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    localStorage.setItem('datacore_user_email', user.email);
    localStorage.setItem('datacore_customer_email', user.email);
    if (user.accounts && user.accounts.length > 0) {
      localStorage.setItem('datacore_customer_account', user.accounts[0].account_number);
      if (user.accounts[0].upi_id) {
        localStorage.setItem('datacore_customer_upi', user.accounts[0].upi_id);
      }
    }
    navigate('/customer-app');
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;

      // Search term
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchName = u.full_name?.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchAccount = u.accounts?.some(
        (a) => a.account_number.toLowerCase().includes(q) || (a.upi_id && a.upi_id.toLowerCase().includes(q))
      );
      return matchName || matchEmail || matchAccount;
    });
  }, [users, roleFilter, searchQuery]);

  // Total balance aggregation
  const totalBalance = useMemo(() => {
    return users.reduce((sum, u) => {
      const uSum = (u.accounts || []).reduce((accSum, a) => accSum + parseFloat(a.balance || '0'), 0);
      return sum + uSum;
    }, 0);
  }, [users]);

  const totalAccounts = useMemo(() => {
    return users.reduce((sum, u) => sum + (u.accounts?.length || 0), 0);
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Page Title & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                <UsersIcon className="w-5 h-5" />
              </div>
              <span>Customer Identities & Ledger Accounts</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
              Live Synced (4s)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Customer identities, associated double-entry ledger accounts, real-time balances, UPI IDs, and transaction activity.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>Synced: {lastUpdated.toLocaleTimeString()}</span>
          </span>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => fetchUsers(true)}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors shadow-sm"
            title="Refresh user database"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white border border-slate-200/90 hover:border-indigo-200 rounded-3xl p-5 flex items-center justify-between shadow-sm transition-all"
        >
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
              Total Registered Users
            </span>
            <div className="text-3xl font-black text-slate-900 font-mono mt-1">{users.length}</div>
            <span className="text-[11px] text-emerald-700 flex items-center gap-1.5 mt-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              All identities synced
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center">
            <UsersIcon className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white border border-slate-200/90 hover:border-sky-200 rounded-3xl p-5 flex items-center justify-between shadow-sm transition-all"
        >
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
              Active Ledger Wallets
            </span>
            <div className="text-3xl font-black text-sky-800 font-mono mt-1">{totalAccounts}</div>
            <span className="text-[11px] text-sky-600 mt-1 block font-medium">Double-entry verified</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white border border-slate-200/90 hover:border-emerald-200 rounded-3xl p-5 flex items-center justify-between shadow-sm transition-all"
        >
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
              Total System Liquidity Pool
            </span>
            <div className="text-3xl font-black text-emerald-700 font-mono mt-1">
              ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Authoritative balance pool</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white border border-slate-200/90 p-3.5 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, UPI ID (e.g. alice@dc), or account..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500 font-mono">Role:</span>
          {(['ALL', 'USER', 'ADMIN'] as const).map((r) => (
            <motion.button
              key={r}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-xs rounded-xl font-mono font-bold transition-all ${
                roleFilter === r
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {r}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-mono text-[11px]">
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
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-slate-500">
                    <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-3 text-indigo-600" />
                    <span className="font-mono text-xs">Loading registered customer identities...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-slate-500">
                    <UsersIcon className="w-8 h-8 mx-auto mb-2.5 text-slate-400" />
                    <p className="font-bold text-slate-800 text-sm">No matching accounts found</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {searchQuery ? 'Try clearing your search query.' : 'Create an account in the Customer Mobile App to see it here live.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* User Profile */}
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-xs font-mono shrink-0">
                          {u.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 tracking-tight">{u.full_name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center space-x-1.5 mt-0.5 font-mono">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
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
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-sky-50 text-sky-700 border-sky-200'
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
                              className="p-2.5 bg-slate-50 border border-slate-200/80 hover:border-slate-300 rounded-xl flex flex-wrap items-center gap-2 transition-all"
                            >
                              <div className="flex items-center space-x-1.5 text-slate-700">
                                <CreditCard className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span className="font-mono text-xs font-medium">{acc.account_number}</span>
                              </div>

                              {acc.upi_id && (
                                <motion.button
                                  whileTap={{ scale: 0.94 }}
                                  type="button"
                                  onClick={() => handleCopyUpi(acc.upi_id!)}
                                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono hover:bg-emerald-100 transition-all shadow-sm"
                                  title="Click to copy UPI ID"
                                >
                                  <span>{acc.upi_id}</span>
                                  {copiedUpi === acc.upi_id ? (
                                    <Check className="w-2.5 h-2.5 text-emerald-700 animate-bounce" />
                                  ) : (
                                    <Copy className="w-2.5 h-2.5 text-slate-400" />
                                  )}
                                </motion.button>
                              )}

                              <span className="font-bold text-emerald-700 font-mono ml-auto text-sm">
                                ₹{parseFloat(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>

                              {acc.version !== undefined && (
                                <span
                                  className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200"
                                  title="Optimistic Locking Version"
                                >
                                  v{acc.version}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px] font-mono">No active accounts</span>
                      )}
                    </td>

                    {/* Total Transactions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-1.5 font-bold text-slate-800 font-mono">
                        <span className="text-sm">{u.total_transactions ?? 0}</span>
                        <span className="text-[10px] font-normal text-slate-500">ops</span>
                      </div>
                    </td>

                    {/* Date Joined */}
                    <td className="px-5 py-4 text-slate-600">
                      <div className="flex items-center space-x-1.5 font-mono text-xs">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{new Date(u.date_joined).toLocaleDateString()}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                        {new Date(u.date_joined).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
                        </span>
                        <span>Active</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleOpenWalletForUser(u)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 text-[11px] font-mono transition-all shadow-sm"
                        title="Open Customer Simulator for this user"
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>Wallet</span>
                      </motion.button>
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
