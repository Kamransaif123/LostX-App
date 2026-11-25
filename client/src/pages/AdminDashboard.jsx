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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-800 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Administrator Control Center
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview & Stats</h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor campus activity, approve owner verification claims, and manage recovered items.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="inline-flex items-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            title="Download CSV export of all campus lost and found reports"
          >
            <Download className="w-4 h-4 mr-1.5 text-slate-500" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>

          <Link
            to="/admin/claims"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-200 transition-all"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Review Claims Queue ({stats?.pendingClaims || 0})
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-md border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">
              {loading ? '...' : stats?.users || 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Registered campus members</p>
          </div>
          <div className="w-12 h-12 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-md border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-rose-500">Lost Reports</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">
              {loading ? '...' : stats?.lost || 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Reported lost by students</p>
          </div>
          <div className="w-12 h-12 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-md border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-600">Found Reports</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">
              {loading ? '...' : stats?.found || 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Reported found around campus</p>
          </div>
          <div className="w-12 h-12 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-md border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-500">Pending Claims</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">
              {loading ? '...' : stats?.pendingClaims || 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Awaiting admin verification</p>
          </div>
          <div className="w-12 h-12 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-md border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Recovered Items</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">
              {loading ? '...' : stats?.recovered || 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Successfully returned to owners</p>
          </div>
          <div className="w-12 h-12 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-md border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Total Matches</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">
              {loading ? '...' : stats?.totalMatches || 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Rule-based algorithm matches</p>
          </div>
          <div className="w-12 h-12 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Admin Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="p-6 sm:p-8 rounded-md bg-gradient-to-br from-brand-900 to-brand-900 text-white flex flex-col justify-between space-y-6 shadow-xl">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-200">
              Verification Desk
            </span>
            <h3 className="text-2xl font-black tracking-tight">Review Verification Claims</h3>
            <p className="text-xs text-brand-200 leading-relaxed max-w-md">
              Compare claimant submitted proof side-by-side with the finder's hidden private detail to approve genuine owners.
            </p>
          </div>
          <Link
            to="/admin/claims"
            className="self-start inline-flex items-center px-5 py-2.5 rounded-xl bg-white text-brand-900 text-xs font-bold hover:bg-brand-50 transition-colors shadow-md"
          >
            Open Claims Queue <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        <div className="p-6 sm:p-8 rounded-md bg-white border border-slate-200/80 flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Browse & Moderate
            </span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">All Campus Listings</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md">
              Inspect any report on campus, delete spam or expired entries, and mark completed handovers as recovered.
            </p>
          </div>
          <Link
            to="/browse"
            className="self-start inline-flex items-center px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-md"
          >
            Explore Listings <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
