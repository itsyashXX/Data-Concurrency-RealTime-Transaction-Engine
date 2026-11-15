import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@datacore.io');
  const [password, setPassword] = useState('AdminPassword123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await api.login(email, password);
      if (data.user.role !== 'ADMIN') {
        setError('Access denied. Administrator privileges are required.');
        setLoading(false);
        return;
      }
      localStorage.setItem('datacore_admin_token', data.access);
      localStorage.setItem('datacore_admin_user', JSON.stringify(data.user));
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Authentication failed. Please check credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@datacore.io');
    setPassword('AdminPassword123!');
  };

  return (
    <div className="min-h-screen bg-obsidian-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-brand-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyber-cyan text-white shadow-glow-brand mb-4">
            <Zap className="w-7 h-7 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">DataCore Engine</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-wider">
            Real-Time Concurrency & Transaction Observability
          </p>
        </div>

        {/* Card */}
        <div className="bg-obsidian-900/90 border border-white/[0.08] rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-base font-bold text-white tracking-tight">Administrator Authentication</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Authoritative access for database locks & ledger invariants
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center space-x-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Operator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@datacore.io"
                  className="w-full pl-10 pr-4 py-2.5 bg-obsidian-950 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 font-mono transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Access Token / Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-obsidian-950 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 font-mono transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-mono font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-glow-brand"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Command Center'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Demo: <strong className="text-slate-300">admin@datacore.io</strong></span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-2"
            >
              Auto-Fill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
