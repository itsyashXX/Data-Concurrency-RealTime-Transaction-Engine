import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden light-canvas">
      {/* Background ambient mesh orbs */}
      <div className="absolute top-1/4 -left-20 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-[450px] h-[450px] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.08 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 text-white shadow-lg shadow-indigo-200 mb-4 cursor-pointer"
          >
            <Zap className="w-7 h-7 text-white fill-white" />
          </motion.div>
          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">DataCore</h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              CORE v3.0
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 font-mono uppercase tracking-wider font-medium">
            Real-Time Concurrency & Transaction Observability
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-600/50 to-transparent"></div>

          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Operator Authorization</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure administrative access for database locks & ledger proofs
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Admin Identifier
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@datacore.io"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Security Key / Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-mono font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md shadow-indigo-200"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Command Center'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Default: <strong className="text-slate-700">admin@datacore.io</strong></span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-indigo-600 hover:text-indigo-800 font-bold underline underline-offset-2 transition-colors"
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
