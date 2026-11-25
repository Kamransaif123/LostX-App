import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  PlusCircle,
  Search,
  ShieldCheck,
  FileText,
  CheckCircle2,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, unreadCount, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          {/* Logo & Main nav */}
          <div className="flex items-center space-x-6 sm:space-x-8">
            <Link to="/" className="flex items-center space-x-2 text-slate-900 font-semibold text-lg tracking-tight">
              <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs tracking-tighter">
                LX
              </div>
              <span className="font-semibold text-slate-900 tracking-tight">
                Lost<span className="text-brand-600">X</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/browse"
                className={`flex items-center px-2.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  isActive('/browse')
                    ? 'text-brand-700 bg-brand-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Search className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                Browse registry
              </Link>

              {user && (
                <>
                  <Link
                    to="/my-reports"
                    className={`flex items-center px-2.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                      isActive('/my-reports')
                        ? 'text-brand-700 bg-brand-50 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    My reports
                  </Link>

                  <Link
                    to="/my-claims"
                    className={`flex items-center px-2.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                      isActive('/my-claims')
                        ? 'text-brand-700 bg-brand-50 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    My claims
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center px-2.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/admin')
                      ? 'text-brand-700 bg-brand-50 font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
                  Administration
                </Link>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/report"
              className="inline-flex items-center px-3.5 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-medium transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              Report item
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                {/* Notification Bell */}
                <Link
                  to="/notifications"
                  className="relative p-1.5 rounded-md text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[10px] font-bold text-white bg-brand-600 rounded-full font-mono">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-1 rounded-md hover:bg-slate-100 focus:outline-none"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-medium text-xs font-mono">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-medium text-slate-700 max-w-[120px] truncate">
                      {user.name}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-1.5 w-52 rounded-md bg-white shadow-lg border border-slate-200 py-1 z-50 animate-reveal"
                      onMouseLeave={() => setUserMenuOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-[11px] text-slate-400">Signed in as</p>
                        <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                            admin
                          </span>
                        )}
                      </div>

                      <Link
                        to="/my-reports"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <FileText className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        My reports
                      </Link>

                      <Link
                        to="/my-claims"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        My claims
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin/claims"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center px-3 py-1.5 text-xs text-brand-700 hover:bg-brand-50 font-medium"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 mr-2 text-brand-600" />
                          Review claims queue
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5 mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 rounded-md hover:bg-slate-50 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            {user && (
              <Link to="/notifications" className="p-1.5 relative text-slate-600">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-brand-600 rounded-full"></span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2.5 animate-reveal">
          <Link
            to="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center w-full py-2 rounded-md bg-brand-600 text-white font-medium text-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            Report item
          </Link>

          <Link
            to="/browse"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900"
          >
            Browse registry
          </Link>

          {user ? (
            <>
              <Link
                to="/my-reports"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900"
              >
                My reports
              </Link>
              <Link
                to="/my-claims"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900"
              >
                My claims
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-xs font-medium text-brand-700"
                >
                  Administration
                </Link>
              )}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-1 text-xs text-rose-600 font-medium"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-700"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-1.5 rounded-md bg-slate-900 text-xs font-medium text-white"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
