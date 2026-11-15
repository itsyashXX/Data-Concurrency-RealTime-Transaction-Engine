import React, { useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Scale,
  RotateCcw,
  Download,
  Search,
  ShieldCheck,
  Zap,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';
import { Transaction } from '../types';

export const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [strategyFilter, setStrategyFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [reversingId, setReversingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchTransactions = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const data = await api.getTransactions({
        status: statusFilter || undefined,
        strategy: strategyFilter || undefined
      });
      const list = Array.isArray(data) ? data : data.results || [];
      setTransactions(list);
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setLoading(false);
      if (showSpinner) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(() => fetchTransactions(false), 4000);
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

  const handleReverse = async (id: string) => {
    setReversingId(id);
    try {
      await api.reverseTransaction(id, 'Admin manual corrective reversal');
      setActionMessage(`Transaction ${id.substring(0, 8)} successfully reversed with compensating entries.`);
      fetchTransactions(false);
    } catch (err: any) {
      setActionMessage(err.response?.data?.error || 'Reversal failed or not supported.');
    } finally {
      setReversingId(null);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const exportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Correlation ID', 'Sender', 'Receiver', 'Amount', 'Strategy', 'Status', 'Latency MS', 'Created At'];
    const rows = transactions.map(t => [
      t.id,
      t.correlation_id || '',
      t.sender_account_number,
      t.receiver_account_number,
      t.amount,
      t.concurrency_strategy,
      t.status,
      t.latency_ms,
      t.created_at
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `datacore_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>COMPLETED</span>
          </span>
        );
      case 'REVERSED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <RotateCcw className="w-3 h-3" />
            <span>REVERSED</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            <span>FAILED</span>
          </span>
        );
      case 'ROLLED_BACK':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Scale className="w-3 h-3" />
            <span>ROLLED_BACK</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Clock className="w-3 h-3" />
            <span>{status || 'PENDING'}</span>
          </span>
        );
    }
  };

  const getStrategyBadge = (strat: string) => {
    switch (strat) {
      case 'PESSIMISTIC':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-brand-500/15 text-brand-300 border border-brand-500/30">
            Pessimistic Locking
          </span>
        );
      case 'OPTIMISTIC':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            Optimistic Version
          </span>
        );
      case 'ATOMIC_CONDITIONAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            Atomic Conditional
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            {strat}
          </span>
        );
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      tx.id.toLowerCase().includes(term) ||
      (tx.correlation_id && tx.correlation_id.toLowerCase().includes(term)) ||
      tx.sender_account_number?.toLowerCase().includes(term) ||
      tx.receiver_account_number?.toLowerCase().includes(term) ||
      tx.amount.toString().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-white flex items-center space-x-2.5 tracking-tight">
              <div className="p-2 rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-glow-brand">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <span>Live Transaction Monitor</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
              Real-Time Feed
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            PostgreSQL row-level locking operations, double-entry audit records, database latency, and compensating transaction controls.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={exportCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-obsidian-900 hover:bg-obsidian-850 text-xs font-semibold text-slate-300 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-brand-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => fetchTransactions(true)}
            className="p-2 bg-obsidian-900 hover:bg-obsidian-850 text-slate-300 rounded-xl border border-white/[0.08] transition-colors shadow-sm"
            title="Refresh transactions"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-400' : ''}`} />
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-brand-500/15 border border-brand-500/30 rounded-xl flex items-center justify-between text-xs text-brand-200">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="bg-obsidian-900/80 border border-white/[0.08] rounded-2xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Transaction ID, Account Number, Amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-obsidian-950 border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-2 bg-obsidian-950 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none font-mono text-xs"
            >
              <option value="" className="bg-obsidian-950">All Statuses</option>
              <option value="COMPLETED" className="bg-obsidian-950">COMPLETED</option>
              <option value="REVERSED" className="bg-obsidian-950">REVERSED</option>
              <option value="FAILED" className="bg-obsidian-950">FAILED</option>
              <option value="ROLLED_BACK" className="bg-obsidian-950">ROLLED_BACK</option>
              <option value="PENDING" className="bg-obsidian-950">PENDING</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-obsidian-950 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <select
              value={strategyFilter}
              onChange={(e) => setStrategyFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none font-mono text-xs"
            >
              <option value="" className="bg-obsidian-950">All Strategies</option>
              <option value="PESSIMISTIC" className="bg-obsidian-950">Pessimistic</option>
              <option value="OPTIMISTIC" className="bg-obsidian-950">Optimistic</option>
              <option value="ATOMIC_CONDITIONAL" className="bg-obsidian-950">Atomic Conditional</option>
              <option value="UNSAFE_BASELINE" className="bg-obsidian-950">Unsafe Baseline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-obsidian-900/90 border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-obsidian-950/80 border-b border-white/[0.06] text-slate-400 uppercase tracking-wider font-mono text-[11px]">
              <tr>
                <th className="px-5 py-4 font-semibold">Transaction ID</th>
                <th className="px-5 py-4 font-semibold">Sender</th>
                <th className="px-5 py-4 font-semibold">Receiver</th>
                <th className="px-5 py-4 font-semibold">Amount</th>
                <th className="px-5 py-4 font-semibold">Strategy</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Latency</th>
                <th className="px-5 py-4 font-semibold">Timestamp</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-slate-200">
              {loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-14 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2.5 text-brand-400" />
                    <span className="font-mono text-xs">Loading live transaction stream...</span>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-14 text-center text-slate-400">
                    <ArrowLeftRight className="w-7 h-7 mx-auto mb-2 text-slate-600" />
                    <p className="font-semibold text-white text-sm">No transactions match selected criteria</p>
                    <p className="text-xs text-slate-500 mt-1">Execute a transfer in the Customer App to view it here.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-obsidian-850/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-semibold text-brand-300">
                      {tx.id.substring(0, 8)}...
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium font-mono text-white">{tx.sender_account_number || 'Initial Pool'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{tx.sender_email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium font-mono text-white">{tx.receiver_account_number}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{tx.receiver_email}</div>
                    </td>
                    <td className="px-5 py-4 font-bold text-white font-mono text-sm">
                      ₹{tx.amount}
                    </td>
                    <td className="px-5 py-4">
                      {getStrategyBadge(tx.concurrency_strategy)}
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(tx.status)}</td>
                    <td className="px-5 py-4 font-mono text-slate-300">
                      {tx.latency_ms} ms
                    </td>
                    <td className="px-5 py-4 text-slate-400 font-mono text-xs">
                      {new Date(tx.created_at).toLocaleTimeString()}
                    </td>
                    <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => inspectTransaction(tx.id)}
                        className="px-2.5 py-1.5 bg-obsidian-950 hover:bg-brand-600/20 text-slate-300 hover:text-brand-300 rounded-xl border border-white/[0.08] hover:border-brand-500/40 text-[11px] font-mono transition-all"
                      >
                        Inspect Ledger
                      </button>
                      {tx.status === 'COMPLETED' && (
                        <button
                          disabled={reversingId === tx.id}
                          onClick={() => handleReverse(tx.id)}
                          className="px-2 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/25 text-[11px] font-mono transition-all inline-flex items-center space-x-1"
                          title="Trigger Compensating Reversal"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>{reversingId === tx.id ? 'Reversing...' : 'Reverse'}</span>
                        </button>
                      )}
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-white/[0.08] rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/30">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Double-Entry Ledger Audit</h3>
                  <p className="text-xs text-slate-400 font-mono">TX ID: {selectedTx.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-obsidian-950 border border-white/[0.06]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5 text-xs font-mono">
              <div className="p-3 bg-obsidian-950 rounded-xl border border-white/[0.06]">
                <span className="text-slate-400 text-[10px] uppercase">Transaction Status</span>
                <div className="mt-1">{getStatusBadge(selectedTx.status)}</div>
              </div>
              <div className="p-3 bg-obsidian-950 rounded-xl border border-white/[0.06]">
                <span className="text-slate-400 text-[10px] uppercase">Concurrency Strategy</span>
                <div className="mt-1 font-semibold text-slate-200">{selectedTx.concurrency_strategy}</div>
              </div>
            </div>

            <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-2.5">
              Authoritative Double-Entry Records
            </h4>

            <div className="space-y-2 mb-6">
              {selectedTx.ledger_entries && selectedTx.ledger_entries.length > 0 ? (
                selectedTx.ledger_entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 bg-obsidian-950 border border-white/[0.06] rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span
                        className={`font-mono font-bold mr-2 text-xs ${
                          entry.entry_type === 'DEBIT' ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        [{entry.entry_type}]
                      </span>
                      <span className="font-mono text-slate-200">{entry.account_number}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{entry.description}</p>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-white text-sm">₹{entry.amount}</div>
                      <div className="text-[10px] text-slate-400">Balance: ₹{entry.balance_after}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 p-5 text-center bg-obsidian-950 rounded-xl border border-white/[0.06]">
                  No ledger entries recorded (transaction rolled back or bypassed).
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 bg-obsidian-950 hover:bg-obsidian-850 text-slate-200 text-xs font-mono font-semibold rounded-xl border border-white/[0.08] transition-colors"
            >
              Close Ledger Audit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
