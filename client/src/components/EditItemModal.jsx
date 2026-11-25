import React, { useState } from 'react';
import api, { getImageUrl } from '../api';
import { CATEGORIES, LOCATIONS } from '../constants';
import { X, Upload, AlertCircle, Lock, EyeOff } from 'lucide-react';

export default function EditItemModal({ item, onClose, onItemUpdated }) {
  if (!item) return null;

  const [title, setTitle] = useState(item.title || '');
  const [category, setCategory] = useState(item.category || CATEGORIES[0].value);
  const [location, setLocation] = useState(item.location || LOCATIONS[0]);
  const [date, setDate] = useState(() =>
    item.date ? new Date(item.date).toISOString().split('T')[0] : ''
  );
  const [description, setDescription] = useState(item.description || '');
  const [privateDetails, setPrivateDetails] = useState(item.privateDetails || '');
  const [handoverInfo, setHandoverInfo] = useState(item.handoverInfo || '');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(item.imageUrl || null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('location', location);
      formData.append('date', date);
      formData.append('description', description.trim());

      if (item.type === 'found') {
        formData.append('privateDetails', privateDetails.trim());
        formData.append('handoverInfo', handoverInfo.trim());
      }

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await api.put(`/items/${item._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success && res.data.item) {
        onItemUpdated(res.data.item);
        onClose();
      }
    } catch (err) {
      console.error('Update item error:', err);
      setError(err.response?.data?.message || 'Failed to update item report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-md max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-black text-slate-900 text-lg">Edit Report</h3>
            <p className="text-xs text-slate-500">Update listing details for "{item.title}"</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Campus Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Date {item.type === 'lost' ? 'Lost' : 'Found'}
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none"
            ></textarea>
          </div>

          {/* Photo update */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Update Photo (Optional, max 2MB)
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700">
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Change Photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imageFile && (
                <span className="text-xs text-slate-500 truncate max-w-xs">{imageFile.name}</span>
              )}
            </div>

            {imagePreview && (
              <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-slate-200 relative">
                <img src={getImageUrl(imagePreview)} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Found specific fields */}
          {item.type === 'found' && (
            <div className="p-4 rounded-md bg-teal-50/60 border border-teal-200 space-y-3">
              <div>
                <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-1 flex items-center">
                  <EyeOff className="w-3.5 h-3.5 mr-1" />
                  Hidden Private Detail
                </label>
                <textarea
                  rows={2}
                  value={privateDetails}
                  onChange={(e) => setPrivateDetails(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-teal-300 bg-white text-xs"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider mb-1">
                  Handover Spot / Current Storage
                </label>
                <input
                  type="text"
                  value={handoverInfo}
                  onChange={(e) => setHandoverInfo(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-teal-300 bg-white text-xs"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-200 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
