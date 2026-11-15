import React, { useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw, Filter } from 'lucide-react';
import { api } from '../services/api';
import { AuditLog } from '../types';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterAction, setFilterAction] = useState<string>('');

  const fetchLogs = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const data = await api.getAuditLogs(filterAction || undefined);
      const list = Array.isArray(data) ? data : data.results || [];
      setLogs(list);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
      if (showSpinner) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterAction]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2.5 tracking-tight">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span>System Audit Trail</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse mr-1.5"></span>
              Immutable Log
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Append-only audit trail recording user authentication, administrative triggers, and monetary lifecycle mutations.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="bg-transparent text-slate-800 focus:outline-none font-mono text-xs cursor-pointer"
            >
              <option value="" className="bg-white">All Actions</option>
              <option value="AUTH_LOGIN" className="bg-white">AUTH_LOGIN</option>
              <option value="AUTH_REGISTER" className="bg-white">AUTH_REGISTER</option>
              <option value="AUTH_LOGOUT" className="bg-white">AUTH_LOGOUT</option>
              <option value="SYSTEM_INITIALIZED" className="bg-white">SYSTEM_INITIALIZED</option>
            </select>
          </div>

          <button
            onClick={() => fetchLogs(true)}
            className="p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 transition-colors shadow-sm"
            title="Refresh audit trail"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-4 font-semibold">Timestamp</th>
                <th className="px-5 py-4 font-semibold">Action Trigger</th>
                <th className="px-5 py-4 font-semibold">User Identity</th>
                <th className="px-5 py-4 font-semibold">Origin IP</th>
                <th className="px-5 py-4 font-semibold">Audit Event Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-slate-500 font-sans">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    <span className="text-xs">Loading audit events...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-slate-500 font-sans">
                    No audit records found matching the current filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-900 font-medium whitespace-nowrap">
                      {log.user_email || 'SYSTEM_DAEMON'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-md truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
