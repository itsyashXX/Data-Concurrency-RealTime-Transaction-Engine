import React, { useEffect, useState } from 'react';
import { Cpu, RefreshCw, Lock, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { api } from '../services/api';
import { TransactionEvent } from '../types';

export const Concurrency: React.FC = () => {
  const [events, setEvents] = useState<TransactionEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const data = await api.getConcurrencyEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load concurrency events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 3000);
    return () => clearInterval(interval);
  }, []);

  const getEventBadge = (type: string) => {
    if (type.includes('LOCK_ACQUIRED') || type.includes('LOCK_ACQUIRING')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Lock className="w-3 h-3" />
          <span>{type}</span>
        </span>
      );
    }
    if (type.includes('CONFLICT') || type.includes('INSUFFICIENT') || type.includes('FAILED')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <AlertTriangle className="w-3 h-3" />
          <span>{type}</span>
        </span>
      );
    }
    if (type.includes('LEDGER') || type.includes('COMPLETED') || type.includes('BALANCE')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3 h-3" />
          <span>{type}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
        <Zap className="w-3 h-3" />
        <span>{type}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-brand-400" />
            <span>Concurrency & Lock Monitor</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time trace of row-level lock acquisitions, version conflicts, and atomic rollbacks
          </p>
        </div>
        <button
          onClick={fetchEvents}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Events Stream List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-4">
          Lifecycle & Concurrency Event Trace
        </h3>

        {events.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No concurrency events recorded yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getEventBadge(ev.event_type)}
                  <div className="font-mono text-slate-300">
                    TX: {ev.transaction_id ? `${ev.transaction_id.substring(0, 8)}...` : 'ISOLATED_OP'}
                  </div>
                </div>

                <div className="font-mono text-[11px] text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800/80 overflow-x-auto max-w-xl">
                  {JSON.stringify(ev.details)}
                </div>

                <div className="text-slate-500 text-[11px] flex-shrink-0">
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
