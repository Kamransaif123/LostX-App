import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import { CATEGORIES, LOCATIONS } from '../constants';
import {
  Upload,
  AlertCircle,
  EyeOff,
  Lock,
  PlusCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  Tag
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
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-6 sm:px-8 border-b border-slate-100 bg-slate-50/50">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Report an Item</h1>
          <p className="text-xs text-slate-500 mt-1">
            Fill in the details below. Our rule-based matcher will immediately check for possible matches.
          </p>

          {/* Type Switcher */}
          <div className="mt-5 grid grid-cols-2 p-1.5 bg-slate-200/70 rounded-2xl max-w-sm">
            <button
              type="button"
              onClick={() => setType('lost')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'lost'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              I Lost An Item
            </button>
            <button
              type="button"
              onClick={() => setType('found')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'found'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              I Found An Item
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-6 sm:mx-8 p-3.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={120}
              placeholder={
                type === 'lost'
                  ? 'e.g. Black Fossil Leather Wallet'
                  : 'e.g. Black Leather Wallet found near reading desk'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Category & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Campus Location <span className="text-rose-500">*</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Date {type === 'lost' ? 'Lost' : 'Found'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Public Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              maxLength={2000}
              placeholder={
                type === 'lost'
                  ? 'Describe recognizable details (brand, color, materials, where you were sitting)...'
                  : 'General public description (do NOT include secret details here)...'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            ></textarea>
          </div>

          {/* Optional Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Optional Photo (Stored safely, max 2MB)
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer inline-flex items-center px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors">
                <Upload className="w-4 h-4 mr-2 text-slate-500" />
                Choose Image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imageFile && (
                <span className="text-xs text-slate-600 truncate max-w-xs">{imageFile.name}</span>
              )}
            </div>

            {imagePreview && (
              <div className="mt-3 relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full text-xs"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Found Item Special Fields: Private Detail & Handover Info */}
          {type === 'found' && (
            <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-4">
              <div className="flex items-start space-x-2.5">
                <div className="p-1.5 rounded-lg bg-teal-600 text-white mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-teal-900">Verification & Handover Privacy</h4>
                  <p className="text-xs text-teal-700 mt-0.5">
                    These two fields protect the item from false claims and coordinate safe return.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-1.5 flex items-center">
                  <EyeOff className="w-3.5 h-3.5 mr-1" />
                  Hidden Private Detail <span className="text-rose-500 ml-0.5">*</span>
                  <span className="ml-2 text-[10px] font-normal text-teal-700 lowercase">
                    (never shown publicly)
                  </span>
                </label>
                <textarea
                  required
                  rows={2}
                  maxLength={1000}
                  placeholder="e.g. Wallpaper on lockscreen, student ID number ending in 4921, engraving, exact contents inside zipper pocket..."
                  value={privateDetails}
                  onChange={(e) => setPrivateDetails(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                ></textarea>
                <p className="text-[11px] text-teal-700 mt-1">
                  Only the campus admin will see this to cross-check when a claimant submits proof.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-1.5">
                  Where is the item currently kept? (Handover Spot)
                </label>
                <input
                  type="text"
                  maxLength={500}
                  placeholder="e.g. Library Reception Desk 2, or Main Gate Security Cabin"
                  value={handoverInfo}
                  onChange={(e) => setHandoverInfo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
                <p className="text-[11px] text-teal-700 mt-1">
                  This location is revealed to the owner ONLY after an admin approves their claim.
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
            >
              {loading
                ? 'Submitting & Matching...'
                : `Submit ${type === 'lost' ? 'Lost' : 'Found'} Report`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
