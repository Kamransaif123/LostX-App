import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Clock,
  Compass
} from 'lucide-react';
import api from '../api';
import ItemCard from '../components/ItemCard';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentLost, setRecentLost] = useState([]);
  const [recentFound, setRecentFound] = useState([]);
  const [stats, setStats] = useState({ users: 0, lost: 0, found: 0, recovered: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lostRes, foundRes, statsRes] = await Promise.allSettled([
          api.get('/items?type=lost&limit=4'),
          api.get('/items?type=found&limit=4'),
          api.get('/admin/stats')
        ]);

        if (lostRes.status === 'fulfilled' && lostRes.value.data?.items) {
          setRecentLost(lostRes.value.data.items);
        }
        if (foundRes.status === 'fulfilled' && foundRes.value.data?.items) {
          setRecentFound(foundRes.value.data.items);
        }
        if (statsRes.status === 'fulfilled' && statsRes.value.data?.stats) {
          setStats(statsRes.value.data.stats);
        }
      } catch (e) {
        console.error('Home data load error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
            Smart Rule-Based Matching for Campus Communities
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Lost something on campus? <br className="hidden sm:inline" />
            <span className="text-indigo-600">Find it. Verify it. Get it back.</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            LostX connects lost and found reports using intelligent category, location, date, and keyword matching — protected by private detail verification.
          </p>

          {/* Quick Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2 bg-white p-2 rounded-2xl shadow-lg border border-slate-200/80"
          >
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="What did you lose? e.g. Fossil wallet, AirPods, ID card..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm rounded-xl focus:outline-none text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-200"
            >
              Search
            </button>
          </form>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/report?type=lost"
              className="inline-flex items-center px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-200 transition-all hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              I Lost Something
            </Link>
            <Link
              to="/report?type=found"
              className="inline-flex items-center px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-200 transition-all hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              I Found Something
            </Link>
            <Link
              to="/browse"
              className="inline-flex items-center px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 transition-all"
            >
              Browse All Reports
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <div className="text-3xl font-black text-indigo-600">{stats.lost || recentLost.length}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Lost Reports</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <div className="text-3xl font-black text-teal-600">{stats.found || recentFound.length}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Found Reports</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <div className="text-3xl font-black text-purple-600">{stats.recovered || '5+'}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Items Recovered</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <div className="text-3xl font-black text-emerald-600">100%</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Safe Verification</div>
          </div>
        </div>

        {/* How It Works Section */}
        <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">How LostX Works</h2>
            <p className="text-sm text-slate-500 mt-2">
              A privacy-first 3-step verification system ensuring found items reach their rightful owners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-start space-y-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base">Report & Auto-Match</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When you submit a report, our rule-based engine scores candidate items against category, campus location, date window, and title keywords.
              </p>
            </div>

            <div className="flex flex-col items-start space-y-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base">Private Detail Shield</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The finder stores a secret verification detail (e.g. wallpaper, ID digits, keychain). It is hidden from public view and only visible to administrators.
              </p>
            </div>

            <div className="flex flex-col items-start space-y-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base">Claim, Verify & Handover</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The owner describes the hidden details in a claim. Admin verifies the match, approves the claim, and safely reveals the handover location!
              </p>
            </div>
          </div>
        </section>

        {/* Recently Reported Found Items */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recently Found Items</h2>
              <p className="text-xs text-slate-500 mt-0.5">Found something that might be yours? Submit a claim.</p>
            </div>
            <Link
              to="/browse?type=found"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              View all found <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentFound.length > 0 ? (
              recentFound.map((item) => <ItemCard key={item._id} item={item} />)
            ) : (
              <div className="col-span-4 text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
                No found items reported yet.
              </div>
            )}
          </div>
        </section>

        {/* Recently Reported Lost Items */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recently Lost Items</h2>
              <p className="text-xs text-slate-500 mt-0.5">Keep an eye out for these items around campus.</p>
            </div>
            <Link
              to="/browse?type=lost"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              View all lost <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentLost.length > 0 ? (
              recentLost.map((item) => <ItemCard key={item._id} item={item} />)
            ) : (
              <div className="col-span-4 text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
                No lost items reported yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
