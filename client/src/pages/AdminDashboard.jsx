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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E6EF]">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
            Administrator control center
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">System overview & telemetry</h1>
          <p className="text-xs text-gray-500 mt-1">
            Monitor campus activity, approve owner verification claims, and manage recovered items.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-[#E4E6EF] text-gray-700 hover:text-gray-900 hover:border-brand-300 text-xs font-medium shadow-sm transition-all disabled:opacity-50"
            title="Download CSV export of all campus lost and found reports"
          >
            <Download className="w-4 h-4 mr-1.5 text-brand-600" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>

          <Link
            to="/admin/claims"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            Review claims queue ({stats?.pendingClaims || 0})
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Total users</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1 font-mono">
              {loading ? '...' : stats?.users || 0}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">Registered campus members</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-rose-600">Lost reports</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1 font-mono">
              {loading ? '...' : stats?.lost || 0}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">Reported lost by students</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
        </div>

        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-600">Found reports</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1 font-mono">
              {loading ? '...' : stats?.found || 0}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">Reported found around campus</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
        </div>

        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-600">Pending claims</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1 font-mono">
              {loading ? '...' : stats?.pendingClaims || 0}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">Awaiting admin verification</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-teal-600">Recovered items</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1 font-mono">
              {loading ? '...' : stats?.recovered || 0}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">Successfully returned to owners</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-brand-600">Total matches</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1 font-mono">
              {loading ? '...' : stats?.totalMatches || 0}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">Rule-based algorithm matches</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Admin Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="p-6 sm:p-8 rounded-xl bg-brand-600 text-white flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-2">
            <span className="text-[11px] font-medium text-brand-100 uppercase tracking-wider">
              Verification desk
            </span>
            <h3 className="text-xl font-bold tracking-tight">Review verification claims</h3>
            <p className="text-xs text-brand-100 leading-relaxed max-w-md">
              Compare claimant submitted proof side-by-side with the finder's hidden private detail to approve genuine owners.
            </p>
          </div>
          <Link
            to="/admin/claims"
            className="self-start inline-flex items-center px-5 py-2.5 rounded-lg bg-white text-brand-700 hover:bg-brand-50 text-xs font-semibold transition-colors shadow-sm"
          >
            Open claims queue <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        <div className="p-6 sm:p-8 rounded-xl bg-white border border-[#E4E6EF] flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-2">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              Browse & moderate
            </span>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">All campus listings</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-md">
              Inspect any report on campus, delete spam or expired entries, and mark completed handovers as recovered.
            </p>
          </div>
          <Link
            to="/browse"
            className="self-start inline-flex items-center px-5 py-2.5 rounded-lg border border-[#E4E6EF] bg-[#F7F8FC] text-gray-700 hover:bg-gray-100 hover:text-gray-900 text-xs font-semibold transition-colors"
          >
            Explore listings <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
