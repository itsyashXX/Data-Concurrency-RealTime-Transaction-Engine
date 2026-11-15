import React, { useEffect, useState } from 'react';
import { Cpu, RefreshCw, Lock, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { api } from '../services/api';
import { TransactionEvent } from '../types';

export const Concurrency: React.FC = () => {
  const [events, setEvents] = useState<TransactionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchEvents = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const data = await api.getConcurrencyEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load concurrency events', err);
    } finally {
      setLoading(false);
      if (showSpinner) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(() => fetchEvents(false), 3000);
    return () => clearInterval(interval);
  }, []);

  const getEventBadge = (type: string) => {
    if (type.includes('LOCK_ACQUIRED') || type.includes('LOCK_ACQUIRING')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
          <Lock className="w-3 h-3" />
          <span>{type}</span>
        </span>
      );
    }
    if (type.includes('CONFLICT') || type.includes('INSUFFICIENT') || type.includes('FAILED')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <AlertTriangle className="w-3 h-3" />
          <span>{type}</span>
        </span>
      );
    }
    if (type.includes('LEDGER') || type.includes('COMPLETED') || type.includes('BALANCE')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <ShieldCheck className="w-3 h-3" />
          <span>{type}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-brand-500/15 text-brand-300 border border-brand-500/30">
        <Zap className="w-3 h-3" />
        <span>{type}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-white flex items-center space-x-2.5 tracking-tight">
              <div className="p-2 rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-glow-brand">
                <Cpu className="w-5 h-5" />
              </div>
              <span>Concurrency & Lock Monitor</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse mr-1.5"></span>
              Pessimistic Lock Stream
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time trace of row-level lock acquisitions, version checks, and atomic rollbacks in PostgreSQL.
          </p>
        </div>

        <button
          onClick={() => fetchEvents(true)}
          className="p-2 bg-void-900 hover:bg-void-850 text-slate-300 rounded-xl border border-white/[0.08] transition-colors self-start sm:self-auto shadow-sm"
          title="Refresh event stream"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-400' : ''}`} />
        </button>
      </div>

      {/* Events Stream List */}
      <div className="bg-void-900/90 border border-white/[0.08] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-5">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
            Live Concurrency & Lock Acquisition Trace
          </h3>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Canonical SELECT FOR UPDATE
          </span>
        </div>

        {loading && events.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-400" />
            <span className="font-mono text-xs">Capturing lock acquisition events...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-slate-400 font-mono text-xs">
            No contention events recorded. Run a transfer or test in the Race Lab.
          </div>
        ) : (
          <div className="space-y-2.5">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-4 bg-void-950/80 border border-white/[0.06] hover:border-brand-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all"
              >
                <div className="flex items-center space-x-3">
                  {getEventBadge(ev.event_type)}
                  <div className="font-mono text-slate-200 font-semibold text-xs">
                    TX: {ev.transaction_id ? `${ev.transaction_id.substring(0, 8)}...` : 'ISOLATED_OP'}
                  </div>
                </div>

                <div className="font-mono text-[11px] text-slate-300 bg-void-900 px-3 py-1.5 rounded-lg border border-white/[0.06] overflow-x-auto max-w-xl">
                  {JSON.stringify(ev.details)}
                </div>

                <div className="text-slate-400 font-mono text-[11px] shrink-0">
                  {new Date(ev.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Concurrency;
