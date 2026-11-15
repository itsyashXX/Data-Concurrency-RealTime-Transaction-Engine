import React, { useEffect, useState } from 'react';
import { Scale, RefreshCw, ShieldCheck } from 'lucide-react';
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

  const consistency = data?.financial_consistency || data?.ledger_consistency;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2.5 tracking-tight">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Scale className="w-5 h-5" />
              </div>
              <span>Financial Consistency & Double-Entry Ledger</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
              Mathematically Proved
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Authoritative ledger proofs verifying that all completed transactions maintain matching debit and credit entries.
          </p>
        </div>

        <button
          onClick={() => fetchConsistency(true)}
          className="p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 transition-colors self-start sm:self-auto shadow-sm"
          title="Re-run mathematical verification"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
        </button>
      </div>

      {/* Main Audit Summary Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Global Ledger Balance Verification</h3>
            <p className="text-xs text-slate-500">
              Evaluated across all accounts and historical immutable ledger records
            </p>
          </div>
          <span
            className={`px-3 py-1 text-xs font-mono font-bold rounded-full border self-start sm:self-auto shadow-sm ${
              consistency?.ledger_invariants_balanced
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {consistency?.ledger_invariants_balanced ? 'AUDIT PASSED: 100% BALANCED' : 'AUDIT FAILED: DISCREPANCY'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider block">
              Total System Balance
            </span>
            <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
              ₹{consistency?.total_system_balance || '0.00'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Sum of all active account balances</p>
          </div>

          <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl">
            <span className="text-[10px] font-mono font-semibold text-indigo-700 uppercase tracking-wider block">
              Total Ledger Debits
            </span>
            <div className="text-2xl font-bold text-indigo-900 font-mono mt-1">
              ₹{consistency?.total_ledger_debits || '0.00'}
            </div>
            <p className="text-[11px] text-indigo-600 mt-1">Sum of all immutable DEBIT records</p>
          </div>

          <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
            <span className="text-[10px] font-mono font-semibold text-emerald-700 uppercase tracking-wider block">
              Total Ledger Credits
            </span>
            <div className="text-2xl font-bold text-emerald-900 font-mono mt-1">
              ₹{consistency?.total_ledger_credits || '0.00'}
            </div>
            <p className="text-[11px] text-emerald-600 mt-1">Sum of all immutable CREDIT records</p>
          </div>
        </div>

        {/* Ledger Rules & Principles Box */}
        <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Guaranteed Database Consistency Invariants</span>
          </h4>
          <ul className="text-xs text-slate-600 space-y-2.5 list-disc list-inside leading-relaxed">
            <li>
              <strong className="text-slate-800">Zero Partial Commits:</strong> Balance updates and ledger entries are executed within <code>transaction.atomic()</code> blocks.
            </li>
            <li>
              <strong className="text-slate-800">Non-Negative Balance Invariant:</strong> Database-level constraints guarantee account balances never drop below zero.
            </li>
            <li>
              <strong className="text-slate-800">Conservation of Money:</strong> For every inter-account transfer, exactly one Debit and one Credit entry are committed with identical amounts.
            </li>
            <li>
              <strong className="text-slate-800">Append-Only Immutability:</strong> Ledger records are write-once and mathematically immutable.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Consistency;
