import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Bell,
  PlusCircle,
  Search,
  ShieldCheck,
  FileText,
  CheckCircle2,
  LogOut,
  User,
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
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Main nav */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 text-indigo-600 font-extrabold text-xl tracking-tight">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-slate-900 font-black text-2xl tracking-tight">
                Lost<span className="text-indigo-600">X</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/browse"
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/browse')
                    ? 'text-indigo-600 bg-indigo-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Search className="w-4 h-4 mr-1.5" />
                Browse Items
              </Link>

              {user && (
                <>
                  <Link
                    to="/my-reports"
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/my-reports')
                        ? 'text-indigo-600 bg-indigo-50 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-4 h-4 mr-1.5" />
                    My Reports
                  </Link>

                  <Link
                    to="/my-claims"
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/my-claims')
                        ? 'text-indigo-600 bg-indigo-50 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    My Claims
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/admin')
                      ? 'text-purple-700 bg-purple-50 font-semibold'
                      : 'text-purple-600 hover:text-purple-800 hover:bg-purple-50/60'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  Admin Panel
                </Link>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/report"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-300 transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Report Item
            </Link>

            {user ? (
              <div className="flex items-center space-x-3">
                {/* Notification Bell */}
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold text-white bg-rose-500 rounded-full animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-sm font-medium text-slate-800 max-w-[120px] truncate">
                      {user.name}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1"
                      onMouseLeave={() => setUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                            Administrator
                          </span>
                        )}
                      </div>

                      <Link
                        to="/my-reports"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <FileText className="w-4 h-4 mr-2 text-slate-400" />
                        My Reports
                      </Link>

                      <Link
                        to="/my-claims"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2 text-slate-400" />
                        My Claims
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin/claims"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 font-medium"
                        >
                          <ShieldCheck className="w-4 h-4 mr-2 text-purple-500" />
                          Review Claims Queue
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            {user && (
              <Link to="/notifications" className="p-2 relative text-slate-600">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center w-full py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-sm"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Report Item
          </Link>
          <Link
            to="/browse"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Browse Items
          </Link>
          {user ? (
            <>
              <Link
                to="/my-reports"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                My Reports
              </Link>
              <Link
                to="/my-claims"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                My Claims
              </Link>
              <Link
                to="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Notifications ({unreadCount})
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-purple-700 bg-purple-50"
                >
                  Admin Dashboard
                </Link>
              )}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-rose-600 font-medium"
                >
                  Sign Out ({user.name})
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg"
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
