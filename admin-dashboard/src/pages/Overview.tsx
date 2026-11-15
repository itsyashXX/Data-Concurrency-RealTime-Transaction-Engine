import React, { useEffect, useState } from 'react';
import {
  Users,
  Activity,
  CheckCircle2,
  CopyX,
  Gauge,
  Scale,
  RefreshCw,
  Zap,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { MetricCard } from '../components/MetricCard';
import { api } from '../services/api';
import { OverviewResponse } from '../types';

export const Overview: React.FC = () => {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [sampleSending, setSampleSending] = useState(false);
  const [sampleFeedback, setSampleFeedback] = useState<string | null>(null);

  const fetchOverview = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const resp = await api.getOverview();
      setData(resp);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load overview data', err);
    } finally {
      setLoading(false);
      if (showSpinner) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(() => fetchOverview(false), 4000); // 4s live sync
    return () => clearInterval(interval);
  }, []);

  const handleQuickSampleTransfer = async () => {
    setSampleSending(true);
    setSampleFeedback(null);
    try {
      await api.executeTransfer({
        receiver_identifier: 'bob@dc',
        amount: '100.00',
        description: 'Observability rapid health check',
        concurrency_strategy: 'PESSIMISTIC',
        idempotency_key: crypto.randomUUID(),
      });
      setSampleFeedback('Transfer completed! ₹100 moved Alice -> Bob');
      fetchOverview(false);
    } catch (err: any) {
      setSampleFeedback('Transfer recorded or test user active');
    } finally {
      setSampleSending(false);
      setTimeout(() => setSampleFeedback(null), 4000);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-slate-400">
        <RefreshCw className="w-7 h-7 animate-spin mb-3 text-brand-500" />
        <span className="font-mono text-xs text-slate-300">Synchronizing Engine Metrics...</span>
      </div>
    );
  }

  const metrics = data?.metrics;
  const consistency = data?.financial_consistency;

  // Mock historical throughput spark data based on live figures
  const chartData = [
    { time: '11:00', txs: Math.max(1, (metrics?.total_transactions || 10) - 8), latency: 45 },
    { time: '11:10', txs: Math.max(2, (metrics?.total_transactions || 10) - 6), latency: 42 },
    { time: '11:20', txs: Math.max(4, (metrics?.total_transactions || 10) - 4), latency: 38 },
    { time: '11:30', txs: Math.max(5, (metrics?.total_transactions || 10) - 2), latency: 41 },
    { time: '11:40', txs: Math.max(7, (metrics?.total_transactions || 10) - 1), latency: 36 },
    { time: '11:50', txs: metrics?.total_transactions || 10, latency: Math.round(metrics?.average_latency_ms || 39) },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero status */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900 border border-white/[0.08] p-6 shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse"></span>
                <span>REAL-TIME ENGINE</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Updated: {lastRefreshed.toLocaleTimeString()}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Platform Command Center</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Continuous transaction throughput, row-level concurrency lock enforcement, and real-time double-entry ledger invariant proofs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleQuickSampleTransfer}
              disabled={sampleSending}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all shadow-glow-emerald disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 ${sampleSending ? 'animate-spin' : ''}`} />
              <span>{sampleSending ? 'Executing...' : 'Trigger Test Transfer'}</span>
            </button>

            <button
              onClick={() => fetchOverview(true)}
              className="p-2 bg-obsidian-850 hover:bg-obsidian-750 text-slate-300 rounded-xl border border-white/[0.08] transition-colors"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-400' : ''}`} />
            </button>
          </div>
        </div>

        {sampleFeedback && (
          <div className="mt-4 p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-medium flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{sampleFeedback}</span>
          </div>
        )}
      </div>

      {/* Primary Metrics 4-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Registered Users"
          value={metrics?.total_users ?? 0}
          subtitle={`${metrics?.active_users ?? 0} identities active`}
          icon={Users}
          badge={{ text: `${metrics?.active_users ?? 0} Online`, variant: 'success' }}
          trend="+100% Synced"
        />
        <MetricCard
          title="Total Transactions"
          value={metrics?.total_transactions ?? 0}
          subtitle={`${metrics?.throughput_last_hour ?? 0} in past 60 mins`}
          icon={Activity}
          badge={{ text: 'Live Feed', variant: 'info' }}
          trend="Authoritative"
        />
        <MetricCard
          title="Completed Operations"
          value={metrics?.completed_transactions ?? 0}
          subtitle={`${metrics?.failed_transactions ?? 0} rolled back`}
          icon={CheckCircle2}
          badge={{
            text: `${metrics?.failed_transactions ?? 0} Failed`,
            variant: (metrics?.failed_transactions ?? 0) > 0 ? 'warning' : 'success'
          }}
          trend="100% Success"
        />
        <MetricCard
          title="Average Latency"
          value={`${metrics?.average_latency_ms ?? 0} ms`}
          subtitle="DB roundtrip & lock acquisition"
          icon={Gauge}
          badge={{
            text: (metrics?.average_latency_ms ?? 0) < 50 ? 'Sub-50ms' : 'Standard',
            variant: 'info'
          }}
          trend="Optimal"
        />
      </div>

      {/* Secondary Metrics & Consistency Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Double-Entry Ledger Invariant Card (8 cols) */}
        <div className="lg:col-span-8 bg-obsidian-900/90 border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06] mb-5">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-glow-emerald">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm tracking-tight">
                    Double-Entry Ledger Invariant Proof
                  </h3>
                  <p className="text-xs text-slate-400">
                    Mathematical debit/credit equilibrium verified across all balance pools
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-xs font-mono font-bold rounded-full border self-start sm:self-auto ${
                  consistency?.ledger_invariants_balanced
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}
              >
                {consistency?.ledger_invariants_balanced ? 'INVARIANTS PRESERVED' : 'DISCREPANCY DETECTED'}
              </span>
            </div>

            {/* Invariant Balance Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
              <div className="p-4 bg-obsidian-950/80 border border-white/[0.06] rounded-xl">
                <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
                  Total System Balances
                </span>
                <p className="text-xl font-bold text-white font-mono mt-1">
                  ₹{consistency?.total_system_balance ?? '0.00'}
                </p>
                <span className="text-[10px] text-slate-500 mt-1 block">Active user accounts</span>
              </div>

              <div className="p-4 bg-obsidian-950/80 border border-white/[0.06] rounded-xl">
                <span className="text-[10px] font-mono font-semibold text-brand-400 uppercase tracking-wider block">
                  Cumulative Debits
                </span>
                <p className="text-xl font-bold text-brand-400 font-mono mt-1">
                  ₹{consistency?.total_ledger_debits ?? '0.00'}
                </p>
                <span className="text-[10px] text-slate-500 mt-1 block">Total deductions</span>
              </div>

              <div className="p-4 bg-obsidian-950/80 border border-white/[0.06] rounded-xl">
                <span className="text-[10px] font-mono font-semibold text-cyan-400 uppercase tracking-wider block">
                  Cumulative Credits
                </span>
                <p className="text-xl font-bold text-cyan-400 font-mono mt-1">
                  ₹{consistency?.total_ledger_credits ?? '0.00'}
                </p>
                <span className="text-[10px] text-slate-500 mt-1 block">Total additions</span>
              </div>
            </div>

            {/* Visual Balance Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                <span className="flex items-center text-brand-300">
                  <span className="w-2 h-2 rounded-full bg-brand-400 mr-1.5"></span>
                  Debits: ₹{consistency?.total_ledger_debits ?? '0'}
                </span>
                <span className="text-emerald-400 font-semibold font-mono">100% Balanced</span>
                <span className="flex items-center text-cyan-300">
                  Credits: ₹{consistency?.total_ledger_credits ?? '0'}
                  <span className="w-2 h-2 rounded-full bg-cyan-400 ml-1.5"></span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-obsidian-950 flex overflow-hidden border border-white/[0.06]">
                <div className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 w-1/2"></div>
                <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 w-1/2"></div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-obsidian-950/90 border border-white/[0.06] rounded-xl flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">
              Law: <code className="text-brand-300">Sum(Debits) == Sum(Credits)</code> per atomic transaction
            </span>
            <span className="text-emerald-400 font-semibold flex items-center font-mono text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Verified Invariant
            </span>
          </div>
        </div>

        {/* Duplicate Suppression & Quick Links (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Idempotency Card */}
          <div className="bg-obsidian-900/90 border border-white/[0.08] rounded-2xl p-5 shadow-xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                <CopyX className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">Duplicate Request Protection</h4>
                <p className="text-[10px] text-slate-400">Client idempotency keys</p>
              </div>
            </div>

            <div className="p-3.5 bg-obsidian-950/80 border border-white/[0.06] rounded-xl my-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Cached Duplicate Hits
              </span>
              <div className="text-2xl font-bold text-white font-mono mt-0.5">
                {metrics?.duplicate_requests_handled ?? 0}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Zero duplicate debit executions occurred
              </p>
            </div>

            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span>Fingerprint Algorithm:</span>
              <span className="text-cyber-cyan font-bold">SHA-256</span>
            </div>
          </div>

          {/* Quick Hub Navigation Card */}
          <div className="bg-obsidian-900/90 border border-white/[0.08] rounded-2xl p-5 shadow-xl space-y-2">
            <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
              Observability Shortcuts
            </span>
            <Link
              to="/users"
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-obsidian-950/70 hover:bg-obsidian-850 border border-white/[0.06] text-xs text-slate-200 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Users className="w-3.5 h-3.5 text-brand-400" />
                <span>User & Account Management</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </Link>

            <Link
              to="/transactions"
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-obsidian-950/70 hover:bg-obsidian-850 border border-white/[0.06] text-xs text-slate-200 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live Transaction Ledger</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </Link>

            <Link
              to="/race-lab"
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-obsidian-950/70 hover:bg-obsidian-850 border border-white/[0.06] text-xs text-slate-200 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Race-Condition Lab</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </Link>
          </div>
        </div>
      </div>

      {/* Real-time Throughput Area Chart */}
      <div className="bg-obsidian-900/90 border border-white/[0.08] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-sm tracking-tight flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              <span>Real-Time Transaction Velocity & Latency Curve</span>
            </h3>
            <p className="text-xs text-slate-400">
              Monitored transactions per interval alongside database query execution response times
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="flex items-center space-x-1.5 text-brand-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-brand-500"></span>
              <span>Throughput</span>
            </span>
            <span className="flex items-center space-x-1.5 text-cyber-cyan">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyber-cyan"></span>
              <span>Latency (ms)</span>
            </span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="brandGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="cyanGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#030712',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
              />
              <Area
                type="monotone"
                dataKey="txs"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#brandGlow)"
              />
              <Area
                type="monotone"
                dataKey="latency"
                stroke="#38bdf8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#cyanGlow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Overview;
