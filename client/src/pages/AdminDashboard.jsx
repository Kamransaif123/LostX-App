import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import {
  ShieldCheck,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Inbox,
  Download
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data?.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Fetch admin stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await api.get('/admin/export/csv', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lostx-reports-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to export CSV report.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-reveal">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-500/15 text-brand-300 border border-brand-500/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-brand-400" />
            Administrator control center
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">System overview & telemetry</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor campus activity, approve owner verification claims, and manage recovered items.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="inline-flex items-center px-4 py-2 rounded-lg glass-card border border-white/[0.1] text-slate-300 hover:text-white hover:border-brand-500/40 text-xs font-medium transition-all disabled:opacity-50"
            title="Download CSV export of all campus lost and found reports"
          >
            <Download className="w-4 h-4 mr-1.5 text-brand-400" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>

          <Link
            to="/admin/claims"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium shadow-glow-sm hover:shadow-glow transition-all"
          >
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            Review claims queue ({stats?.pendingClaims || 0})
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="glass-panel p-6 rounded-xl border border-white/[0.08] shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total users</p>
            <h3 className="text-3xl font-bold text-white mt-1 font-mono">
              {loading ? '...' : stats?.users || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Registered campus members</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-white/[0.08] shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-rose-400">Lost reports</p>
            <h3 className="text-3xl font-bold text-white mt-1 font-mono">
              {loading ? '...' : stats?.lost || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Reported lost by students</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-white/[0.08] shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-400">Found reports</p>
            <h3 className="text-3xl font-bold text-white mt-1 font-mono">
              {loading ? '...' : stats?.found || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Reported found around campus</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-white/[0.08] shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-400">Pending claims</p>
            <h3 className="text-3xl font-bold text-white mt-1 font-mono">
              {loading ? '...' : stats?.pendingClaims || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting admin verification</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-white/[0.08] shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-cyan-400">Recovered items</p>
            <h3 className="text-3xl font-bold text-white mt-1 font-mono">
              {loading ? '...' : stats?.recovered || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Successfully returned to owners</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-white/[0.08] shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-brand-300">Total matches</p>
            <h3 className="text-3xl font-bold text-white mt-1 font-mono">
              {loading ? '...' : stats?.totalMatches || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Rule-based algorithm matches</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Admin Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="p-6 sm:p-8 rounded-xl glass-panel border border-brand-500/30 bg-brand-500/10 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <span className="text-[11px] font-medium text-brand-300">
              Verification desk
            </span>
            <h3 className="text-xl font-semibold text-white tracking-tight">Review verification claims</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md">
              Compare claimant submitted proof side-by-side with the finder's hidden private detail to approve genuine owners.
            </p>
          </div>
          <Link
            to="/admin/claims"
            className="self-start inline-flex items-center px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-all shadow-glow-sm relative z-10"
          >
            Open claims queue <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        <div className="p-6 sm:p-8 rounded-xl glass-panel border border-white/[0.08] flex flex-col justify-between space-y-6 shadow-xl">
          <div className="space-y-2">
            <span className="text-[11px] font-medium text-slate-400">
              Browse & moderate
            </span>
            <h3 className="text-xl font-semibold text-white tracking-tight">All campus listings</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Inspect any report on campus, delete spam or expired entries, and mark completed handovers as recovered.
            </p>
          </div>
          <Link
            to="/browse"
            className="self-start inline-flex items-center px-5 py-2.5 rounded-lg glass-card border border-white/[0.12] text-white hover:bg-white/[0.08] text-xs font-medium transition-all"
          >
            Explore listings <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
