import React from 'react';
import { Compass, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-800 tracking-tight">LostX</span>
            <span className="text-xs text-slate-400">| Campus Lost & Found System</span>
          </div>

          <div className="text-xs text-slate-500 flex items-center space-x-6">
            <span>Built for campus communities</span>
            <span className="inline-flex items-center text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" />
              Private Detail Verification
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
