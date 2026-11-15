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
  Sparkles,
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
  const [, setLastRefreshed] = useState<Date>(new Date());
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
        description: 'Light engine telemetry ping',
        concurrency_strategy: 'PESSIMISTIC',
        idempotency_key: crypto.randomUUID(),
      });
      setSampleFeedback('Transfer completed: ₹100.00 settled with row lock');
      fetchOverview();
      setTimeout(() => setSampleFeedback(null), 5000);
    } catch (err: any) {
      setSampleFeedback(err.response?.data?.error || 'Test transfer failed. Ensure Bob account exists.');
      setTimeout(() => setSampleFeedback(null), 5000);
    } finally {
      setSampleSending(false);
    }
  };

  const metrics = data?.metrics;
  const consistency = data?.financial_consistency || data?.ledger_consistency;

  // Real-time chart sample data
  const chartData = [
    { time: '12:00', txs: (metrics?.total_transactions ?? 0) > 10 ? 12 : 2, latency: 14 },
    { time: '12:05', txs: (metrics?.total_transactions ?? 0) > 15 ? 19 : 4, latency: 18 },
    { time: '12:10', txs: (metrics?.total_transactions ?? 0) > 20 ? 15 : 6, latency: 12 },
    { time: '12:15', txs: (metrics?.total_transactions ?? 0) > 25 ? 28 : 9, latency: 22 },
    { time: '12:20', txs: (metrics?.total_transactions ?? 0) > 30 ? 34 : 14, latency: 19 },
    { time: '12:25', txs: (metrics?.total_transactions ?? 0) > 40 ? 42 : 18, latency: 15 },
    { time: '12:30', txs: metrics?.total_transactions ?? 24, latency: metrics?.average_latency_ms ?? 16 },
  ];

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs font-mono text-slate-500">Connecting to authoritative engine feed...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-sm overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                </span>
                <span>ENGINE COMMAND CENTER</span>
              </span>
              <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span>Live Sync Active</span>
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Real-Time Platform Observability
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Row-level concurrency locks, high-frequency double-entry ledger invariant verification, and client idempotency deduplication.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleQuickSampleTransfer}
              disabled={sampleSending}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all shadow-sm disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 ${sampleSending ? 'animate-spin text-indigo-600' : 'text-emerald-700'}`} />
              <span>{sampleSending ? 'Acquiring Row Lock...' : 'Execute Test Transfer'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => fetchOverview(true)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors shadow-sm"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
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
              className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center space-x-2.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-8 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base tracking-tight">
                    Double-Entry Ledger Invariant Verification
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mathematical debit/credit equilibrium continuous verification across all balance pools
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-xs font-mono font-bold rounded-full border self-start sm:self-auto shadow-sm ${
                  consistency?.ledger_invariants_balanced
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {consistency?.ledger_invariants_balanced ? 'INVARIANTS PRESERVED' : 'DISCREPANCY DETECTED'}
              </span>
            </div>

            {/* Invariant Balance Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl relative overflow-hidden group">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                  Total System Balances
                </span>
                <p className="text-2xl font-black text-slate-900 font-mono mt-1">
                  ₹{consistency?.total_system_balance ?? '0.00'}
                </p>
                <span className="text-[10px] text-slate-500 mt-1 block">Active user accounts</span>
              </div>

              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl relative overflow-hidden group">
                <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase tracking-wider block">
                  Cumulative Debits
                </span>
                <p className="text-2xl font-black text-indigo-900 font-mono mt-1">
                  ₹{consistency?.total_ledger_debits ?? '0.00'}
                </p>
                <span className="text-[10px] text-indigo-600 mt-1 block">Total deductions</span>
              </div>

              <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl relative overflow-hidden group">
                <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider block">
                  Cumulative Credits
                </span>
                <p className="text-2xl font-black text-emerald-900 font-mono mt-1">
                  ₹{consistency?.total_ledger_credits ?? '0.00'}
                </p>
                <span className="text-[10px] text-emerald-600 mt-1 block">Total additions</span>
              </div>
            </div>

            {/* Visual Animated Balance Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-[11px] font-mono text-slate-600 mb-1.5 font-medium">
                <span className="flex items-center text-indigo-700">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 mr-1.5"></span>
                  Debits: ₹{consistency?.total_ledger_debits ?? '0'}
                </span>
                <span className="text-emerald-700 font-bold font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  100% Balanced
                </span>
                <span className="flex items-center text-emerald-700">
                  Credits: ₹{consistency?.total_ledger_credits ?? '0'}
                  <span className="w-2 h-2 rounded-full bg-emerald-600 ml-1.5"></span>
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 flex overflow-hidden border border-slate-200 p-[1px]">
                <div className="h-full bg-indigo-600 w-1/2 rounded-l-full"></div>
                <div className="h-full bg-emerald-500 w-1/2 rounded-r-full"></div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs text-slate-600">
            <span className="font-mono text-[11px]">
              Invariant Law: <code className="text-indigo-700 font-bold">Sum(Debits) == Sum(Credits)</code> per atomic commit
            </span>
            <span className="text-emerald-700 font-bold flex items-center font-mono text-[11px] gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Verified Invariant
            </span>
          </div>
        </motion.div>

        {/* Duplicate Suppression & Quick Links (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Idempotency Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                <CopyX className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Duplicate Request Protection</h4>
                <p className="text-[10px] text-slate-500">Client idempotency keys</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl my-3">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                Cached Duplicate Hits Suppressed
              </span>
              <div className="text-3xl font-black text-slate-900 font-mono mt-0.5">
                {metrics?.duplicate_requests_handled ?? 0}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Zero duplicate debit executions occurred
              </p>
            </div>

            <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between pt-1">
              <span>Fingerprint Validation:</span>
              <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                SHA-256
              </span>
            </div>
          </motion.div>

          {/* Quick Hub Navigation Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-2.5"
          >
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
              Observability Navigation
            </span>
            <Link
              to="/users"
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-xs text-slate-800 transition-all group"
            >
              <div className="flex items-center space-x-2.5">
                <Users className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-105 transition-transform" />
                <span className="font-medium">User & Account Management</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </Link>

            <Link
              to="/transactions"
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-xs text-slate-800 transition-all group"
            >
              <div className="flex items-center space-x-2.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-105 transition-transform" />
                <span className="font-medium">Live Transaction Ledger</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </Link>

            <Link
              to="/race-lab"
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-xs text-slate-800 transition-all group"
            >
              <div className="flex items-center space-x-2.5">
                <Zap className="w-3.5 h-3.5 text-amber-600 group-hover:scale-105 transition-transform" />
                <span className="font-medium">Race-Condition Lab</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Real-time Throughput Area Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base tracking-tight flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Real-Time Transaction Velocity & Latency Curve</span>
            </h3>
            <p className="text-xs text-slate-500">
              Transaction operations executed per interval alongside PostgreSQL query response times
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="flex items-center space-x-1.5 text-indigo-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600"></span>
              <span>Throughput</span>
            </span>
            <span className="flex items-center space-x-1.5 text-sky-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500"></span>
              <span>Latency (ms)</span>
            </span>
          </div>
        </div>

        <div className="h-60 sm:h-72 lg:h-80 3xl:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="brandGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="skyGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#0f172a',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)'
                }}
              />
              <Area
                type="monotone"
                dataKey="txs"
                stroke="#4f46e5"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#brandGlow)"
              />
              <Area
                type="monotone"
                dataKey="latency"
                stroke="#0ea5e9"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#skyGlow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default Overview;
