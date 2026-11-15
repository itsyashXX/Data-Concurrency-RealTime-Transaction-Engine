import React, { useEffect, useState } from 'react';
import {
  Users,
  Activity,
  CheckCircle2,
  CopyX,
  Gauge,
  Scale,
  RefreshCw
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { api } from '../services/api';
import { OverviewResponse } from '../types';

export const Overview: React.FC = () => {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchOverview = async () => {
    try {
      const resp = await api.getOverview();
      setData(resp);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load overview data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 5000); // 5s short polling
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2 text-brand-400" />
        <span>Loading Engine Metrics...</span>
      </div>
    );
  }

  const metrics = data?.metrics;
  const consistency = data?.financial_consistency;

  return (
    <div className="space-y-6">
      {/* Top action / status bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Platform Observability</h1>
          <p className="text-xs text-slate-400">
            Real-time throughput, transaction consistency, and concurrency state
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-500">
            Updated: {lastRefreshed.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchOverview}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Registered Users"
          value={metrics?.total_users ?? 0}
          subtitle={`${metrics?.active_users ?? 0} active in last 5m`}
          icon={Users}
          badge={{ text: `${metrics?.active_users ?? 0} Online`, variant: 'success' }}
        />
        <MetricCard
          title="Total Transactions"
          value={metrics?.total_transactions ?? 0}
          subtitle={`${metrics?.throughput_last_hour ?? 0} executed past hour`}
          icon={Activity}
          badge={{ text: 'Live Feed', variant: 'info' }}
        />
        <MetricCard
          title="Completed Operations"
          value={metrics?.completed_transactions ?? 0}
          subtitle={`${metrics?.failed_transactions ?? 0} failed / rolled back`}
          icon={CheckCircle2}
          badge={{ text: `${metrics?.failed_transactions ?? 0} Failed`, variant: (metrics?.failed_transactions ?? 0) > 0 ? 'warning' : 'success' }}
        />
        <MetricCard
          title="Average Latency"
          value={`${metrics?.average_latency_ms ?? 0} ms`}
          subtitle="DB roundtrip & lock acquisition"
          icon={Gauge}
          badge={{ text: (metrics?.average_latency_ms ?? 0) < 50 ? 'Optimal' : 'Standard', variant: 'info' }}
        />
      </div>

      {/* Secondary Metrics & Consistency Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Double-Entry Ledger Invariant Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">
                  Authoritative Double-Entry Ledger Verification
                </h3>
                <p className="text-xs text-slate-400">
                  Continuous mathematical verification of debits and credits across all accounts
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                consistency?.ledger_invariants_balanced
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {consistency?.ledger_invariants_balanced ? 'INVARIANTS PRESERVED' : 'DISCREPANCY DETECTED'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Total System Balances
              </span>
              <p className="text-xl font-bold text-slate-100 mt-1">
                ₹{consistency?.total_system_balance ?? '0.00'}
              </p>
              <span className="text-[10px] text-slate-500">Across all user accounts</span>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Cumulative Debits
              </span>
              <p className="text-xl font-bold text-brand-400 mt-1">
                ₹{consistency?.total_ledger_debits ?? '0.00'}
              </p>
              <span className="text-[10px] text-slate-500">Total fund deductions</span>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Cumulative Credits
              </span>
              <p className="text-xl font-bold text-indigo-400 mt-1">
                ₹{consistency?.total_ledger_credits ?? '0.00'}
              </p>
              <span className="text-[10px] text-slate-500">Total fund additions</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400">
            <span>
              Rule: <code className="text-brand-300">Sum(Debits) == Sum(Credits)</code> per atomic transaction
            </span>
            <span className="text-emerald-400 font-medium flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              100% Persisted Invariant Balance
            </span>
          </div>
        </div>

        {/* Duplicate Request Protection Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <CopyX className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">Duplicate Protection</h3>
                <p className="text-xs text-slate-400">Client-scoped idempotency keys</p>
              </div>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl my-4">
              <span className="text-xs text-slate-400">Total Cached Duplicate Hits</span>
              <div className="text-3xl font-bold text-slate-100 mt-1">
                {metrics?.duplicate_requests_handled ?? 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Double-spending attempts safely bypassed without second execution
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-[11px] text-slate-400">
            <span>Hash Fingerprint: </span>
            <span className="text-slate-300 font-mono">SHA-256 payload verification</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
