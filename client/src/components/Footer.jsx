import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0A0914] border-t border-white/[0.08] mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded bg-brand-600 text-white flex items-center justify-center font-mono font-bold text-[10px] shadow-glow-sm border border-brand-400/30">
              LX
            </div>
            <span className="font-semibold text-white text-sm tracking-tight">LostX</span>
            <span className="text-xs text-slate-500 font-mono">/ Campus Property Registry</span>
          </div>

          <div className="text-xs text-slate-400 flex items-center space-x-6">
            <span>Encrypted campus recovery network</span>
            <span className="inline-flex items-center text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              Private detail verification
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
