import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Server, 
  Database, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Code2, 
  Cpu, 
  ShieldCheck, 
  Share2, 
  Heart, 
  Flame,
  Terminal
} from 'lucide-react';
import { checkBackendHealth } from '../api/client';

export default function Home() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastPing, setLastPing] = useState(null);
  const [latency, setLatency] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);
    const start = performance.now();
    const result = await checkBackendHealth();
    const end = performance.now();
    setLatency(Math.round(end - start));
    setHealthData(result);
    setLastPing(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 md:py-16">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -top-10 right-10 w-[300px] h-[250px] bg-purple-600/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Full-Stack Architecture Ready</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            FaithNova <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Social Platform</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Engineered with modern frontend components powered by <strong className="text-indigo-300 font-semibold">React & Vite</strong>, styled responsively with <strong className="text-sky-300 font-semibold">Tailwind CSS</strong>, with <strong className="text-amber-300 font-semibold">Lucide React</strong> icons and <strong className="text-rose-300 font-semibold">React Router</strong>. Connected to a scalable <strong className="text-red-400 font-semibold">Laravel</strong> backend and <strong className="text-blue-400 font-semibold">MySQL</strong> database.
          </p>

          {/* Call-to-action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/feed"
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-sm hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5"
            >
              <span>Explore Social Feed</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/database"
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-slate-800/80 text-slate-200 font-medium text-sm border border-slate-700/80 hover:bg-slate-800 hover:text-white transition-all hover:-translate-y-0.5"
            >
              <Database className="w-4 h-4 text-blue-400" />
              <span>Inspect MySQL</span>
            </Link>

            <button
              onClick={fetchStatus}
              disabled={loading}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-slate-900/80 text-slate-300 font-medium text-sm border border-slate-800 hover:border-indigo-500/40 transition-all"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Ping Backend API</span>
            </button>
          </div>
        </div>
      </section>

      {/* Live System Diagnostics / Status Card */}
      <section className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-800/80 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold font-heading text-white">Live System Connectivity</h2>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                healthData?.connected 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {healthData?.connected ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>Operational</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>Backend Offline</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Verifies communication between React Vite frontend and Laravel MySQL backend (/api/status).
            </p>
          </div>

          <div className="flex items-center gap-3">
            {latency !== null && (
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60 text-indigo-300">
                ⚡ {latency}ms latency
              </span>
            )}
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium hover:bg-indigo-600/30 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Now</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Frontend Framework</span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-lg font-bold text-white">React 19 (Vite)</div>
            <div className="text-xs text-cyan-400/90 mt-1">Tailwind CSS + Lucide Icons</div>
          </div>

          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Backend Server</span>
              <Server className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-lg font-bold text-white">
              {healthData?.connected ? `Laravel ${healthData.data?.laravel_version || '12/13'}` : 'Laravel 12/13'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {healthData?.connected ? `PHP ${healthData.data?.php_version}` : 'PHP 8.5.1 Environment'}
            </div>
          </div>

          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Database</span>
              <Database className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-lg font-bold text-white">MySQL 8.0+</div>
            <div className="text-xs text-blue-400 mt-1">Database: faithnova</div>
          </div>

          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Client Routing</span>
              <Cpu className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-lg font-bold text-white">React Router v7</div>
            <div className="text-xs text-purple-400 mt-1">Declarative SPA Navigation</div>
          </div>

        </div>

        {/* Response JSON Output */}
        <div className="bg-slate-950/90 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-x-auto">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-slate-400">
            <span className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Backend Response Payload (GET /api/status)</span>
            </span>
            <span>Last checked: {lastPing || 'Never'}</span>
          </div>
          <pre className="text-emerald-300 leading-relaxed">
            {healthData 
              ? JSON.stringify(healthData.data || healthData, null, 2) 
              : '// Click "Ping Backend API" to inspect connection'}
          </pre>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            Architecture Highlights
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Each component in the system is configured cleanly for high developer velocity and responsive user experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Modern React & Vite</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Fast hot module reloading (HMR), lightweight build configuration, and smooth client-side routing with React Router DOM.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Tailwind & Lucide Icons</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Responsive utility-first design system paired with 1,500+ pixel-perfect SVG icons from Lucide React for consistent UI.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Laravel & MySQL Engine</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Robust MVC architecture with Eloquent ORM, database migrations, Sanctum API tokens, and native MySQL driver support.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
