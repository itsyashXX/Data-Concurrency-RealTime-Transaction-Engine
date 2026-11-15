import React from 'react';
import { CustomerMobileApp } from '../components/CustomerMobileApp';
import { Smartphone, Zap, ShieldCheck, ArrowRight, BookOpen, Layers, ExternalLink, Download } from 'lucide-react';

export const CustomerSimulator: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 mb-2">
              <Smartphone className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Customer Mobile Application (Web Simulator)
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">Live Customer Wallet & Transaction Client</h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              This interactive client mirrors the Flutter customer app. It communicates directly with the live
              Django backend (<code>/api/accounts/</code>, <code>/api/transactions/</code>) and commits double-entry
              ledger records into the database in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/preview.html"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Fullscreen Preview</span>
            </a>
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Render Live</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Phone + Side Information & Lab Bridge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Phone Mockup */}
        <div className="lg:col-span-6 flex justify-center bg-slate-900/50 border border-slate-800/80 rounded-2xl py-4">
          <CustomerMobileApp />
        </div>

        {/* Right Column: Demonstration Guide & Real-Time Sync Guide */}
        <div className="lg:col-span-6 space-y-4">
          {/* Card 1: How to test */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-white font-semibold text-sm">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Interactive Demonstration Steps</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2.5 list-disc list-inside">
              <li>
                <strong className="text-white">1-Click Sign In:</strong> Click <span className="text-blue-400">Alice (Sender)</span> or <span className="text-emerald-400">Bob (Receiver)</span> to switch between test customer wallets.
              </li>
              <li>
                <strong className="text-white">Execute a Real Transfer:</strong> Click <strong>Transfer</strong>, enter an amount (e.g. ₹250.00), select your concurrency strategy (Pessimistic Locking is default), and authorize.
              </li>
              <li>
                <strong className="text-white">Idempotency & Duplicate Suppression:</strong> Notice the auto-generated <code>Idempotency-Key</code>. Re-submitting the exact same transfer with that key will return the cached result with zero duplicate charge.
              </li>
              <li>
                <strong className="text-white">Double-Entry Verification:</strong> Once sent, navigate to the <span className="text-blue-400">Transactions</span> or <span className="text-blue-400">Consistency</span> pages in the left sidebar to see the mathematical debit/credit records matching across accounts.
              </li>
            </ul>
          </div>

          {/* Card 2: Technical Architecture Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-white font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Database Guarantees Enforced</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Ledger Invariant</span>
                <span className="text-white font-semibold mt-1 block">Debits == Credits</span>
                <p className="text-[10px] text-slate-400 mt-1">Zero sum money movement</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Row Lock Strategy</span>
                <span className="text-white font-semibold mt-1 block">Canonical SELECT FOR UPDATE</span>
                <p className="text-[10px] text-slate-400 mt-1">Eliminates deadlocks</p>
              </div>
            </div>
          </div>

          {/* Card 3: Quick Links */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <span className="text-xs font-semibold text-slate-300 block mb-2">Explore Related Platform Views:</span>
            <div className="flex flex-wrap gap-2">
              <a
                href="/transactions"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition"
              >
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Live Transactions</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </a>
              <a
                href="/race-lab"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Race-Condition Lab</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
