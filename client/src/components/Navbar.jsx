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
    <nav className="sticky top-0 z-50 bg-[#0A0915]/85 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          {/* Logo & Main nav */}
          <div className="flex items-center space-x-6 sm:space-x-8">
            <Link to="/" className="flex items-center space-x-2.5 text-white font-semibold text-lg tracking-tight group">
              <div className="w-7 h-7 rounded bg-brand-600 group-hover:bg-brand-500 text-white flex items-center justify-center font-mono font-bold text-xs shadow-glow-sm transition-all border border-brand-400/30">
                LX
              </div>
              <span className="font-semibold text-white tracking-tight">
                Lost<span className="text-brand-400">X</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/browse"
                className={`flex items-center px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  isActive('/browse')
                    ? 'text-brand-300 bg-brand-500/15 border border-brand-500/30 font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Search className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Browse registry
              </Link>

              {user && (
                <>
                  <Link
                    to="/my-reports"
                    className={`flex items-center px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                      isActive('/my-reports')
                        ? 'text-brand-300 bg-brand-500/15 border border-brand-500/30 font-medium'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    My reports
                  </Link>

                  <Link
                    to="/my-claims"
                    className={`flex items-center px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                      isActive('/my-claims')
                        ? 'text-brand-300 bg-brand-500/15 border border-brand-500/30 font-medium'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    My claims
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/admin')
                      ? 'text-violet-300 bg-violet-500/15 border border-violet-500/30 font-medium'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-brand-400" />
                  Administration
                </Link>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/report"
              className="inline-flex items-center px-3.5 py-1.5 rounded-md bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-medium shadow-glow-sm border border-brand-400/40 transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              Report item
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                {/* Notification Bell */}
                <Link
                  to="/notifications"
                  className="relative p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[10px] font-bold text-white bg-brand-500 rounded-full font-mono shadow-glow-sm">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-1 rounded-md hover:bg-white/[0.05] focus:outline-none"
                  >
                    <div className="w-7 h-7 rounded-full bg-violet-500/20 text-brand-300 border border-brand-500/40 flex items-center justify-center font-medium text-xs font-mono">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-medium text-slate-300 max-w-[120px] truncate">
                      {user.name}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 rounded-lg glass-panel py-1.5 z-50 animate-reveal shadow-2xl border border-white/[0.12]"
                      onMouseLeave={() => setUserMenuOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-white/[0.08]">
                        <p className="text-[10px] text-slate-400 font-mono">Signed in as</p>
                        <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                            admin
                          </span>
                        )}
                      </div>

                      <Link
                        to="/my-reports"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-3 py-1.5 text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white"
                      >
                        <FileText className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        My reports
                      </Link>

                      <Link
                        to="/my-claims"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-3 py-1.5 text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        My claims
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin/claims"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center px-3 py-1.5 text-xs text-brand-300 hover:bg-white/[0.06] font-medium"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 mr-2 text-brand-400" />
                          Review claims queue
                        </Link>
                      )}

                      <div className="border-t border-white/[0.08] my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5 mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-md hover:bg-white/[0.05] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-500 rounded-md transition-all shadow-glow-sm border border-brand-400/30"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            {user && (
              <Link to="/notifications" className="p-1.5 relative text-slate-400">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full shadow-glow-sm"></span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.05]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-[#0A0915]/95 backdrop-blur-md px-4 pt-3 pb-5 space-y-2.5 animate-reveal">
          <Link
            to="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center w-full py-2 rounded-md bg-brand-600 text-white font-medium text-xs shadow-glow-sm border border-brand-400/30"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            Report item
          </Link>

          <Link
            to="/browse"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-xs font-medium text-slate-300 hover:text-white"
          >
            Browse registry
          </Link>

          {user ? (
            <>
              <Link
                to="/my-reports"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-medium text-slate-300 hover:text-white"
              >
                My reports
              </Link>
              <Link
                to="/my-claims"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-medium text-slate-300 hover:text-white"
              >
                My claims
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-xs font-medium text-brand-300"
                >
                  Administration
                </Link>
              )}
              <div className="pt-2 border-t border-white/[0.08]">
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-1 text-xs text-rose-400 font-medium"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-white/[0.08] flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-1.5 rounded-md border border-white/[0.12] text-xs font-medium text-slate-300 hover:bg-white/[0.05]"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-1.5 rounded-md bg-brand-600 text-xs font-medium text-white shadow-glow-sm"
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
