import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E4E6EF] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="font-mono font-bold text-xs text-white tracking-tighter">LX</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">LostX</span>
          </div>

          <div className="flex items-center gap-5 text-xs text-gray-500">
            <Link to="/browse" className="hover:text-gray-900 transition-colors">Browse</Link>
            <Link to="/report" className="hover:text-gray-900 transition-colors">Report</Link>
            <Link to="/login" className="hover:text-gray-900 transition-colors">Sign in</Link>
          </div>

          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} LostX · Campus Property Registry
          </p>
        </div>
      </div>
    </footer>
  );
}