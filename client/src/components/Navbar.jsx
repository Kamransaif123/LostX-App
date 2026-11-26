import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, ChevronDown, LogOut, FileText, Shield, Search, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, logout, unreadCount } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-[#E4E6EF] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-sm">
              <span className="font-mono font-bold text-sm text-white tracking-tighter">LX</span>
            </div>
            <span className="font-bold text-gray-900 text-base tracking-tight hidden sm:block">LostX</span>
          </Link>

          {/* Center nav links — desktop */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/browse"
              className="flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-[#EEF0F8] transition-colors"
            >
              <Search className="w-4 h-4 mr-1.5 text-gray-400" />
              Browse items
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Report button */}
                <Link
                  to="/report"
                  className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium transition-colors shadow-sm"
                >
                  Report item
                </Link>

                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-[#EEF0F8] transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-[#EEF0F8] border border-transparent hover:border-[#E4E6EF] transition-all"
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block max-w-[90px] truncate">{user.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl border border-[#E4E6EF] shadow-md py-1 z-20">
                        <div className="px-3 py-2 border-b border-[#E4E6EF] mb-1">
                          <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                        </div>

                        <Link
                          to="/my-reports"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-[#EEF0F8] hover:text-gray-900 transition-colors"
                        >
                          <FileText className="w-4 h-4 mr-2 text-gray-400" /> My reports
                        </Link>
                        <Link
                          to="/my-claims"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-[#EEF0F8] hover:text-gray-900 transition-colors"
                        >
                          <Shield className="w-4 h-4 mr-2 text-gray-400" /> My claims
                        </Link>

                        {isAdmin && (
                          <>
                            <div className="border-t border-[#E4E6EF] my-1" />
                            <Link
                              to="/admin"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center px-3 py-1.5 text-sm text-brand-700 hover:bg-brand-50 transition-colors"
                            >
                              <Shield className="w-4 h-4 mr-2 text-brand-500" /> Admin dashboard
                            </Link>
                          </>
                        )}

                        <div className="border-t border-[#E4E6EF] my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-2" /> Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/report"
                  className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium transition-colors shadow-sm"
                >
                  Report item
                </Link>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-[#EEF0F8] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg border border-[#E4E6EF] text-sm font-medium text-gray-700 hover:bg-[#EEF0F8] transition-colors"
                >
                  Register
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-[#EEF0F8] transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#E4E6EF] px-4 py-3 space-y-1.5">
          <Link to="/browse" onClick={() => setMenuOpen(false)} className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-[#EEF0F8]">
            <Search className="w-4 h-4 mr-2 text-gray-400" /> Browse items
          </Link>
          {user && (
            <>
              <Link to="/report" onClick={() => setMenuOpen(false)} className="flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-brand-600 text-white">
                Report item
              </Link>
              <Link to="/my-reports" onClick={() => setMenuOpen(false)} className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-[#EEF0F8]">
                <FileText className="w-4 h-4 mr-2 text-gray-400" /> My reports
              </Link>
              <Link to="/my-claims" onClick={() => setMenuOpen(false)} className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-[#EEF0F8]">
                <Shield className="w-4 h-4 mr-2 text-gray-400" /> My claims
              </Link>
              <button onClick={handleLogout} className="w-full text-left flex items-center px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50">
                <LogOut className="w-4 h-4 mr-2" /> Sign out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}