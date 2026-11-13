import React, { useEffect, useState } from 'react';
import { Scale, CheckCircle2, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { OverviewResponse } from '../types';

export const Consistency: React.FC = () => {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConsistency = async () => {
    try {
      const resp = await api.getOverview();
      setData(resp);
    } catch (err) {
      console.error('Failed to load consistency data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsistency();
  }, []);

  const consistency = data?.financial_consistency;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Scale className="w-6 h-6 text-brand-400" />
            <span>Financial Consistency & Double-Entry Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Persisted ledger audit verifying that every completed transaction has matching debit and credit entries
          </p>
        </div>
        <button
          onClick={fetchConsistency}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Audit Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Global Ledger Balance Verification</h3>
            <p className="text-xs text-slate-400">
              Evaluated across all accounts and historical ledger records
            </p>
          </div>
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full border ${
              consistency?.ledger_invariants_balanced
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
          >
            {consistency?.ledger_invariants_balanced ? 'AUDIT PASSED: 100% BALANCED' : 'AUDIT FAILED: DISCREPANCY'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Total System Balance</span>
            <div className="text-2xl font-bold text-slate-100 mt-1">
              ₹{consistency?.total_system_balance || '0.00'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Sum of all active account balances</p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Total Ledger Debits</span>
            <div className="text-2xl font-bold text-brand-400 mt-1">
              ₹{consistency?.total_ledger_debits || '0.00'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Sum of all immutable DEBIT records</p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Total Ledger Credits</span>
            <div className="text-2xl font-bold text-indigo-400 mt-1">
              ₹{consistency?.total_ledger_credits || '0.00'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Sum of all immutable CREDIT records</p>
          </div>
        </div>

        {/* Ledger Rules & Principles Box */}
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Guaranteed Database Consistency Invariants</span>
          </h4>
          <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
            <li>
              <strong className="text-slate-200">Zero Partial Commits:</strong> Balance updates and ledger records are wrapped in <code>transaction.atomic()</code>.
            </li>
            <li>
              <strong className="text-slate-200">Non-Negative Account Balance:</strong> Every debit checks balance availability before committing.
            </li>
            <li>
              <strong className="text-slate-200">Balanced Ledger:</strong> For every inter-account transfer, exactly one Debit and one Credit entry are created with identical amounts.
            </li>
            <li>
              <strong className="text-slate-200">Append-Only Immutability:</strong> Ledger records are never edited or deleted after insertion.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
