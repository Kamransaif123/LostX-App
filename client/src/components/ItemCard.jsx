import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, Sparkles } from 'lucide-react';
import { StatusBadge, TypeBadge } from './Badge';
import { CATEGORIES } from '../constants';
import { getImageUrl } from '../api';

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
      className="group bg-white rounded-md border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-150 flex flex-col overflow-hidden relative"
    >
      {/* Optional match score badge */}
      {typeof matchScore === 'number' && (
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-sm font-mono">
          <Sparkles className="w-3 h-3 mr-1" />
          {matchScore}% match
        </div>
      )}

      {/* Item Image or fallback thumbnail */}
      <div className="w-full h-44 bg-slate-100 flex items-center justify-center overflow-hidden relative border-b border-slate-100">
        {item.imageUrl ? (
          <img
            src={getImageUrl(item.imageUrl)}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className={`w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 ${
            item.imageUrl ? 'hidden' : 'flex'
          }`}
        >
          <Tag className="w-8 h-8 mb-1 opacity-30 text-slate-400" />
          <span className="text-xs font-medium text-slate-400">{categoryLabel}</span>
        </div>

        {/* Type badge on top left */}
        <div className="absolute top-2.5 left-2.5">
          <TypeBadge type={item.type} />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-medium text-slate-500 truncate">
              {categoryLabel}
            </span>
            <StatusBadge status={item.status} />
          </div>

          <h3 className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 text-sm sm:text-base">
            {item.title}
          </h3>

          <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Location & Date footer */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
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
