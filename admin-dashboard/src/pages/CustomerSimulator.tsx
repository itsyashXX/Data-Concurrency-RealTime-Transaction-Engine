import React from 'react';
import { CustomerMobileApp } from '../components/CustomerMobileApp';
import { Smartphone, Zap, ShieldCheck, ArrowRight, BookOpen, Layers, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CustomerSimulator: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-700 mb-2">
              <Smartphone className="w-5 h-5" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                Customer Mobile Application (Web Simulator)
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Live Customer Wallet Client</h1>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              This interactive client directly triggers the live Django backend (<code>/api/accounts/</code>, <code>/api/transactions/</code>) and commits double-entry ledger records into the PostgreSQL database in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/preview.html"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Fullscreen Preview</span>
            </a>
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-medium shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Render Live</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Phone + Side Information & Lab Bridge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Phone Mockup */}
        <div className="lg:col-span-6 flex justify-center bg-slate-100/70 border border-slate-200 rounded-3xl py-6 shadow-sm">
          <CustomerMobileApp />
        </div>

        {/* Right Column: Demonstration Guide & Real-Time Sync Guide */}
        <div className="lg:col-span-6 space-y-4">
          {/* Card 1: How to test */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm tracking-tight">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Interactive Demonstration Steps</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2.5 list-disc list-inside leading-relaxed">
              <li>
                <strong className="text-slate-800">1-Click Sign In:</strong> Click <span className="text-indigo-700 font-semibold">Alice</span> or <span className="text-emerald-700 font-semibold">Bob</span> fast-login chips to switch wallets instantly.
              </li>
              <li>
                <strong className="text-slate-800">New User Registration:</strong> Click <strong>Register</strong> in the wallet, fill in a name and password. You will receive an initial ₹10,000 balance and a unique UPI ID (e.g. <code>david@dc</code>).
              </li>
              <li>
                <strong className="text-slate-800">Instant Admin Sync:</strong> As soon as you register, check the <span className="text-indigo-700 font-semibold">User Management</span> tab in the sidebar — the new account appears within 4 seconds with zero reload!
              </li>
              <li>
                <strong className="text-slate-800">Execute a Real Transfer:</strong> Click <strong>Transfer</strong>, select a recipient (Bob or UPI), choose a concurrency lock strategy, and tap Authorize.
              </li>
            </ul>
          </div>

          {/* Card 2: Technical Architecture Info */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm tracking-tight">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Database Guarantees Enforced</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-mono font-bold">Ledger Invariant</span>
                <span className="text-slate-800 font-semibold mt-1 block">Debits == Credits</span>
                <p className="text-[10px] text-slate-500 mt-1">Zero-sum balance invariant</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-mono font-bold">Row Lock Strategy</span>
                <span className="text-slate-800 font-semibold mt-1 block">SELECT FOR UPDATE</span>
                <p className="text-[10px] text-slate-500 mt-1">Deterministic ordering eliminates deadlocks</p>
              </div>
            </div>
          </div>

          {/* Card 3: Quick Links */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-mono font-bold text-slate-600 block mb-3 uppercase tracking-wider">
              Explore Related Observability Views:
            </span>
            <div className="flex flex-wrap gap-2.5">
              <Link
                to="/transactions"
                className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 transition"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Live Transactions</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </Link>
              <Link
                to="/race-lab"
                className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 transition"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                <span>Race-Condition Lab</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSimulator;
