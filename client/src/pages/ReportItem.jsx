import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import { CATEGORIES, LOCATIONS } from '../constants';
import {
  Upload,
  AlertCircle,
  EyeOff,
  Lock
} from 'lucide-react';

export default function ReportItem() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialType = searchParams.get('type') === 'found' ? 'found' : 'lost';

  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [privateDetails, setPrivateDetails] = useState('');
  const [handoverInfo, setHandoverInfo] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Photo must be less than 2MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('location', location);
      formData.append('date', date);
      formData.append('description', description.trim());

      if (type === 'found') {
        formData.append('privateDetails', privateDetails.trim());
        formData.append('handoverInfo', handoverInfo.trim());
      }

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await api.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success && res.data.item?._id) {
        navigate(`/items/${res.data.item._id}`);
      } else {
        navigate('/my-reports');
      }
    } catch (err) {
      console.error('Submit report error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 animate-reveal">
      <div className="glass-panel rounded-xl border border-white/[0.08] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 sm:px-8 border-b border-white/[0.08]">
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Register campus property
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Submit a lost or found report to run automated match scoring across the directory.
          </p>

          {/* Type Switcher */}
          <div className="mt-4 flex items-center p-1 bg-[#07060f]/60 border border-white/[0.08] rounded-lg max-w-xs">
            <button
              type="button"
              onClick={() => setType('lost')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                type === 'lost'
                  ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 shadow-glow-rose'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Report a lost item
            </button>
            <button
              type="button"
              onClick={() => setType('found')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                type === 'found'
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-glow-emerald'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Report a found item
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-6 sm:mx-8 p-3 text-xs text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded-lg flex items-start">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Item title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={120}
              placeholder={
                type === 'lost'
                  ? 'e.g. Black Fossil leather wallet'
                  : 'e.g. Black leather wallet turned in at reception'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input w-full px-3 py-2 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Category & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-lg text-sm text-slate-200 bg-[#0f0d22] border border-white/[0.1] focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-[#0f0d22] text-slate-300">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Campus location <span className="text-rose-400">*</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-lg text-sm text-slate-200 bg-[#0f0d22] border border-white/[0.1] focus:outline-none"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} className="bg-[#0f0d22] text-slate-300">
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Date {type === 'lost' ? 'lost' : 'found'} <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="glass-input w-full px-3 py-2 rounded-lg text-sm text-slate-200 bg-[#0f0d22] border border-white/[0.1] focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Public description <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              maxLength={2000}
              placeholder={
                type === 'lost'
                  ? 'Describe recognizable attributes (brand, color, materials, general area where misplaced)...'
                  : 'General public overview (do NOT disclose secret identifying details here)...'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input w-full px-3 py-2 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            ></textarea>
          </div>

          {/* Optional Image Upload */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Photo (optional, max 2MB)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center px-3.5 py-2 rounded-lg glass-card border border-white/[0.1] text-xs font-medium text-slate-300 hover:text-white hover:border-brand-500/40 transition-all">
                <Upload className="w-3.5 h-3.5 mr-1.5 text-brand-400" />
                Select file
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imageFile && (
                <span className="text-xs text-slate-400 truncate max-w-xs">{imageFile.name}</span>
              )}
            </div>

            {imagePreview && (
              <div className="mt-2.5 relative w-24 h-24 rounded-lg overflow-hidden border border-white/[0.1]">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-1 right-1 bg-black/80 hover:bg-black text-white w-5 h-5 rounded-full text-xs flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Found Item Special Fields: Private Detail & Handover Info */}
          {type === 'found' && (
            <div className="p-4 rounded-xl glass-card bg-brand-500/5 border border-brand-500/20 space-y-3.5 mt-2">
              <div className="flex items-start space-x-2">
                <Lock className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Anti-fraud verification fields</h4>
                  <p className="text-[11px] text-slate-400">
                    These details protect property from fraudulent claims.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center">
                  <EyeOff className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Confidential verification detail <span className="text-rose-400 ml-0.5">*</span>
                  <span className="ml-1.5 text-[11px] text-slate-400 font-normal">
                    (hidden from public view)
                  </span>
                </label>
                <textarea
                  required
                  rows={2}
                  maxLength={1000}
                  placeholder="e.g. Wallpaper on phone lockscreen, student ID number ending in 4921, exact contents in pocket..."
                  value={privateDetails}
                  onChange={(e) => setPrivateDetails(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                ></textarea>
                <p className="text-[11px] text-slate-400 mt-1">
                  Only administrators review this to confirm ownership when someone submits a claim.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Designated collection counter / location
                </label>
                <input
                  type="text"
                  maxLength={500}
                  placeholder="e.g. Library Reception Desk 2, or Main Gate Security Post"
                  value={handoverInfo}
                  onChange={(e) => setHandoverInfo(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Revealed to the verified owner ONLY after their claim is approved.
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm transition-all shadow-glow-sm hover:shadow-glow disabled:opacity-50"
            >
              {loading
                ? 'Submitting...'
                : `Submit ${type === 'lost' ? 'lost' : 'found'} report`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
