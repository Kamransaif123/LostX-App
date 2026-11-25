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
    <div className="bg-white rounded-md border border-slate-200 p-4 space-y-3.5 shadow-sm">
      {/* Search Input & Type Tabs */}
      <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search keywords (e.g. wallet, keys, silver laptop...)"
            value={filters.q || ''}
            onChange={(e) => handleChange('q', e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-md border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors placeholder:text-slate-400"
          />
          {filters.q && (
            <button
              onClick={() => handleChange('q', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Type Toggle Pills */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-md self-start md:self-auto border border-slate-200/60">
          <button
            type="button"
            onClick={() => handleChange('type', '')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              !filters.type
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => handleChange('type', 'lost')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filters.type === 'lost'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lost
          </button>
          <button
            type="button"
            onClick={() => handleChange('type', 'found')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filters.type === 'found'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Found
          </button>
        </div>
      </div>

      {/* Dropdown Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full py-1.5 px-2.5 rounded-md border border-slate-300 bg-white text-slate-800 text-xs focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Campus location
          </label>
          <select
            value={filters.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full py-1.5 px-2.5 rounded-md border border-slate-300 bg-white text-slate-800 text-xs focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none"
          >
            <option value="">All locations</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full py-1.5 px-2.5 rounded-md border border-slate-300 bg-white text-slate-800 text-xs focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none"
          >
            <option value="">All statuses</option>
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
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Date from
            </label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleChange('dateFrom', e.target.value)}
              className="w-full py-1 px-2 rounded-md border border-slate-300 bg-white text-slate-800 text-xs focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="h-[31px] px-2.5 rounded-md border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1 font-medium text-xs transition-colors"
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
