import React, { useState } from 'react';
import api, { getImageUrl } from '../api';
import { CATEGORIES, LOCATIONS } from '../constants';
import { X, Upload, AlertCircle, EyeOff } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-reveal">
      <div className="glass-panel rounded-xl max-w-2xl w-full shadow-2xl border border-white/[0.12] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-transparent">
          <div>
            <h3 className="font-semibold text-white text-lg">Edit report</h3>
            <p className="text-xs text-slate-400">Update listing details for "{item.title}"</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 text-xs text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded-lg flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input w-full px-3.5 py-2 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="glass-input w-full px-3.5 py-2 rounded-lg bg-[#0f0d22] border border-white/[0.1] text-xs sm:text-sm text-slate-200 focus:outline-none"
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
                Campus location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="glass-input w-full px-3.5 py-2 rounded-lg bg-[#0f0d22] border border-white/[0.1] text-xs sm:text-sm text-slate-200 focus:outline-none"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} className="bg-[#0f0d22] text-slate-300">
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Date {item.type === 'lost' ? 'lost' : 'found'}
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="glass-input w-full px-3.5 py-2 rounded-lg bg-[#0f0d22] border border-white/[0.1] text-sm text-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input w-full px-3.5 py-2 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            ></textarea>
          </div>

          {/* Photo update */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Update photo (optional, max 2MB)
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 rounded-lg glass-card border border-white/[0.1] text-xs font-medium text-slate-300 hover:text-white hover:border-brand-500/40 transition-all">
                <Upload className="w-3.5 h-3.5 mr-1.5 text-brand-400" />
                Change photo
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
              <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-white/[0.1] relative">
                <img src={getImageUrl(imagePreview)} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Found specific fields */}
          {item.type === 'found' && (
            <div className="p-4 rounded-xl glass-card bg-brand-500/10 border border-brand-500/20 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center">
                  <EyeOff className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Hidden private detail
                </label>
                <textarea
                  rows={2}
                  value={privateDetails}
                  onChange={(e) => setPrivateDetails(e.target.value)}
                  className="glass-input w-full px-3.5 py-2 rounded-lg text-xs text-slate-100 bg-[#0f0d22] border border-white/[0.1]"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Handover spot / current storage
                </label>
                <input
                  type="text"
                  value={handoverInfo}
                  onChange={(e) => setHandoverInfo(e.target.value)}
                  className="glass-input w-full px-3.5 py-2 rounded-lg text-xs text-slate-100 bg-[#0f0d22] border border-white/[0.1]"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-glow-sm hover:shadow-glow transition-all disabled:opacity-50"
            >
              {loading ? 'Saving changes...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
