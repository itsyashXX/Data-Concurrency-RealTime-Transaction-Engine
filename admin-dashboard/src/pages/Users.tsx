import React, { useEffect, useState } from 'react';
import { Users as UsersIcon, RefreshCw, Mail, Calendar, Shield, CreditCard } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      const list = Array.isArray(data) ? data : (data as any).results || [];
      setUsers(list);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <UsersIcon className="w-6 h-6 text-brand-400" />
            <span>User & Account Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered customer accounts, associated ledger accounts, test balances, and transaction volume
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 font-semibold">User</th>
                <th className="px-5 py-3.5 font-semibold">Role</th>
                <th className="px-5 py-3.5 font-semibold">Associated Account(s)</th>
                <th className="px-5 py-3.5 font-semibold">Transactions</th>
                <th className="px-5 py-3.5 font-semibold">Joined</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-100">{u.full_name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>{u.email}</span>
                    </div>
                  </td>
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
                  <td className="px-5 py-4">
                    {u.accounts && u.accounts.length > 0 ? (
                      u.accounts.map((acc) => (
                        <div key={acc.account_number} className="flex items-center space-x-2">
                          <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-mono text-slate-300">{acc.account_number}</span>
                          <span className="font-bold text-emerald-400">₹{acc.balance}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-500">No active accounts</span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-100">
                    {u.total_transactions ?? 0}
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {new Date(u.date_joined).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
