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
    <div className="card p-4 space-y-3.5">
      <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search keywords (e.g. wallet, keys, silver laptop...)"
            value={filters.q || ''}
            onChange={(e) => handleChange('q', e.target.value)}
            className="field-input w-full pl-9 pr-8 py-2 text-xs sm:text-sm"
          />
          {filters.q && (
            <button
              onClick={() => handleChange('q', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Type Toggle */}
        <div className="flex items-center bg-[#EEF0F8] p-0.5 rounded-lg self-start md:self-auto border border-[#E4E6EF]">
          <button
            type="button"
            onClick={() => handleChange('type', '')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              !filters.type ? 'bg-white text-gray-900 shadow-sm border border-[#E4E6EF]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >All</button>
          <button
            type="button"
            onClick={() => handleChange('type', 'lost')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filters.type === 'lost' ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >Lost</button>
          <button
            type="button"
            onClick={() => handleChange('type', 'found')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filters.type === 'found' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >Found</button>
        </div>
      </div>

      {/* Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-[#E4E6EF]">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
            className="field-input w-full py-1.5 px-2.5 text-xs"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Campus location</label>
          <select
            value={filters.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            className="field-input w-full py-1.5 px-2.5 text-xs"
          >
            <option value="">All locations</option>
            {LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            className="field-input w-full py-1.5 px-2.5 text-xs"
          >
            <option value="">All statuses</option>
            {ITEM_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Date from</label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleChange('dateFrom', e.target.value)}
              className="field-input w-full py-1 px-2 text-xs"
            />
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="h-[31px] px-2.5 rounded-lg border border-[#E4E6EF] text-gray-600 hover:bg-[#EEF0F8] flex items-center gap-1 text-xs font-medium transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}