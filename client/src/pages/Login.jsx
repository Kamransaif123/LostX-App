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
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 animate-reveal">
      <div className="max-w-sm w-full bg-white rounded-md border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-slate-900 text-white mb-2">
            <span className="font-mono font-bold text-base tracking-tighter">LX</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Sign in to LostX</h2>
          <p className="text-xs text-slate-500">Enter your campus email or identifier</p>
        </div>

        {error && (
          <div className="flex items-start p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Email address or ID
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alice.campus or email@campus.edu"
              className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-brand-600 hover:text-brand-800 hover:underline font-normal"
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
              className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Quick Demo Fill Buttons - Local dev only */}
        {import.meta.env.DEV && (
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-medium text-slate-400 mb-2">
              Demo accounts (dev mode):
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => fillQuickDemo('alice.campus', 'Password123!')}
                className="px-2 py-1 text-xs font-mono bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-center transition-colors"
                title="Login as Alice"
              >
                alice.campus
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('bob.campus', 'Password123!')}
                className="px-2 py-1 text-xs font-mono bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-center transition-colors"
                title="Login as Bob"
              >
                bob.campus
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('admin@lostx.campus', 'Admin@12345')}
                className="px-2 py-1 text-xs font-mono bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-center transition-colors"
                title="Login as Admin"
              >
                admin
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-500 pt-1">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>

      {/* Forgot Password Helper Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-reveal">
          <div className="bg-white rounded-md border border-slate-200 max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 text-slate-900 font-semibold text-sm">
                <ShieldAlert className="w-4 h-4 text-brand-600" />
                <span>Password Recovery Assistance</span>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                To safeguard campus property against unauthorized access and false claims, password resets require campus staff verification.
              </p>
              <div className="p-3 rounded border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-medium text-slate-800">Campus Security & Admin Desk:</div>
                <div>Email: <span className="font-mono text-brand-700">admin@lostx.campus</span></div>
                <div>Location: Main Reception / Security Central</div>
              </div>
              <p className="text-slate-500 text-[11px]">
                Please bring or attach your campus student/staff ID card for identity verification.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
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
