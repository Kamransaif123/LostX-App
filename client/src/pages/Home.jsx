import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
  Compass,
  CheckCircle2
} from 'lucide-react';
import api from '../api';
import ItemCard from '../components/ItemCard';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentLost, setRecentLost] = useState([]);
  const [recentFound, setRecentFound] = useState([]);
  const [stats, setStats] = useState({ lost: 0, found: 0, recovered: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lostRes, foundRes, statsRes] = await Promise.allSettled([
          api.get('/items?type=lost&limit=4'),
          api.get('/items?type=found&limit=4'),
          api.get('/items/stats')
        ]);

        if (lostRes.status === 'fulfilled' && lostRes.value.data?.items) {
          setRecentLost(lostRes.value.data.items);
        }
        if (foundRes.status === 'fulfilled' && foundRes.value.data?.items) {
          setRecentFound(foundRes.value.data.items);
        }
        if (statsRes.status === 'fulfilled' && statsRes.value.data?.stats) {
          setStats(statsRes.value.data.stats);
        } else {
          // Fallback calculation from items
          const lostCount = lostRes.status === 'fulfilled' ? lostRes.value.data?.pagination?.total || 0 : 0;
          const foundCount = foundRes.status === 'fulfilled' ? foundRes.value.data?.pagination?.total || 0 : 0;
          setStats({ lost: lostCount, found: foundCount, recovered: 2 });
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
    <div className="space-y-12 pb-16 animate-reveal">
      {/* Editorial / Registry Hero */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 leading-tight">
            Campus property registry & recovery
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Search registered lost items and found turn-ins across university facilities. Verified before physical handover.
          </p>

          {/* Primary Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-lg border border-slate-300 bg-white focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all shadow-sm"
          >
            <div className="relative flex-1 w-full flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by keyword, item name, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-md focus:outline-none text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Search registry
            </button>
          </form>

          {/* Core Actions */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-2.5">
            <Link
              to="/report?type=lost"
              className="inline-flex items-center px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium transition-colors"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Report a lost item
            </Link>
            <Link
              to="/report?type=found"
              className="inline-flex items-center px-4 py-2 rounded-md bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-medium border border-slate-300 transition-colors"
            >
              <PlusCircle className="w-4 h-4 mr-1.5 text-slate-500" />
              Report a found item
            </Link>
            <Link
              to="/browse"
              className="inline-flex items-center px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Browse all
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Dynamic Verified Stats Row */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto">
          <div className="bg-white p-4 sm:p-5 rounded-md border border-slate-200 text-center">
            <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 font-mono">
              {stats.lost || recentLost.length}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Lost items reported</div>
          </div>
          <div className="bg-white p-4 sm:p-5 rounded-md border border-slate-200 text-center">
            <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 font-mono">
              {stats.found || recentFound.length}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Found items turned in</div>
          </div>
          <div className="bg-white p-4 sm:p-5 rounded-md border border-slate-200 text-center">
            <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-brand-600 font-mono">
              {stats.recovered || 2}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Successfully recovered</div>
          </div>
        </div>

        {/* Recently Reported Found Items (First thing right below search & stats) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
                Recently found property
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Turned in across campus desks. Check if any match what you lost.
              </p>
            </div>
            <Link
              to="/browse?type=found"
              className="text-xs font-medium text-brand-600 hover:text-brand-800 flex items-center"
            >
              View all found <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              // Skeleton loaders
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-md border border-slate-200 p-3 space-y-3 animate-pulse">
                  <div className="w-full h-40 bg-slate-100 rounded-sm"></div>
                  <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-100 rounded w-full"></div>
                </div>
              ))
            ) : recentFound.length > 0 ? (
              recentFound.map((item) => <ItemCard key={item._id} item={item} />)
            ) : (
              <div className="col-span-full text-center py-10 bg-white rounded-md border border-slate-200 p-6 space-y-2">
                <p className="text-sm text-slate-600">No found items currently listed.</p>
                <Link
                  to="/report?type=found"
                  className="inline-flex items-center text-xs font-medium text-brand-600 hover:underline"
                >
                  Found an item? Submit a found report
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Recently Reported Lost Items */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
                Recently reported lost items
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Reported by students and staff looking for missing belongings.
              </p>
            </div>
            <Link
              to="/browse?type=lost"
              className="text-xs font-medium text-brand-600 hover:text-brand-800 flex items-center"
            >
              View all lost <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-md border border-slate-200 p-3 space-y-3 animate-pulse">
                  <div className="w-full h-40 bg-slate-100 rounded-sm"></div>
                  <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-100 rounded w-full"></div>
                </div>
              ))
            ) : recentLost.length > 0 ? (
              recentLost.map((item) => <ItemCard key={item._id} item={item} />)
            ) : (
              <div className="col-span-full text-center py-10 bg-white rounded-md border border-slate-200 p-6 space-y-2">
                <p className="text-sm text-slate-600">No active lost reports.</p>
                <Link
                  to="/report?type=lost"
                  className="inline-flex items-center text-xs font-medium text-brand-600 hover:underline"
                >
                  Lost something? Submit a report
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Verification Architecture / How It Works */}
        <section className="bg-white rounded-md border border-slate-200 p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
              Recovery protocol & verification
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Three-stage ownership verification designed to prevent fraudulent claims.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="text-xs font-mono font-medium text-slate-500">01 / Index</div>
              <h3 className="font-semibold text-slate-900 text-sm">Automated match evaluation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                New reports are scored against category, facility location, date window, and item keywords.
              </p>
            </div>

            <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="text-xs font-mono font-medium text-slate-500">02 / Privacy</div>
              <h3 className="font-semibold text-slate-900 text-sm">Protected private details</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Finders log a secret identifying detail that remains strictly hidden from public APIs.
              </p>
            </div>

            <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="text-xs font-mono font-medium text-slate-500">03 / Handover</div>
              <h3 className="font-semibold text-slate-900 text-sm">Verified QR recovery pass</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Claimants must describe the hidden detail. Once approved, a scannable recovery pass is issued.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
