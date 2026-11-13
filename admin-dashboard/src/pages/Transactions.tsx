import React, { useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Scale
} from 'lucide-react';
import { api } from '../services/api';
import { Transaction } from '../types';

export const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [strategyFilter, setStrategyFilter] = useState<string>('');

  const fetchTransactions = async () => {
    try {
      const data = await api.getTransactions({
        status: statusFilter || undefined,
        strategy: strategyFilter || undefined
      });
      // Handle either array or DRF paginated object
      const list = Array.isArray(data) ? data : data.results || [];
      setTransactions(list);
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 4000);
    return () => clearInterval(interval);
  }, [statusFilter, strategyFilter]);

  const inspectTransaction = async (id: string) => {
    try {
      const detail = await api.getTransactionDetail(id);
      setSelectedTx(detail);
    } catch (err) {
      console.error('Failed to fetch tx detail', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      case 'ROLLED_BACK':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Scale className="w-3 h-3" />
            <span>Rolled Back</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Live Transaction Monitor</h1>
          <p className="text-xs text-slate-400">
            Continuous PostgreSQL transaction events, latencies, and concurrency strategies
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <select
              value={strategyFilter}
              onChange={(e) => setStrategyFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none"
            >
              <option value="">All Strategies</option>
              <option value="PESSIMISTIC">Pessimistic</option>
              <option value="OPTIMISTIC">Optimistic</option>
              <option value="ATOMIC_CONDITIONAL">Atomic Conditional</option>
              <option value="UNSAFE_BASELINE">Unsafe Baseline</option>
            </select>
          </div>

          <button
            onClick={fetchTransactions}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Transaction ID</th>
                <th className="px-5 py-3.5 font-semibold">Sender</th>
                <th className="px-5 py-3.5 font-semibold">Receiver</th>
                <th className="px-5 py-3.5 font-semibold">Amount</th>
                <th className="px-5 py-3.5 font-semibold">Strategy</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Latency</th>
                <th className="px-5 py-3.5 font-semibold">Timestamp</th>
                <th className="px-5 py-3.5 font-semibold text-right">Ledger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-brand-300">
                      {tx.id.substring(0, 8)}...
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium">{tx.sender_account_number}</div>
                      <div className="text-[10px] text-slate-500">{tx.sender_email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium">{tx.receiver_account_number}</div>
                      <div className="text-[10px] text-slate-500">{tx.receiver_email}</div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-100">
                      ₹{tx.amount}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[11px] text-slate-400">
                        {tx.concurrency_strategy}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">{getStatusBadge(tx.status)}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-400">
                      {tx.latency_ms} ms
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {new Date(tx.created_at).toLocaleTimeString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => inspectTransaction(tx.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[11px] font-medium transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ledger Modal Inspector */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-brand-400" />
                  <span>Double-Entry Ledger Audit</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">TX: {selectedTx.id}</p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500">Status</span>
                <div className="mt-1">{getStatusBadge(selectedTx.status)}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500">Strategy</span>
                <div className="mt-1 font-mono text-slate-200">{selectedTx.concurrency_strategy}</div>
              </div>
            </div>

            <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
              Immutable Ledger Entries
            </h4>

            <div className="space-y-2 mb-6">
              {selectedTx.ledger_entries && selectedTx.ledger_entries.length > 0 ? (
                selectedTx.ledger_entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span
                        className={`font-bold mr-2 ${
                          entry.entry_type === 'DEBIT' ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        [{entry.entry_type}]
                      </span>
                      <span className="font-mono text-slate-300">{entry.account_number}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{entry.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-100">₹{entry.amount}</div>
                      <div className="text-[10px] text-slate-400">Balance: ₹{entry.balance_after}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 p-4 text-center bg-slate-950 rounded-xl">
                  No ledger entries recorded (transaction failed or rolled back).
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            >
              Close Audit Modal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
