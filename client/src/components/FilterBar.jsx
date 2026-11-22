import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import { CATEGORIES, LOCATIONS, ITEM_STATUSES } from '../constants';

export default function FilterBar({ filters, setFilters, onReset }) {
  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const hasActiveFilters = Boolean(
    filters.q || filters.type || filters.category || filters.location || filters.status || filters.dateFrom || filters.dateTo
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Search Input & Type Tabs */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by keywords (e.g. wallet, keys, silver laptop...)"
            value={filters.q || ''}
            onChange={(e) => handleChange('q', e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
          />
          {filters.q && (
            <button
              onClick={() => handleChange('q', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Type Toggle Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => handleChange('type', '')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !filters.type
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Reports
          </button>
          <button
            type="button"
            onClick={() => handleChange('type', 'lost')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filters.type === 'lost'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lost
          </button>
          <button
            type="button"
            onClick={() => handleChange('type', 'found')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filters.type === 'found'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Found
          </button>
        </div>
      </div>

      {/* Dropdown Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
        {/* Category */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Campus Location
          </label>
          <select
            value={filters.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
          >
            <option value="">All Locations</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Lifecycle Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
          >
            <option value="">All Statuses</option>
            {ITEM_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter & Clear Action */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              From Date
            </label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleChange('dateFrom', e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="h-[34px] px-3 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 flex items-center gap-1 font-semibold transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
