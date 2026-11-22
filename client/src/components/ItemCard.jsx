import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, Sparkles } from 'lucide-react';
import { StatusBadge, TypeBadge } from './Badge';
import { CATEGORIES } from '../constants';

export default function ItemCard({ item, matchScore }) {
  const categoryLabel = CATEGORIES.find((c) => c.value === item.category)?.label || item.category;

  const formattedDate = new Date(item.date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Link
      to={`/items/${item._id}`}
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden relative"
    >
      {/* Optional match score badge */}
      {typeof matchScore === 'number' && (
        <div className="absolute top-3 right-3 z-10 flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-md">
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          {matchScore}% Match
        </div>
      )}

      {/* Item Image or fallback thumbnail */}
      <div className="w-full h-44 bg-slate-100 flex items-center justify-center overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-300">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className={`w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-50 to-slate-100 ${
            item.imageUrl ? 'hidden' : 'flex'
          }`}
        >
          <Tag className="w-10 h-10 mb-1 opacity-40 text-slate-400" />
          <span className="text-xs font-medium text-slate-400">{categoryLabel}</span>
        </div>

        {/* Type badge on top left */}
        <div className="absolute top-3 left-3">
          <TypeBadge type={item.type} />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 truncate">
              {categoryLabel}
            </span>
            <StatusBadge status={item.status} />
          </div>

          <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 text-base">
            {item.title}
          </h3>

          <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Location & Date footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center truncate max-w-[140px]" title={item.location}>
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 flex-shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>

          <div className="flex items-center text-slate-400">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
