import React from 'react';

export function StatusBadge({ status }) {
  const configs = {
    open: { label: 'Open', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    matched: { label: 'Match Found', classes: 'bg-blue-50 text-blue-700 border-blue-200' },
    claimed: { label: 'Claimed', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
    recovered: { label: 'Recovered', classes: 'bg-purple-50 text-purple-700 border-purple-200' },
    archived: { label: 'Archived / Expired', classes: 'bg-slate-100 text-slate-600 border-slate-300' }
  };

  const current = configs[status] || { label: status, classes: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.classes}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {current.label}
    </span>
  );
}

export function TypeBadge({ type }) {
  const isLost = type === 'lost';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
        isLost ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-teal-100 text-teal-800 border border-teal-200'
      }`}
    >
      {isLost ? 'Lost Item' : 'Found Item'}
    </span>
  );
}

export function ClaimBadge({ status }) {
  const configs = {
    pending: { label: 'Pending Review', classes: 'bg-amber-100 text-amber-800 border-amber-200' },
    approved: { label: 'Approved', classes: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    rejected: { label: 'Rejected', classes: 'bg-rose-100 text-rose-800 border-rose-200' }
  };

  const current = configs[status] || { label: status, classes: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${current.classes}`}>
      {current.label}
    </span>
  );
}
