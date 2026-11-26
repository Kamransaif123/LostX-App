import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/browse');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-[#F7F8FC] animate-reveal">
      <div className="max-w-sm w-full bg-white rounded-xl border border-[#E4E6EF] p-7 sm:p-9 space-y-6 shadow-sm">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-600 text-white mb-2 shadow-sm">
            <span className="font-mono font-bold text-base tracking-tighter">LX</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Create an account</h2>
          <p className="text-xs text-gray-500">Join the campus property registry</p>
        </div>

        {error && (
          <div className="flex items-start p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full name', type: 'text', val: name, set: setName, ph: 'e.g. Alex Morgan' },
            { label: 'Email address', type: 'email', val: email, set: setEmail, ph: 'e.g. alex@campus.edu' },
            { label: 'Password', type: 'password', val: password, set: setPassword, ph: 'Min. 6 characters' },
            { label: 'Confirm password', type: 'password', val: confirmPassword, set: setConfirmPassword, ph: 'Re-enter password' },
          ].map(({ label, type, val, set, ph }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
              <input
                type={type}
                required
                value={val}
                onChange={(e) => set(e.target.value)}
                placeholder={ph}
                className="field-input w-full px-3 py-2 text-sm"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 pt-1">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}