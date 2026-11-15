import React, { useEffect, useState } from 'react';
import { CopyX, RefreshCw, Key, Hash, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { IdempotencyKeyRecord } from '../types';

export const DuplicateDetection: React.FC = () => {
  const [keys, setKeys] = useState<IdempotencyKeyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchKeys = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const data = await api.getDuplicates();
      const list = Array.isArray(data) ? data : data.results || [];
      setKeys(list);
    } catch (err) {
      console.error('Failed to load duplicate detection keys', err);
    } finally {
      setLoading(false);
      if (showSpinner) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2.5 tracking-tight">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                <CopyX className="w-5 h-5" />
              </div>
              <span>Duplicate Request Protection</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200 flex items-center shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse mr-1.5"></span>
              SHA-256 Fingerprinted
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Client-scoped idempotency keys, payload SHA-256 fingerprint validation, and cached outcome replays.
          </p>
        </div>

        <button
          onClick={() => fetchKeys(true)}
          className="p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 transition-colors self-start sm:self-auto shadow-sm"
          title="Refresh idempotency records"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
        </button>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-700 tracking-wider">
            Recorded Idempotency Keys & Deduplication Proofs
          </h3>
          <span className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Double-Spending Prevented
          </span>
        </div>

        {loading && keys.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
            <span className="font-mono text-xs">Querying idempotency key store...</span>
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-16 text-slate-500 font-mono text-xs">
            No duplicate attempts recorded yet. Client requests with <code>Idempotency-Key</code> will register here.
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((k) => (
              <div
                key={k.id}
                className="p-4 bg-slate-50 border border-slate-200/80 hover:border-indigo-200 rounded-xl space-y-3 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-mono text-xs text-indigo-700 font-semibold">
                    <Key className="w-4 h-4 text-indigo-600" />
                    <span>{k.key}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      k.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {k.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono">
                  <div className="text-slate-500">
                    User: <span className="text-slate-800 font-medium">{k.user_email}</span>
                  </div>
                  <div className="text-slate-500 truncate">
                    Endpoint: <span className="text-slate-800">{k.request_path}</span>
                  </div>
                  <div className="text-slate-500 text-right">
                    Created: <span className="text-slate-700">{new Date(k.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-600">
                  <div className="flex items-center space-x-1.5 truncate">
                    <Hash className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="text-slate-500">Payload SHA-256:</span>
                    <span className="text-slate-800 truncate">{k.request_hash}</span>
                  </div>
                  <div className="text-slate-500 shrink-0 ml-3">
                    Response: <span className="text-emerald-700 font-bold">{k.response_code || 200} OK</span>
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

export default DuplicateDetection;
