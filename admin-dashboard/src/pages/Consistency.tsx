import React, { useEffect, useState } from 'react';
import { Scale, CheckCircle2, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { OverviewResponse } from '../types';

export const Consistency: React.FC = () => {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchConsistency = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const resp = await api.getOverview();
      setData(resp);
    } catch (err) {
      console.error('Failed to load consistency data', err);
    } finally {
      setLoading(false);
      if (showSpinner) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConsistency();
  }, []);

  const consistency = data?.financial_consistency;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-white flex items-center space-x-2.5 tracking-tight">
              <div className="p-2 rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-glow-brand">
                <Scale className="w-5 h-5" />
              </div>
              <span>Financial Consistency & Double-Entry Ledger</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
              Mathematically Proved
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Authoritative ledger proofs verifying that all completed transactions maintain matching debit and credit entries.
          </p>
        </div>

        <button
          onClick={() => fetchConsistency(true)}
          className="p-2 bg-void-900 hover:bg-void-850 text-slate-300 rounded-xl border border-white/[0.08] transition-colors self-start sm:self-auto shadow-sm"
          title="Re-run mathematical verification"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-400' : ''}`} />
        </button>
      </div>

      {/* Main Audit Summary Card */}
      <div className="bg-void-900/90 border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Global Ledger Balance Verification</h3>
            <p className="text-xs text-slate-400">
              Evaluated across all accounts and historical immutable ledger records
            </p>
          </div>
          <span
            className={`px-3 py-1 text-xs font-mono font-bold rounded-full border self-start sm:self-auto ${
              consistency?.ledger_invariants_balanced
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-glow-emerald'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}
          >
            {consistency?.ledger_invariants_balanced ? 'AUDIT PASSED: 100% BALANCED' : 'AUDIT FAILED: DISCREPANCY'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4.5 bg-void-950/80 border border-white/[0.06] rounded-2xl">
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
              Total System Balance
            </span>
            <div className="text-2xl font-bold text-white font-mono mt-1">
              ₹{consistency?.total_system_balance || '0.00'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Sum of all active account balances</p>
          </div>

          <div className="p-4.5 bg-void-950/80 border border-white/[0.06] rounded-2xl">
            <span className="text-[10px] font-mono font-semibold text-brand-400 uppercase tracking-wider block">
              Total Ledger Debits
            </span>
            <div className="text-2xl font-bold text-brand-400 font-mono mt-1">
              ₹{consistency?.total_ledger_debits || '0.00'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Sum of all immutable DEBIT records</p>
          </div>

          <div className="p-4.5 bg-void-950/80 border border-white/[0.06] rounded-2xl">
            <span className="text-[10px] font-mono font-semibold text-cyber-cyan uppercase tracking-wider block">
              Total Ledger Credits
            </span>
            <div className="text-2xl font-bold text-cyber-cyan font-mono mt-1">
              ₹{consistency?.total_ledger_credits || '0.00'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Sum of all immutable CREDIT records</p>
          </div>
        </div>

        {/* Ledger Rules & Principles Box */}
        <div className="p-5 bg-void-950/80 border border-white/[0.06] rounded-2xl space-y-3">
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Guaranteed Database Consistency Invariants</span>
          </h4>
          <ul className="text-xs text-slate-300 space-y-2.5 list-disc list-inside leading-relaxed">
            <li>
              <strong className="text-white">Zero Partial Commits:</strong> Balance updates and ledger entries are executed within <code>transaction.atomic()</code> blocks.
            </li>
            <li>
              <strong className="text-white">Non-Negative Balance Invariant:</strong> Database-level constraints guarantee account balances never drop below zero.
            </li>
            <li>
              <strong className="text-white">Conservation of Money:</strong> For every inter-account transfer, exactly one Debit and one Credit entry are committed with identical amounts.
            </li>
            <li>
              <strong className="text-white">Append-Only Immutability:</strong> Ledger records are write-once and mathematically immutable.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Consistency;
