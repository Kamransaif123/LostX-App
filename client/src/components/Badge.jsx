import React from 'react';

export function StatusBadge({ status }) {
  const map = {
    active:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    claimed:   'bg-brand-50 text-brand-700 border-brand-200',
    recovered: 'bg-teal-50 text-teal-700 border-teal-200',
    archived:  'bg-gray-100 text-gray-600 border-gray-200',
  };
  const cls = map[status] || 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );
}

export function TypeBadge({ type }) {
  const cls = type === 'lost'
    ? 'bg-rose-500 text-white'
    : 'bg-emerald-500 text-white';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${cls} shadow-sm`}>
      {type === 'lost' ? 'LOST ITEM' : 'FOUND ITEM'}
    </span>
  );
}

export function ClaimBadge({ status }) {
  const map = {
    pending:  'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  const cls = map[status] || 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );
}