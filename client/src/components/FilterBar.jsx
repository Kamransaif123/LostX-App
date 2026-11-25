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
    <div className="glass-panel rounded-xl border border-white/[0.08] p-4 space-y-4 shadow-xl backdrop-blur-md">
      {/* Search Input & Type Tabs */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search keywords (e.g. wallet, keys, silver laptop...)"
            value={filters.q || ''}
            onChange={(e) => handleChange('q', e.target.value)}
            className="glass-input w-full pl-9 pr-8 py-2 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/50 transition-colors"
          />
          {filters.q && (
            <button
              onClick={() => handleChange('q', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Type Toggle Pills */}
        <div className="flex items-center bg-[#07060f]/60 p-1 rounded-lg self-start md:self-auto border border-white/[0.08]">
          <button
            type="button"
            onClick={() => handleChange('type', '')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              !filters.type
                ? 'bg-brand-600/30 text-brand-300 border border-brand-500/40 shadow-glow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => handleChange('type', 'lost')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filters.type === 'lost'
                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 shadow-glow-rose'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Lost
          </button>
          <button
            type="button"
            onClick={() => handleChange('type', 'found')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filters.type === 'found'
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-glow-emerald'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Found
          </button>
        </div>
      </div>

      {/* Dropdown Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-white/[0.06] text-xs">
        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
            className="glass-input w-full py-1.5 px-2.5 rounded-lg text-slate-200 bg-[#0f0d22] border border-white/[0.1] text-xs focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/50 outline-none"
          >
            <option value="" className="bg-[#0f0d22] text-slate-300">All categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value} className="bg-[#0f0d22] text-slate-300">
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Campus location
          </label>
          <select
            value={filters.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            className="glass-input w-full py-1.5 px-2.5 rounded-lg text-slate-200 bg-[#0f0d22] border border-white/[0.1] text-xs focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/50 outline-none"
          >
            <option value="" className="bg-[#0f0d22] text-slate-300">All locations</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc} className="bg-[#0f0d22] text-slate-300">
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            className="glass-input w-full py-1.5 px-2.5 rounded-lg text-slate-200 bg-[#0f0d22] border border-white/[0.1] text-xs focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/50 outline-none"
          >
            <option value="" className="bg-[#0f0d22] text-slate-300">All statuses</option>
            {ITEM_STATUSES.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#0f0d22] text-slate-300">
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter & Clear Action */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Date from
            </label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleChange('dateFrom', e.target.value)}
              className="glass-input w-full py-1 px-2.5 rounded-lg text-slate-200 bg-[#0f0d22] border border-white/[0.1] text-xs focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/50 outline-none"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="h-[31px] px-2.5 rounded-lg border border-white/[0.1] text-slate-300 hover:text-white hover:bg-white/[0.08] hover:border-brand-500/40 flex items-center gap-1 font-medium text-xs transition-all"
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
