import React, { useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Scale,
  RotateCcw,
  Download,
  Search,
  ShieldCheck,
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
      console.error('Failed to inspect transaction', err);
    }
  };

  const handleReverse = async (id: string) => {
    if (!window.confirm('Trigger compensating reversal for transaction ' + id + '?')) return;
    setReversingId(id);
    setActionMessage(null);
    try {
      await api.reverseTransaction(id, 'Compensating administrative reversal');
      setActionMessage(`Transaction ${id.substring(0, 8)}... reversed successfully.`);
      fetchTransactions();
    } catch (err: any) {
      setActionMessage(err.response?.data?.error || 'Reversal failed.');
    } finally {
      setReversingId(null);
    }
  };

  const exportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Sender', 'Receiver', 'Amount', 'Strategy', 'Status', 'LatencyMs', 'CreatedAt'];
    const rows = transactions.map((t) => [
      t.id,
      t.sender_account_number || '',
      t.receiver_account_number || '',
      t.amount,
      t.concurrency_strategy,
      t.status,
      t.latency_ms,
      t.created_at
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
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
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>COMPLETED</span>
          </span>
        );
      case 'REVERSED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <RotateCcw className="w-3 h-3" />
            <span>REVERSED</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>FAILED</span>
          </span>
        );
      case 'ROLLED_BACK':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Scale className="w-3 h-3" />
            <span>ROLLED_BACK</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-sky-50 text-sky-700 border border-sky-200">
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
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Pessimistic Locking
          </span>
        );
      case 'OPTIMISTIC':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            Optimistic Version
          </span>
        );
      case 'ATOMIC_CONDITIONAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Atomic Conditional
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200">
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
            <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2.5 tracking-tight">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <span>Live Transaction Monitor</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
              Real-Time Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            PostgreSQL row-level locking operations, double-entry audit records, database latency, and compensating transaction controls.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={exportCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => fetchTransactions(true)}
            className="p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 transition-colors shadow-sm"
            title="Refresh transactions"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Transaction ID, Account Number, Amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-800 focus:outline-none font-mono text-xs cursor-pointer"
            >
              <option value="" className="bg-white">All Statuses</option>
              <option value="COMPLETED" className="bg-white">COMPLETED</option>
              <option value="REVERSED" className="bg-white">REVERSED</option>
              <option value="FAILED" className="bg-white">FAILED</option>
              <option value="ROLLED_BACK" className="bg-white">ROLLED_BACK</option>
              <option value="PENDING" className="bg-white">PENDING</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
            <select
              value={strategyFilter}
              onChange={(e) => setStrategyFilter(e.target.value)}
              className="bg-transparent text-slate-800 focus:outline-none font-mono text-xs cursor-pointer"
            >
              <option value="" className="bg-white">All Strategies</option>
              <option value="PESSIMISTIC" className="bg-white">Pessimistic</option>
              <option value="OPTIMISTIC" className="bg-white">Optimistic</option>
              <option value="ATOMIC_CONDITIONAL" className="bg-white">Atomic Conditional</option>
              <option value="UNSAFE_BASELINE" className="bg-white">Unsafe Baseline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-mono text-[11px]">
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
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-14 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2.5 text-indigo-600" />
                    <span className="font-mono text-xs">Loading live transaction stream...</span>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-14 text-center text-slate-500">
                    <ArrowLeftRight className="w-7 h-7 mx-auto mb-2 text-slate-400" />
                    <p className="font-semibold text-slate-800 text-sm">No transactions match selected criteria</p>
                    <p className="text-xs text-slate-500 mt-1">Execute a transfer in the Customer App to view it here.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono font-semibold text-indigo-700">
                      {tx.id.substring(0, 8)}...
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium font-mono text-slate-900">{tx.sender_account_number || 'Initial Pool'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{tx.sender_email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium font-mono text-slate-900">{tx.receiver_account_number}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{tx.receiver_email}</div>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 font-mono text-sm">
                      ₹{tx.amount}
                    </td>
                    <td className="px-5 py-4">
                      {getStrategyBadge(tx.concurrency_strategy)}
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(tx.status)}</td>
                    <td className="px-5 py-4 font-mono text-slate-600">
                      {tx.latency_ms} ms
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-mono text-xs">
                      {new Date(tx.created_at).toLocaleTimeString()}
                    </td>
                    <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => inspectTransaction(tx.id)}
                        className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-xl border border-slate-200 hover:border-indigo-200 text-[11px] font-mono transition-all"
                      >
                        Inspect Ledger
                      </button>
                      {tx.status === 'COMPLETED' && (
                        <button
                          disabled={reversingId === tx.id}
                          onClick={() => handleReverse(tx.id)}
                          className="px-2 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl border border-purple-200 text-[11px] font-mono transition-all inline-flex items-center space-x-1"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Double-Entry Ledger Audit</h3>
                  <p className="text-xs text-slate-500 font-mono">TX ID: {selectedTx.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 bg-slate-100 border border-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Transaction Status</span>
                <div className="mt-1">{getStatusBadge(selectedTx.status)}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Concurrency Strategy</span>
                <div className="mt-1 font-semibold text-slate-800">{selectedTx.concurrency_strategy}</div>
              </div>
            </div>

            <h4 className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider mb-2.5">
              Authoritative Double-Entry Records
            </h4>

            <div className="space-y-2 mb-6">
              {selectedTx.ledger_entries && selectedTx.ledger_entries.length > 0 ? (
                selectedTx.ledger_entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span
                        className={`font-mono font-bold mr-2 text-xs ${
                          entry.entry_type === 'DEBIT' ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        [{entry.entry_type}]
                      </span>
                      <span className="font-mono text-slate-800 font-medium">{entry.account_number}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{entry.description}</p>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-slate-900 text-sm">₹{entry.amount}</div>
                      <div className="text-[10px] text-slate-500">Balance: ₹{entry.balance_after}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 p-5 text-center bg-slate-50 rounded-xl border border-slate-200">
                  No ledger entries recorded (transaction rolled back or bypassed).
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-semibold rounded-xl border border-slate-200 transition-colors"
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
