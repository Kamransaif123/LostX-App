import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, KeyRound } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Check your credentials.');
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
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-[#F7F8FC] animate-reveal">
      <div className="max-w-sm w-full bg-white rounded-xl border border-[#E4E6EF] p-7 sm:p-9 space-y-6 shadow-sm">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-600 text-white mb-2 shadow-sm">
            <span className="font-mono font-bold text-base tracking-tighter">LX</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Sign in to LostX</h2>
          <p className="text-xs text-gray-500">Campus Property Registry Network</p>
        </div>

        {error && (
          <div className="flex items-start p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Email address</label>
            <input
              type="text"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@campus.edu"
              className="field-input w-full px-3 py-2 text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-700">Password</label>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-xs text-brand-600 hover:text-brand-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="field-input w-full px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Demo logins */}
        {import.meta.env.DEV && (
          <div className="border-t border-[#E4E6EF] pt-4 space-y-2">
            <p className="text-[11px] font-medium text-gray-400 text-center">Dev quick-login</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillQuickDemo('admin@lostx.campus', '@Admin123')}
                className="flex-1 py-1.5 rounded-lg border border-[#E4E6EF] text-xs font-medium text-gray-600 hover:bg-[#EEF0F8] transition-colors"
              >
                admin
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('alice.campus', 'Password123!')}
                className="flex-1 py-1.5 rounded-lg border border-[#E4E6EF] text-xs font-medium text-gray-600 hover:bg-[#EEF0F8] transition-colors"
              >
                alice.campus
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('bob.campus', 'Password123!')}
                className="flex-1 py-1.5 rounded-lg border border-[#E4E6EF] text-xs font-medium text-gray-600 hover:bg-[#EEF0F8] transition-colors"
              >
                bob.campus
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-500 pt-1">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
            Register
          </Link>
        </p>
      </div>

      {/* Forgot password modal */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-reveal">
          <div className="bg-white rounded-xl border border-[#E4E6EF] shadow-md max-w-sm w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Password recovery</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Contact your campus IT helpdesk or email <strong>support@lostx.campus</strong> with your registered email address. They will reset your password within 24 hours.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setForgotOpen(false)}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}