import React, { useEffect, useState } from 'react';
import { CopyX, ShieldCheck, RefreshCw, Key, Hash, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { IdempotencyKeyRecord } from '../types';

export const DuplicateDetection: React.FC = () => {
  const [keys, setKeys] = useState<IdempotencyKeyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKeys = async () => {
    try {
      const data = await api.getDuplicates();
      const list = Array.isArray(data) ? data : data.results || [];
      setKeys(list);
    } catch (err) {
      console.error('Failed to load duplicate detection keys', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <CopyX className="w-6 h-6 text-brand-400" />
            <span>Duplicate Request Protection</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Client-scoped idempotency keys, payload SHA-256 fingerprint validation, and cached outcome replays
          </p>
        </div>
        <button
          onClick={fetchKeys}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-4">
          Recorded Idempotency Keys & Fingerprints
        </h3>

        {keys.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No idempotency keys recorded yet. Client requests with <code>Idempotency-Key</code> header will appear here.
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((k) => (
              <div
                key={k.id}
                className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-mono text-xs text-brand-300">
                    <Key className="w-4 h-4 text-brand-400" />
                    <span>{k.key}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      k.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {k.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className="text-slate-400">
                    User: <span className="text-slate-200">{k.user_email}</span>
                  </div>
                  <div className="text-slate-400 truncate">
                    Path: <span className="text-slate-200 font-mono">{k.request_path}</span>
                  </div>
                  <div className="text-slate-400 text-right">
                    Created: <span className="text-slate-200">{new Date(k.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center space-x-1.5 truncate">
                    <Hash className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="text-slate-500">Payload SHA-256:</span>
                    <span className="text-slate-300 truncate">{k.request_hash}</span>
                  </div>
                  <div className="text-slate-400 flex-shrink-0 ml-2">
                    Code: <span className="text-emerald-400 font-bold">{k.response_code || 201}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
