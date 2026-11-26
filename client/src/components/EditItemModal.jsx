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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-reveal">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-md border border-[#E4E6EF] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E4E6EF] flex items-center justify-between bg-[#F7F8FC]">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Edit report</h3>
            <p className="text-xs text-gray-500">Update listing details for "{item.title}"</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="field-input w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="field-input w-full"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Campus location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="field-input w-full"
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
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Date {item.type === 'lost' ? 'lost' : 'found'}
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="field-input w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="field-input w-full"
            ></textarea>
          </div>

          {/* Photo update */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Update photo (optional, max 2MB)
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 rounded-lg border border-[#E4E6EF] bg-white text-xs font-medium text-gray-600 hover:text-gray-900 hover:border-brand-300 transition-all">
                <Upload className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
                Change photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imageFile && (
                <span className="text-xs text-gray-500 truncate max-w-xs">{imageFile.name}</span>
              )}
            </div>

            {imagePreview && (
              <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-[#E4E6EF] relative">
                <img src={getImageUrl(imagePreview)} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Found specific fields */}
          {item.type === 'found' && (
            <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center">
                  <EyeOff className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  Hidden private detail
                </label>
                <textarea
                  rows={2}
                  value={privateDetails}
                  onChange={(e) => setPrivateDetails(e.target.value)}
                  className="field-input w-full"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Handover spot / current storage
                </label>
                <input
                  type="text"
                  value={handoverInfo}
                  onChange={(e) => setHandoverInfo(e.target.value)}
                  className="field-input w-full"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving changes...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
