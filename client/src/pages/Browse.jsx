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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-reveal">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">Browse campus registry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search active lost and found listings across all campus facilities.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center px-3.5 py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Report item
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
          Showing <strong className="text-slate-800 font-mono">{items.length}</strong> of{' '}
          <strong className="text-slate-800 font-mono">{pagination.total}</strong> items
        </span>
        {pagination.totalPages > 1 && (
          <span className="font-mono">
            Page {pagination.page} of {pagination.totalPages}
          </span>
        )}
      </div>

      {/* Grid of Items */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-md border border-slate-200 p-3 space-y-3 animate-pulse">
              <div className="w-full h-40 bg-slate-100 rounded-sm"></div>
              <div className="h-4 bg-slate-100 rounded w-1/3"></div>
              <div className="h-5 bg-slate-100 rounded w-3/4"></div>
              <div className="h-3 bg-slate-100 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-md border border-slate-200 p-8 sm:p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-10 h-10 rounded-md bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No matching items found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            No active reports match your criteria. Try adjusting or clearing your filters, or report the item to register it in the system.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Clear filters
            </button>
            <Link
              to="/report"
              className="px-3.5 py-1.5 rounded-md text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 transition-colors"
            >
              Report an item
            </Link>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-1.5 pt-4">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - pagination.page) <= 2 || p === 1 || p === pagination.totalPages)
            .map((p, idx, arr) => (
              <React.Fragment key={p}>
                {idx > 0 && p - arr[idx - 1] > 1 && (
                  <span className="text-xs text-slate-400 px-1 font-mono">...</span>
                )}
                <button
                  onClick={() => handlePageChange(p)}
                  className={`w-8 h-8 rounded-md text-xs font-mono font-medium transition-colors ${
                    pagination.page === p
                      ? 'bg-slate-900 text-white'
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
            className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
