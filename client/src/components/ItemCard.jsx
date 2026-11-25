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
      className="glass-card rounded-lg flex flex-col overflow-hidden relative group"
    >
      {/* Optional match score badge */}
      {typeof matchScore === 'number' && (
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-brand-600 text-white shadow-glow-sm border border-brand-400/40">
          <Sparkles className="w-3 h-3 mr-1 text-cyan-300" />
          {matchScore}% match
        </div>
      )}

      {/* Item Image or fallback thumbnail */}
      <div className="w-full h-44 bg-[#0B0A16] flex items-center justify-center overflow-hidden relative border-b border-white/[0.06]">
        {item.imageUrl ? (
          <img
            src={getImageUrl(item.imageUrl)}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className={`w-full h-full flex flex-col items-center justify-center text-slate-500 bg-[#0C0B18] ${
            item.imageUrl ? 'hidden' : 'flex'
          }`}
        >
          <Tag className="w-8 h-8 mb-1 opacity-40 text-violet-400/50" />
          <span className="text-xs font-mono text-slate-400">{categoryLabel}</span>
        </div>

        {/* Type badge on top left */}
        <div className="absolute top-2.5 left-2.5">
          <TypeBadge type={item.type} />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-mono text-violet-400/90 truncate tracking-wide">
              {categoryLabel}
            </span>
            <StatusBadge status={item.status} />
          </div>

          <h3 className="font-medium text-slate-100 group-hover:text-brand-300 transition-colors line-clamp-1 text-sm sm:text-base">
            {item.title}
          </h3>

          <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Location & Date footer */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center truncate max-w-[140px]" title={item.location}>
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500 flex-shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>

          <div className="flex items-center text-slate-400 font-mono text-[11px]">
            <Calendar className="w-3 h-3 mr-1 text-slate-500" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
