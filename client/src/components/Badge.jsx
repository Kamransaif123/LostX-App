import React from 'react';

export function StatusBadge({ status }) {
  const configs = {
    open: { label: 'Open', classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]' },
    matched: { label: 'Match Found', classes: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]' },
    claimed: { label: 'Claimed', classes: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]' },
    recovered: { label: 'Recovered', classes: 'bg-violet-500/10 text-violet-400 border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.15)]' },
    archived: { label: 'Archived', classes: 'bg-slate-800/60 text-slate-400 border-slate-700/50' }
  };

  const current = configs[status] || { label: status, classes: 'bg-slate-800/60 text-slate-300 border-slate-700' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border backdrop-blur-xs ${current.classes}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-80 animate-pulse"></span>
      {current.label}
    </span>
  );
}

export function TypeBadge({ type }) {
  const isLost = type === 'lost';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border backdrop-blur-xs ${
        isLost
          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]'
          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
      }`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-80"></span>
      {isLost ? 'Lost' : 'Found'}
    </span>
  );
}

export function ClaimBadge({ status }) {
  const configs = {
    pending: { label: 'Pending Review', classes: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    approved: { label: 'Approved', classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
    rejected: { label: 'Rejected', classes: 'bg-rose-500/15 text-rose-300 border-rose-500/30' }
  };

  const current = configs[status] || { label: status, classes: 'bg-slate-800/60 text-slate-400 border-slate-700' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${current.classes}`}>
      {current.label}
    </span>
  );
}
