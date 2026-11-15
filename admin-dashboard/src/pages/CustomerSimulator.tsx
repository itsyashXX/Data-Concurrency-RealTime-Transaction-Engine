import React from 'react';
import { CustomerMobileApp } from '../components/CustomerMobileApp';
import { Smartphone, Zap, ShieldCheck, ArrowRight, BookOpen, Layers, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CustomerSimulator: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-obsidian-900/90 border border-white/[0.08] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyber-cyan mb-2">
              <Smartphone className="w-5 h-5" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                Customer Mobile Application (Web Simulator)
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Live Customer Wallet Client</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              This interactive client directly triggers the live Django backend (<code>/api/accounts/</code>, <code>/api/transactions/</code>) and commits double-entry ledger records into the PostgreSQL database in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/preview.html"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-brand transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Fullscreen Preview</span>
            </a>
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Render Live</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Phone + Side Information & Lab Bridge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Phone Mockup */}
        <div className="lg:col-span-6 flex justify-center bg-obsidian-900/40 border border-white/[0.06] rounded-3xl py-6 shadow-2xl">
          <CustomerMobileApp />
        </div>

        {/* Right Column: Demonstration Guide & Real-Time Sync Guide */}
        <div className="lg:col-span-6 space-y-4">
          {/* Card 1: How to test */}
          <div className="bg-obsidian-900/90 border border-white/[0.08] rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center space-x-2 text-white font-bold text-sm tracking-tight">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Interactive Demonstration Steps</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2.5 list-disc list-inside leading-relaxed">
              <li>
                <strong className="text-white">1-Click Sign In:</strong> Click <span className="text-brand-400 font-medium">Alice</span> or <span className="text-emerald-400 font-medium">Bob</span> fast-login chips to switch wallets instantly.
              </li>
              <li>
                <strong className="text-white">New User Registration:</strong> Click <strong>Register</strong> in the wallet, fill in a name and password. You will receive an initial ₹10,000 balance and a unique UPI ID (e.g. <code>david@dc</code>).
              </li>
              <li>
                <strong className="text-white">Instant Admin Sync:</strong> As soon as you register, check the <span className="text-brand-400 font-semibold">User Management</span> tab in the sidebar — the new account appears within 4 seconds with zero reload!
              </li>
              <li>
                <strong className="text-white">Execute a Real Transfer:</strong> Click <strong>Transfer</strong>, select a recipient (Bob or UPI), choose a concurrency lock strategy, and tap Authorize.
              </li>
            </ul>
          </div>

          {/* Card 2: Technical Architecture Info */}
          <div className="bg-obsidian-900/90 border border-white/[0.08] rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center space-x-2 text-white font-bold text-sm tracking-tight">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Database Guarantees Enforced</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-obsidian-950/80 rounded-xl border border-white/[0.06]">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Ledger Invariant</span>
                <span className="text-white font-semibold mt-1 block">Debits == Credits</span>
                <p className="text-[10px] text-slate-500 mt-1">Zero-sum balance invariant</p>
              </div>
              <div className="p-3 bg-obsidian-950/80 rounded-xl border border-white/[0.06]">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Row Lock Strategy</span>
                <span className="text-white font-semibold mt-1 block">SELECT FOR UPDATE</span>
                <p className="text-[10px] text-slate-500 mt-1">Deterministic ordering eliminates deadlocks</p>
              </div>
            </div>
          </div>

          {/* Card 3: Quick Links */}
          <div className="bg-obsidian-900/90 border border-white/[0.08] rounded-2xl p-5 shadow-xl">
            <span className="text-xs font-mono font-semibold text-slate-300 block mb-3 uppercase tracking-wider">
              Explore Related Observability Views:
            </span>
            <div className="flex flex-wrap gap-2.5">
              <Link
                to="/transactions"
                className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl bg-obsidian-950 hover:bg-obsidian-850 border border-white/[0.08] text-xs font-mono text-slate-200 transition"
              >
                <Layers className="w-3.5 h-3.5 text-brand-400" />
                <span>Live Transactions</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </Link>
              <Link
                to="/race-lab"
                className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl bg-obsidian-950 hover:bg-obsidian-850 border border-white/[0.08] text-xs font-mono text-slate-200 transition"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Race-Condition Lab</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSimulator;
