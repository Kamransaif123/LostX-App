import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import ItemCard from '../components/ItemCard';
import FilterBar from '../components/FilterBar';
import { ChevronLeft, ChevronRight, Inbox, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    status: searchParams.get('status') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    page: parseInt(searchParams.get('page'), 10) || 1
  });

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Sync state to URL search params
  useEffect(() => {
    const params = {};
    if (filters.q) params.q = filters.q;
    if (filters.type) params.type = filters.type;
    if (filters.category) params.category = filters.category;
    if (filters.location) params.location = filters.location;
    if (filters.status) params.status = filters.status;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.page > 1) params.page = filters.page;
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.q) queryParams.set('q', filters.q);
      if (filters.type) queryParams.set('type', filters.type);
      if (filters.category) queryParams.set('category', filters.category);
      if (filters.location) queryParams.set('location', filters.location);
      if (filters.status) queryParams.set('status', filters.status);
      if (filters.dateFrom) queryParams.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.set('dateTo', filters.dateTo);
      queryParams.set('page', filters.page || 1);
      queryParams.set('limit', 12);

      const res = await api.get(`/items?${queryParams.toString()}`);
      if (res.data?.success) {
        setItems(res.data.items);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Fetch items error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [
    filters.q,
    filters.type,
    filters.category,
    filters.location,
    filters.status,
    filters.dateFrom,
    filters.dateTo,
    filters.page
  ]);

  const handleResetFilters = () => {
    setFilters({
      q: '',
      type: '',
      category: '',
      location: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      page: 1
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Browse Campus Reports</h1>
          <p className="text-xs text-slate-500 mt-1">
            Search active lost and found listings across all campus locations.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Report Item
        </Link>
      </div>

      {/* Filter Component */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>
          Showing <strong className="text-slate-800">{items.length}</strong> of{' '}
          <strong className="text-slate-800">{pagination.total}</strong> items
        </span>
        {pagination.totalPages > 1 && (
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
        )}
      </div>

      {/* Grid of Items */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse">
              <div className="w-full h-40 bg-slate-200 rounded-xl"></div>
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-5 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No matching items found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We couldn't find any reports matching your search or filters. Try relaxing the filter criteria or report this item yourself.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              Clear Filters
            </button>
            <Link
              to="/report"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Report New Item
            </Link>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - pagination.page) <= 2 || p === 1 || p === pagination.totalPages)
            .map((p, idx, arr) => (
              <React.Fragment key={p}>
                {idx > 0 && p - arr[idx - 1] > 1 && (
                  <span className="text-xs text-slate-400 px-1">...</span>
                )}
                <button
                  onClick={() => handlePageChange(p)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                    pagination.page === p
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              </React.Fragment>
            ))}

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
