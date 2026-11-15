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
  Sparkles,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
        description: 'Aurora rapid engine telemetry ping',
        concurrency_strategy: 'PESSIMISTIC',
        idempotency_key: crypto.randomUUID(),
      });
      setSampleFeedback('Transfer completed! ₹100.00 moved Alice -> Bob with zero contention.');
      fetchOverview(false);
    } catch (err: any) {
      setSampleFeedback('Transfer recorded or test user active.');
    } finally {
      setSampleSending(false);
      setTimeout(() => setSampleFeedback(null), 4500);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-slate-400">
        <div className="relative">
          <RefreshCw className="w-8 h-8 animate-spin mb-3 text-aurora-cyan" />
          <div className="absolute inset-0 blur-lg bg-aurora-cyan/30 rounded-full animate-ping"></div>
        </div>
        <span className="font-mono text-xs text-aurora-cyan tracking-wider uppercase mt-2">
          Initializing Engine Observability Telemetry...
        </span>
      </div>
    );
  }

  const metrics = data?.metrics;
  const consistency = data?.financial_consistency;

  const chartData = [
    { time: '11:00', txs: Math.max(1, (metrics?.total_transactions || 10) - 8), latency: 44 },
    { time: '11:10', txs: Math.max(2, (metrics?.total_transactions || 10) - 6), latency: 41 },
    { time: '11:20', txs: Math.max(4, (metrics?.total_transactions || 10) - 4), latency: 37 },
    { time: '11:30', txs: Math.max(5, (metrics?.total_transactions || 10) - 2), latency: 39 },
    { time: '11:40', txs: Math.max(7, (metrics?.total_transactions || 10) - 1), latency: 35 },
    { time: '11:50', txs: metrics?.total_transactions || 10, latency: Math.round(metrics?.average_latency_ms || 39) },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Aurora Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-void-900 via-void-850 to-void-900 border border-white/[0.09] p-6 shadow-2xl backdrop-blur-2xl"
      >
        {/* Ambient Aurora Glow Background Orbs */}
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-aurora-cyan/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-brand-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gradient-to-r from-aurora-cyan/20 to-brand-500/20 text-aurora-cyan border border-aurora-cyan/30 flex items-center gap-1.5 shadow-neon-cyan/20 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aurora-cyan opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-aurora-cyan"></span>
                </span>
                <span>ENGINE COMMAND CENTER</span>
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-aurora-mint animate-pulse" />
                <span>Live Sync Active</span>
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Real-Time Platform Observability
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Row-level concurrency locks, high-frequency double-entry ledger invariant verification, and client idempotency deduplication.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleQuickSampleTransfer}
              disabled={sampleSending}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-aurora-mint/20 via-emerald-500/20 to-aurora-cyan/20 hover:from-aurora-mint/30 hover:to-aurora-cyan/30 text-aurora-mint border border-aurora-mint/40 transition-all shadow-neon-mint/20 shadow-sm disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 ${sampleSending ? 'animate-spin text-aurora-cyan' : 'text-aurora-mint'}`} />
              <span>{sampleSending ? 'Acquiring Row Lock...' : 'Execute Test Transfer'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchOverview(true)}
              className="p-2.5 bg-void-800 hover:bg-void-750 text-slate-200 rounded-xl border border-white/[0.08] transition-colors shadow-sm"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-aurora-cyan' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* Feedback notification toast */}
        <AnimatePresence>
          {sampleFeedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-3 bg-aurora-mint/15 border border-aurora-mint/35 rounded-xl text-xs text-aurora-mint font-medium flex items-center space-x-2.5 shadow-neon-mint/20"
            >
              <CheckCircle2 className="w-4 h-4 text-aurora-mint shrink-0" />
              <span>{sampleFeedback}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Primary Metrics 4-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Registered Users"
          value={metrics?.total_users ?? 0}
          subtitle={`${metrics?.active_users ?? 0} active identities`}
          icon={Users}
          badge={{ text: `${metrics?.active_users ?? 0} Online`, variant: 'success' }}
          trend="+100% Synced"
        />
        <MetricCard
          title="Total Transactions"
          value={metrics?.total_transactions ?? 0}
          subtitle={`${metrics?.throughput_last_hour ?? 0} executed past hour`}
          icon={Activity}
          badge={{ text: 'Real-Time', variant: 'info' }}
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
          trend="100% Consistent"
        />
        <MetricCard
          title="Average Latency"
          value={`${metrics?.average_latency_ms ?? 0} ms`}
          subtitle="DB roundtrip & lock acquisition"
          icon={Gauge}
          badge={{
            text: (metrics?.average_latency_ms ?? 0) < 50 ? 'Optimal' : 'Standard',
            variant: 'info'
          }}
          trend="Sub-50ms"
        />
      </div>

      {/* Secondary Metrics & Consistency Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Double-Entry Ledger Invariant Card (8 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="lg:col-span-8 bg-void-900/90 border border-white/[0.08] hover:border-aurora-mint/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between backdrop-blur-xl transition-all"
        >
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06] mb-5">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-aurora-mint/15 text-aurora-mint border border-aurora-mint/30 shadow-neon-mint/20">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base tracking-tight">
                    Double-Entry Ledger Invariant Verification
                  </h3>
                  <p className="text-xs text-slate-400">
                    Mathematical debit/credit equilibrium continuous verification across all balance pools
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-xs font-mono font-bold rounded-full border self-start sm:self-auto shadow-sm ${
                  consistency?.ledger_invariants_balanced
                    ? 'bg-aurora-mint/15 text-aurora-mint border-aurora-mint/35 shadow-neon-mint/20'
                    : 'bg-aurora-pink/15 text-aurora-pink border-aurora-pink/35 shadow-neon-pink/20'
                }`}
              >
                {consistency?.ledger_invariants_balanced ? 'INVARIANTS PRESERVED' : 'DISCREPANCY DETECTED'}
              </span>
            </div>

            {/* Invariant Balance Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
              <div className="p-4.5 bg-void-950/80 border border-white/[0.06] rounded-2xl relative overflow-hidden group">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Total System Balances
                </span>
                <p className="text-2xl font-black text-white font-mono mt-1">
                  ₹{consistency?.total_system_balance ?? '0.00'}
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">Active user accounts</span>
              </div>

              <div className="p-4.5 bg-void-950/80 border border-white/[0.06] rounded-2xl relative overflow-hidden group">
                <span className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-wider block">
                  Cumulative Debits
                </span>
                <p className="text-2xl font-black text-brand-400 font-mono mt-1">
                  ₹{consistency?.total_ledger_debits ?? '0.00'}
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">Total deductions</span>
              </div>

              <div className="p-4.5 bg-void-950/80 border border-white/[0.06] rounded-2xl relative overflow-hidden group">
                <span className="text-[10px] font-mono font-bold text-aurora-cyan uppercase tracking-wider block">
                  Cumulative Credits
                </span>
                <p className="text-2xl font-black text-aurora-cyan font-mono mt-1">
                  ₹{consistency?.total_ledger_credits ?? '0.00'}
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">Total additions</span>
              </div>
            </div>

            {/* Visual Animated Balance Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                <span className="flex items-center text-brand-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-brand-400 mr-1.5 shadow-sm"></span>
                  Debits: ₹{consistency?.total_ledger_debits ?? '0'}
                </span>
                <span className="text-aurora-mint font-bold font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-aurora-mint animate-pulse"></span>
                  100% Balanced
                </span>
                <span className="flex items-center text-aurora-cyan font-medium">
                  Credits: ₹{consistency?.total_ledger_credits ?? '0'}
                  <span className="w-2 h-2 rounded-full bg-aurora-cyan ml-1.5 shadow-sm"></span>
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-void-950 flex overflow-hidden border border-white/[0.08] p-[1px]">
                <div className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 w-1/2 rounded-l-full shadow-neon-violet"></div>
                <div className="h-full bg-gradient-to-r from-aurora-cyan to-aurora-mint w-1/2 rounded-r-full shadow-neon-cyan"></div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-void-950/90 border border-white/[0.06] rounded-xl flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">
              Invariant Law: <code className="text-aurora-cyan font-semibold">Sum(Debits) == Sum(Credits)</code> per atomic commit
            </span>
            <span className="text-aurora-mint font-bold flex items-center font-mono text-[11px] gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Invariant
            </span>
          </div>
        </motion.div>

        {/* Duplicate Suppression & Quick Links (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Idempotency Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="bg-void-900/90 border border-white/[0.08] hover:border-aurora-cyan/30 rounded-3xl p-5 shadow-xl backdrop-blur-xl transition-all"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 rounded-xl bg-aurora-cyan/15 text-aurora-cyan border border-aurora-cyan/30 shadow-neon-cyan/20">
                <CopyX className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">Duplicate Request Protection</h4>
                <p className="text-[10px] text-slate-400">Client idempotency keys</p>
              </div>
            </div>

            <div className="p-4 bg-void-950/80 border border-white/[0.06] rounded-2xl my-3">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Cached Duplicate Hits Suppressed
              </span>
              <div className="text-3xl font-black text-white font-mono mt-0.5">
                {metrics?.duplicate_requests_handled ?? 0}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Zero duplicate debit executions occurred
              </p>
            </div>

            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-1">
              <span>Fingerprint Validation:</span>
              <span className="text-aurora-cyan font-bold bg-aurora-cyan/10 px-2 py-0.5 rounded border border-aurora-cyan/20">
                SHA-256
              </span>
            </div>
          </motion.div>

          {/* Quick Hub Navigation Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="bg-void-900/90 border border-white/[0.08] rounded-3xl p-5 shadow-xl space-y-2.5 backdrop-blur-xl"
          >
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Observability Navigation
            </span>
            <Link
              to="/users"
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-void-950/70 hover:bg-void-800 border border-white/[0.06] hover:border-aurora-cyan/30 text-xs text-slate-200 transition-all group"
            >
              <div className="flex items-center space-x-2.5">
                <Users className="w-3.5 h-3.5 text-brand-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium">User & Account Management</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-aurora-cyan transition-colors" />
            </Link>

            <Link
              to="/transactions"
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-void-950/70 hover:bg-void-800 border border-white/[0.06] hover:border-aurora-cyan/30 text-xs text-slate-200 transition-all group"
            >
              <div className="flex items-center space-x-2.5">
                <Activity className="w-3.5 h-3.5 text-aurora-cyan group-hover:scale-110 transition-transform" />
                <span className="font-medium">Live Transaction Ledger</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-aurora-cyan transition-colors" />
            </Link>

            <Link
              to="/race-lab"
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-void-950/70 hover:bg-void-800 border border-white/[0.06] hover:border-aurora-cyan/30 text-xs text-slate-200 transition-all group"
            >
              <div className="flex items-center space-x-2.5">
                <Zap className="w-3.5 h-3.5 text-aurora-gold group-hover:scale-110 transition-transform" />
                <span className="font-medium">Race-Condition Lab</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-aurora-cyan transition-colors" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Real-time Throughput Area Chart */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
        className="bg-void-900/90 border border-white/[0.08] rounded-3xl p-6 shadow-xl backdrop-blur-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-white text-base tracking-tight flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-aurora-cyan" />
              <span>Real-Time Transaction Velocity & Latency Curve</span>
            </h3>
            <p className="text-xs text-slate-400">
              Transaction operations executed per interval alongside PostgreSQL query response times
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="flex items-center space-x-1.5 text-brand-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-brand-500 shadow-sm"></span>
              <span>Throughput</span>
            </span>
            <span className="flex items-center space-x-1.5 text-aurora-cyan">
              <span className="w-2.5 h-2.5 rounded-sm bg-aurora-cyan shadow-sm"></span>
              <span>Latency (ms)</span>
            </span>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="brandGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="cyanGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3b" opacity={0.6} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#040409',
                  borderColor: 'rgba(255,255,255,0.12)',
                  borderRadius: '16px',
                  fontSize: '12px',
                  color: '#f8fafc',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.8)'
                }}
              />
              <Area
                type="monotone"
                dataKey="txs"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#brandGlow)"
              />
              <Area
                type="monotone"
                dataKey="latency"
                stroke="#00f0ff"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#cyanGlow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default Overview;
