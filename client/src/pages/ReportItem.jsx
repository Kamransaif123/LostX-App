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
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-6 py-5 sm:px-8 border-b border-slate-200 bg-slate-50/50">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            Register campus property
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit a lost or found report to run automated match scoring across the directory.
          </p>

          {/* Type Switcher */}
          <div className="mt-4 flex items-center p-0.5 bg-slate-200/80 rounded-md max-w-xs">
            <button
              type="button"
              onClick={() => setType('lost')}
              className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                type === 'lost'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Report a lost item
            </button>
            <button
              type="button"
              onClick={() => setType('found')}
              className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                type === 'found'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Report a found item
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-6 sm:mx-8 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md flex items-start">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Item title <span className="text-rose-500">*</span>
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
              className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
            />
          </div>

          {/* Category & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Campus location <span className="text-rose-500">*</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
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
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Date {type === 'lost' ? 'lost' : 'found'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Public description <span className="text-rose-500">*</span>
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
              className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            ></textarea>
          </div>

          {/* Optional Image Upload */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Photo (optional, max 2MB)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center px-3 py-2 rounded-md border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors">
                <Upload className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Select file
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
              <div className="mt-2.5 relative w-24 h-24 rounded-md overflow-hidden border border-slate-200">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-1 right-1 bg-black/70 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Found Item Special Fields: Private Detail & Handover Info */}
          {type === 'found' && (
            <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-3.5 mt-2">
              <div className="flex items-start space-x-2">
                <Lock className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Anti-fraud verification fields</h4>
                  <p className="text-[11px] text-slate-500">
                    These details protect property from fraudulent claims.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center">
                  <EyeOff className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Confidential verification detail <span className="text-rose-500 ml-0.5">*</span>
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
                  className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                ></textarea>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Only administrators review this to confirm ownership when someone submits a claim.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Designated collection counter / location
                </label>
                <input
                  type="text"
                  maxLength={500}
                  placeholder="e.g. Library Reception Desk 2, or Main Gate Security Post"
                  value={handoverInfo}
                  onChange={(e) => setHandoverInfo(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                />
                <p className="text-[11px] text-slate-500 mt-0.5">
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
              className="w-full py-2.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors disabled:opacity-50"
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
