import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, X, ShieldAlert } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const from = location.state?.from?.pathname || '/browse';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 animate-reveal relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-600/15 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-sm w-full glass-panel rounded-xl p-6 sm:p-8 space-y-6 shadow-2xl border border-white/[0.12] relative overflow-hidden">
        {/* Top ambient highlight */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-20 bg-brand-500/25 blur-2xl pointer-events-none rounded-full"></div>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-brand-600 text-white mb-2 shadow-glow-sm border border-brand-400/40">
            <span className="font-mono font-bold text-base tracking-tighter">LX</span>
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Sign in to LostX</h2>
          <p className="text-xs text-slate-400">Campus Property Registry Network</p>
        </div>

        {error && (
          <div className="flex items-start p-3 text-xs text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded-md">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email address or ID
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alice.campus or email@campus.edu"
              className="w-full px-3 py-2.5 rounded-md glass-input text-sm placeholder:text-slate-500 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-brand-400 hover:text-brand-300 hover:underline font-normal transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-md glass-input text-sm placeholder:text-slate-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm transition-all shadow-glow-sm border border-brand-400/30 disabled:opacity-50 active:scale-[0.99]"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Quick Demo Fill Buttons - Local dev only */}
        {import.meta.env.DEV && (
          <div className="pt-4 border-t border-white/[0.08]">
            <p className="text-[11px] font-mono text-slate-400 mb-2">
              Demo accounts (dev mode):
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => fillQuickDemo('alice.campus', 'Password123!')}
                className="px-2 py-1 text-xs font-mono bg-white/[0.04] hover:bg-brand-500/15 text-slate-300 hover:text-brand-300 border border-white/[0.08] hover:border-brand-500/30 rounded text-center transition-all"
                title="Login as Alice"
              >
                alice.campus
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('bob.campus', 'Password123!')}
                className="px-2 py-1 text-xs font-mono bg-white/[0.04] hover:bg-brand-500/15 text-slate-300 hover:text-brand-300 border border-white/[0.08] hover:border-brand-500/30 rounded text-center transition-all"
                title="Login as Bob"
              >
                bob.campus
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('admin@lostx.campus', 'Admin@12345')}
                className="px-2 py-1 text-xs font-mono bg-white/[0.04] hover:bg-brand-500/15 text-slate-300 hover:text-brand-300 border border-white/[0.08] hover:border-brand-500/30 rounded text-center transition-all"
                title="Login as Admin"
              >
                admin
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 pt-1">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-brand-400 hover:text-brand-300 hover:underline">
            Register here
          </Link>
        </p>
      </div>

      {/* Forgot Password Helper Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-reveal">
          <div className="glass-panel rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-white/[0.15]">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 text-white font-semibold text-sm">
                <ShieldAlert className="w-4 h-4 text-brand-400" />
                <span>Password Recovery Assistance</span>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-white p-0.5 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <p>
                To safeguard campus property against unauthorized access and false claims, password resets require campus staff verification.
              </p>
              <div className="p-3 rounded-lg border border-white/[0.08] bg-[#0C0B18]/90 space-y-1">
                <div className="font-medium text-white">Campus Security & Admin Desk:</div>
                <div>Email: <span className="font-mono text-brand-300">admin@lostx.campus</span></div>
                <div>Location: Main Reception / Security Central</div>
              </div>
              <p className="text-slate-400 text-[11px]">
                Please present or attach your campus student/staff ID card for identity verification.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-3.5 py-1.5 rounded-md bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-colors shadow-glow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
