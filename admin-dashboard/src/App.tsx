import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { Transactions } from './pages/Transactions';
import { Concurrency } from './pages/Concurrency';
import { RaceLab } from './pages/RaceLab';
import { DuplicateDetection } from './pages/DuplicateDetection';
import { Consistency } from './pages/Consistency';
import { Users } from './pages/Users';
import { AuditLogs } from './pages/AuditLogs';
import { CustomerSimulator } from './pages/CustomerSimulator';

const ProtectedLayout: React.FC = () => {
  const token = localStorage.getItem('datacore_admin_token');
  const userJson = localStorage.getItem('datacore_admin_user');
  const user = userJson ? JSON.parse(userJson) : null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500/15 selection:text-indigo-900 light-canvas">
      <Sidebar userEmail={user?.email} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="DataCore Administration" subtitle="Centralized Real-Time Engine Observability" />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/concurrency" element={<Concurrency />} />
          <Route path="/race-lab" element={<RaceLab />} />
          <Route path="/duplicates" element={<DuplicateDetection />} />
          <Route path="/consistency" element={<Consistency />} />
          <Route path="/users" element={<Users />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/customer-app" element={<CustomerSimulator />} />
        </Route>

        {/* Standalone Direct Customer View */}
        <Route path="/customer" element={<CustomerSimulator />} />
        <Route path="/app" element={<CustomerSimulator />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
