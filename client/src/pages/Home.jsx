import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
  Lock,
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
      {/* Hero Section */}
      <section className="bg-[#F7F8FC] border-b border-[#E4E6EF] py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
            Lost something on campus?
          </h1>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-brand-600 mt-1">
            Find it. Verify it. Get it back.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            LostX connects lost and found reports using intelligent category, location, date, and
            keyword matching — protected by private detail verification.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-0 bg-white border border-[#E4E6EF] rounded-lg shadow-sm overflow-hidden focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all"
          >
            <div className="relative flex-1 w-full flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="What did you lose? e.g. Fossil wallet, AirPods, ID card..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm bg-transparent text-gray-900 focus:outline-none placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
            >
              Search
            </button>
          </form>

          {/* CTA Row */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-3">
            <Link
              to="/report?type=lost"
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Report a lost item
            </Link>
            <Link
              to="/report?type=found"
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Report a found item
            </Link>
            <Link
              to="/browse"
              className="inline-flex items-center px-5 py-2.5 rounded-full border border-[#E4E6EF] bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
            >
              Browse all reports
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="card p-5 text-center">
            <div className="text-3xl font-bold text-rose-500">
              {stats.lost}
            </div>
            <div className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">Lost Reports</div>
          </div>
          <div className="card p-5 text-center">
            <div className="text-3xl font-bold text-emerald-500">
              {stats.found}
            </div>
            <div className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">Found Reports</div>
          </div>
          <div className="card p-5 text-center">
            <div className="text-3xl font-bold text-brand-600">
              {stats.recovered}
            </div>
            <div className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">Items Recovered</div>
          </div>
        </div>

        {/* Recently Found Items */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EF]">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Recently Found Items
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Found something that might be yours? Submit a claim.
              </p>
            </div>
            <Link
              to="/browse?type=found"
              className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center"
            >
              View all found <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card rounded-lg p-3 space-y-3 animate-pulse">
                  <div className="w-full h-40 bg-gray-100 rounded-md"></div>
                  <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-100 rounded w-full"></div>
                </div>
              ))
            ) : recentFound.length > 0 ? (
              recentFound.map((item) => <ItemCard key={item._id} item={item} />)
            ) : (
              <div className="col-span-full text-center py-10 card p-6 space-y-2">
                <p className="text-sm text-gray-500">No found items currently listed.</p>
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

        {/* Recently Lost Items */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EF]">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Recently Lost Items
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Reported by students and staff looking for missing belongings.
              </p>
            </div>
            <Link
              to="/browse?type=lost"
              className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center"
            >
              View all lost <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card rounded-lg p-3 space-y-3 animate-pulse">
                  <div className="w-full h-40 bg-gray-100 rounded-md"></div>
                  <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-100 rounded w-full"></div>
                </div>
              ))
            ) : recentLost.length > 0 ? (
              recentLost.map((item) => <ItemCard key={item._id} item={item} />)
            ) : (
              <div className="col-span-full text-center py-10 card p-6 space-y-2">
                <p className="text-sm text-gray-500">No active lost reports.</p>
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

        {/* How LostX Works */}
        <section className="card p-6 sm:p-10 space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How LostX Works</h2>
            <p className="text-sm text-gray-500 mt-2">
              A privacy-first 3-step verification system ensuring found items reach their rightful owners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-lg bg-[#F7F8FC] border border-[#E4E6EF] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Report & Auto-Match</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  When you submit a report, our rule-based engine scores candidate items against category, campus location, date window, and title keywords.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-lg bg-[#F7F8FC] border border-[#E4E6EF] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Private Detail Shield</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  The finder stores a secret verification detail (e.g. wallpaper, ID digits, keychain). It is hidden from public view and only visible to administrators.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-lg bg-[#F7F8FC] border border-[#E4E6EF] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Claim, Verify & Handover</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  The owner describes the hidden details in a claim. Admin verifies the match, approves the claim, and safely reveals the handover location!
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
