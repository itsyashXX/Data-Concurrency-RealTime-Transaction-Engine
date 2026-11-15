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
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

export const Users: React.FC = () => {
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
    // Auto-poll every 4 seconds so accounts created in the mobile app appear live
    const interval = setInterval(() => fetchUsers(false), 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyUpi = (upi: string) => {
    navigator.clipboard.writeText(upi);
    setCopiedUpi(upi);
    setTimeout(() => setCopiedUpi(null), 2000);
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
      {/* Top action / status bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
              <UsersIcon className="w-5 h-5 text-brand-400" />
              <span>User & Account Management</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1"></span>
              Live Sync (4s)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registered customer accounts, associated ledger accounts, test balances, UPI IDs, and real-time transaction volume
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-[11px] text-slate-500">
            Synced: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={() => fetchUsers(true)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Refresh users list"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Total Registered Users
            </span>
            <div className="text-2xl font-bold text-slate-100 mt-0.5">{users.length}</div>
            <span className="text-[10px] text-emerald-400">All authenticated identities</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center">
            <UsersIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Active Ledger Accounts
            </span>
            <div className="text-2xl font-bold text-slate-100 mt-0.5">{totalAccounts}</div>
            <span className="text-[10px] text-brand-400">Double-entry verified wallets</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Total System Balances
            </span>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-0.5">
              ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-500">Authoritative balance pool</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, UPI ID, or account..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400">Role:</span>
          {(['ALL', 'USER', 'ADMIN'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                roleFilter === r
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono">
              <tr>
                <th className="px-5 py-3.5 font-semibold">User</th>
                <th className="px-5 py-3.5 font-semibold">Role</th>
                <th className="px-5 py-3.5 font-semibold">Associated Account(s) & UPI ID</th>
                <th className="px-5 py-3.5 font-semibold">Transactions</th>
                <th className="px-5 py-3.5 font-semibold">Date Joined</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-400" />
                    <span>Loading registered accounts...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <UsersIcon className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                    <p className="font-semibold text-slate-300">No users found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchQuery ? 'Try clearing your search query.' : 'Create an account in the Customer Mobile App to see it here.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* User Profile */}
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600/40 to-indigo-600/40 border border-brand-500/30 flex items-center justify-center font-bold text-slate-200 text-xs shrink-0">
                          {u.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100 flex items-center space-x-1.5">
                            <span>{u.full_name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span className="font-mono">{u.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : 'bg-brand-500/10 text-brand-400 border-brand-500/20'
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
                              className="p-2 bg-slate-950/80 border border-slate-800/80 rounded-lg flex flex-wrap items-center gap-2"
                            >
                              <div className="flex items-center space-x-1 text-slate-300">
                                <CreditCard className="w-3.5 h-3.5 text-brand-400" />
                                <span className="font-mono text-xs">{acc.account_number}</span>
                              </div>

                              {acc.upi_id && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyUpi(acc.upi_id!)}
                                  className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono hover:bg-emerald-500/20 transition-colors"
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
                                <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1 py-0.5 rounded border border-slate-800" title="Optimistic Locking Version">
                                  v{acc.version}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">No active accounts</span>
                      )}
                    </td>

                    {/* Total Transactions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-1 font-bold text-slate-100">
                        <span>{u.total_transactions ?? 0}</span>
                        <span className="text-[10px] font-normal text-slate-500">ops</span>
                      </div>
                    </td>

                    {/* Date Joined */}
                    <td className="px-5 py-4 text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{new Date(u.date_joined).toLocaleDateString()}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {new Date(u.date_joined).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Active</span>
                      </span>
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
