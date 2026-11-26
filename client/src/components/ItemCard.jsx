import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag } from 'lucide-react';
import { StatusBadge, TypeBadge } from './Badge';
import { getImageUrl } from '../api';
import { CATEGORIES } from '../constants';

export default function ItemCard({ item, matchScore }) {
  const categoryLabel = CATEGORIES.find((c) => c.value === item.category)?.label || item.category;
  const formattedDate = new Date(item.date).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <Link
      to={`/items/${item._id}`}
      className="card flex flex-col overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-reveal"
    >
      {/* Image area */}
      <div className="relative bg-[#EEF0F8] flex items-center justify-center h-44 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={getImageUrl(item.imageUrl)}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className={`flex-col items-center justify-center text-gray-400 p-6 text-center ${item.imageUrl ? 'hidden' : 'flex'}`}>
          <Tag className="w-10 h-10 mb-1.5 opacity-30" />
          <span className="text-xs font-medium text-gray-500">{categoryLabel}</span>
        </div>

        <div className="absolute top-2.5 left-2.5">
          <TypeBadge type={item.type} />
        </div>

        {matchScore !== undefined && (
          <div className="absolute top-2.5 right-2.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-600 text-white shadow-sm">
              {matchScore}% match
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 space-y-2">
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-[11px] text-gray-400 font-medium">{categoryLabel}</span>
          <StatusBadge status={item.status} />
        </div>

        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{item.title}</h3>

        <div className="flex flex-col gap-1 mt-auto pt-2 border-t border-[#E4E6EF]">
          <div className="flex items-center text-[11px] text-gray-500">
            <MapPin className="w-3 h-3 mr-1.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center text-[11px] text-gray-500">
            <Calendar className="w-3 h-3 mr-1.5 text-gray-400 flex-shrink-0" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}