import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Play,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Info,
  Clock,
  CheckCircle2,
  XCircle,
  Zap
} from 'lucide-react';
import { api } from '../services/api';
import { ConcurrencyExperiment } from '../types';

export const RaceLab: React.FC = () => {
  const [strategy, setStrategy] = useState<string>('PESSIMISTIC');
  const [initialBalance, setInitialBalance] = useState<number>(1000);
  const [withdrawalA, setWithdrawalA] = useState<number>(700);
  const [withdrawalB, setWithdrawalB] = useState<number>(500);
  const [running, setRunning] = useState<boolean>(false);
  const [activeExperiment, setActiveExperiment] = useState<ConcurrencyExperiment | null>(null);
  const [pastExperiments, setPastExperiments] = useState<ConcurrencyExperiment[]>([]);

  const loadPastExperiments = async () => {
    try {
      const data = await api.getExperiments();
      setPastExperiments(data);
      if (!activeExperiment && data.length > 0) {
        setActiveExperiment(data[0]);
      }
    } catch (err) {
      console.error('Failed to load past experiments', err);
    }
  };

  useEffect(() => {
    loadPastExperiments();
  }, []);

  const handleRunExperiment = async () => {
    setRunning(true);
    try {
      const exp = await api.runExperiment({
        strategy,
        initial_balance: initialBalance,
        withdrawals: [withdrawalA, withdrawalB]
      });
      setActiveExperiment(exp);
      loadPastExperiments();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to run experiment.');
    } finally {
      setRunning(false);
    }
  };

  const strategiesInfo = {
    PESSIMISTIC: {
      name: 'Pessimistic Row Locking (SELECT FOR UPDATE)',
      description: 'Acquires exclusive DB row locks in canonical order. One thread executes while the other waits, preserving non-negative balances.',
      safe: true,
    },
    OPTIMISTIC: {
      name: 'Optimistic Locking (Version Check)',
      description: 'Reads current account version; updates only if version has not changed. Concurrency collisions are cleanly detected and aborted.',
      safe: true,
    },
    ATOMIC_CONDITIONAL: {
      name: 'Atomic Conditional (F() expressions & WHERE)',
      description: 'Executes UPDATE ... WHERE balance >= amount atomically in DB engine, completely avoiding application-level race windows.',
      safe: true,
    },
    UNSAFE_BASELINE: {
      name: 'Unsafe Baseline (Isolated Lab Demonstration Only)',
      description: 'Check-then-act with artificial race latency. Demonstrates double-spending and invariant breakdown (negative balances).',
      safe: false,
    },
  };

  const currentInfo = strategiesInfo[strategy as keyof typeof strategiesInfo] || strategiesInfo.PESSIMISTIC;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center space-x-2.5">
          <h1 className="text-xl font-bold text-white flex items-center space-x-2.5 tracking-tight">
            <div className="p-2 rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-glow-brand">
              <FlaskConical className="w-5 h-5" />
            </div>
            <span>Race-Condition Laboratory</span>
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse mr-1.5"></span>
            Contention Simulator
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-xl">
          Execute multi-threaded concurrency attacks in an isolated test environment to evaluate database lock mechanics and invariant safety.
        </p>
      </div>

      {/* Safety Notice */}
      <div className="p-4 bg-brand-500/10 border border-brand-500/25 rounded-2xl flex items-start space-x-3 text-xs text-brand-200">
        <Info className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Isolated Sandbox Guarantee: </span>
          All laboratory experiments execute exclusively against temporary, isolated test accounts. Production user balances are never exposed to unsafe operations.
        </div>
      </div>

      {/* Experiment Setup Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-void-900/90 border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-5">
          <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Configure Experiment
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5 uppercase">
                Concurrency Strategy
              </label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full bg-void-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono transition-colors"
              >
                <option value="PESSIMISTIC">Pessimistic Locking (SELECT FOR UPDATE)</option>
                <option value="OPTIMISTIC">Optimistic Locking (Version Check)</option>
                <option value="ATOMIC_CONDITIONAL">Atomic Conditional Update (DB WHERE)</option>
                <option value="UNSAFE_BASELINE">Unsafe Baseline (Simulate Race Attack)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5 uppercase">
                Initial Account Balance (₹)
              </label>
              <input
                type="number"
                value={initialBalance}
                onChange={(e) => setInitialBalance(Number(e.target.value))}
                className="w-full bg-void-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1.5 uppercase">
                  Thread A Withdrawal (₹)
                </label>
                <input
                  type="number"
                  value={withdrawalA}
                  onChange={(e) => setWithdrawalA(Number(e.target.value))}
                  className="w-full bg-void-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1.5 uppercase">
                  Thread B Withdrawal (₹)
                </label>
                <input
                  type="number"
                  value={withdrawalB}
                  onChange={(e) => setWithdrawalB(Number(e.target.value))}
                  className="w-full bg-void-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono transition-colors"
                />
              </div>
            </div>

            {/* Explanation box */}
            <div className="p-3 bg-void-950 rounded-xl border border-white/[0.06] text-xs">
              <div className="font-semibold text-white mb-1">{currentInfo.name}</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{currentInfo.description}</p>
            </div>

            <button
              onClick={handleRunExperiment}
              disabled={running}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-mono font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-glow-brand"
            >
              {running ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Concurrent Threads...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Launch Concurrency Attack</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Experiment Results */}
        <div className="lg:col-span-2 space-y-6">
          {activeExperiment ? (
            <div className="bg-void-900/90 border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div>
                  <h3 className="font-bold text-white text-sm tracking-tight">{activeExperiment.experiment_name}</h3>
                  <p className="text-xs text-slate-400 font-mono">Strategy: {activeExperiment.strategy}</p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                    activeExperiment.invariants_preserved
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {activeExperiment.invariants_preserved ? 'INVARIANTS PRESERVED' : 'INVARIANT BROKEN (DOUBLE SPEND)'}
                </span>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 bg-void-950 rounded-xl border border-white/[0.06]">
                  <span className="text-slate-400 text-[10px] uppercase">Initial Balance</span>
                  <div className="text-base font-bold text-white mt-1">₹{activeExperiment.initial_balance}</div>
                </div>
                <div className="p-3 bg-void-950 rounded-xl border border-white/[0.06]">
                  <span className="text-slate-400 text-[10px] uppercase">Final Balance</span>
                  <div className={`text-base font-bold mt-1 ${activeExperiment.invariants_preserved ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ₹{activeExperiment.final_balance}
                  </div>
                </div>
                <div className="p-3 bg-void-950 rounded-xl border border-white/[0.06]">
                  <span className="text-slate-400 text-[10px] uppercase">Expected Balance</span>
                  <div className="text-base font-bold text-slate-300 mt-1">₹{activeExperiment.expected_balance}</div>
                </div>
                <div className="p-3 bg-void-950 rounded-xl border border-white/[0.06]">
                  <span className="text-slate-400 text-[10px] uppercase">Execution Time</span>
                  <div className="text-base font-bold text-cyan-300 mt-1">{activeExperiment.duration_ms} ms</div>
                </div>
              </div>

              {/* Thread execution log */}
              <div>
                <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-2.5">
                  Thread Race Execution Timeline
                </h4>
                <div className="space-y-2">
                  {activeExperiment.logs.map((log, i) => (
                    <div
                      key={i}
                      className="p-3 bg-void-950 rounded-xl border border-white/[0.06] flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-void-900 border border-white/[0.08] text-slate-300 text-[10px]">
                          Thread #{log.thread}
                        </span>
                        <span className="text-slate-200">Withdraw ₹{log.requested_amount}</span>
                        {log.message && <span className="text-slate-500 text-[11px]">— {log.message}</span>}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SUCCESS' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-void-900/90 border border-white/[0.08] rounded-2xl p-12 text-center text-slate-400 shadow-xl">
              <FlaskConical className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="font-semibold text-white">No active experiment</p>
              <p className="text-xs text-slate-500 mt-1">Configure parameters and launch an attack to evaluate lock safety.</p>
            </div>
          )}

          {/* Deadlock Card */}
          <DeadlockCard />
        </div>
      </div>
    </div>
  );
};

const DeadlockCard: React.FC = () => {
  const [deadlockResult, setDeadlockResult] = useState<any>(null);
  const [running, setRunning] = useState(false);

  const handleRunDeadlock = async () => {
    setRunning(true);
    try {
      const res = await api.simulateDeadlock();
      setDeadlockResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="bg-void-900/90 border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Deadlock & Cyclic Dependency Simulator</h3>
          <p className="text-xs text-slate-400">Demonstrates why inverted row-locking produces circular wait deadlocks</p>
        </div>
        <button
          onClick={handleRunDeadlock}
          disabled={running}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-mono font-bold text-xs flex items-center space-x-2 shadow-sm disabled:opacity-50 transition-all"
        >
          {running ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
          <span>Simulate Deadlock</span>
        </button>
      </div>

      {deadlockResult && (
        <div className="p-4 rounded-xl bg-void-950 border border-white/[0.06] space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Deadlock State Detected:</span>
            <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
              deadlockResult.deadlock_detected ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-400'
            }`}>
              {deadlockResult.deadlock_detected ? 'Deadlock / Conflict Triggered' : 'Clean'}
            </span>
          </div>

          <div className="space-y-1 text-[11px] text-slate-300">
            {deadlockResult.worker_1?.events?.map((ev: string, i: number) => (
              <p key={i}>• {ev}</p>
            ))}
            {deadlockResult.worker_2?.events?.map((ev: string, i: number) => (
              <p key={i}>• {ev}</p>
            ))}
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-[11px] font-sans">
            <strong>DataCore Invariant:</strong> {deadlockResult.resolution}
          </div>
        </div>
      )}
    </div>
  );
};

export default RaceLab;
