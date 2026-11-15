import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen bg-void-950 flex items-center justify-center p-4 relative overflow-hidden aurora-canvas">
      {/* Background ambient aurora glow orbs */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-brand-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-aurora-cyan/15 rounded-full blur-[140px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-aurora-cyan via-brand-500 to-aurora-fuchsia text-white shadow-neon-cyan mb-4 cursor-pointer"
          >
            <Zap className="w-7 h-7 text-white fill-white" />
          </motion.div>
          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-2xl font-black text-white tracking-tight">DataCore</h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-aurora-cyan/15 text-aurora-cyan border border-aurora-cyan/30">
              ENGINE v3.0
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 font-mono uppercase tracking-wider">
            Real-Time Concurrency & Transaction Observability
          </p>
        </div>

        {/* Card */}
        <div className="bg-void-900/90 border border-white/[0.08] rounded-3xl p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-aurora-cyan/50 to-transparent"></div>

          <div className="mb-6">
            <h2 className="text-base font-bold text-white tracking-tight">Operator Authorization</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure administrative access for database locks & ledger proofs
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-aurora-pink/15 border border-aurora-pink/30 rounded-2xl flex items-center space-x-3 text-aurora-pink text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Admin Identifier
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@datacore.io"
                  className="w-full pl-10 pr-4 py-2.5 bg-void-950 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-aurora-cyan font-mono transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Security Key / Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-void-950 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-aurora-cyan font-mono transition-colors"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-brand-600 via-indigo-600 to-aurora-cyan hover:opacity-95 disabled:opacity-50 text-white text-xs font-mono font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-neon-violet"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Command Center'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Default: <strong className="text-slate-300">admin@datacore.io</strong></span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-aurora-cyan hover:text-white font-bold underline underline-offset-2 transition-colors"
            >
              Auto-Fill
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
