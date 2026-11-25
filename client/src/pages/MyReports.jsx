import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ItemCard from '../components/ItemCard';
import EditItemModal from '../components/EditItemModal';
import { PlusCircle, FileText, Inbox, Edit, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function MyReports() {
  const [items, setItems] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [msg, setMsg] = useState('');

  const fetchMyItems = async () => {
    try {
      const res = await api.get('/items/mine');
      if (res.data?.success) {
        setItems(res.data.items);
      }
    } catch (err) {
      console.error('Fetch my items error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyItems();
  }, []);

  const handleRenew = async (itemId) => {
    try {
      const res = await api.patch(`/items/${itemId}/renew`);
      if (res.data?.success && res.data.item) {
        setItems((prev) => prev.map((i) => (i._id === itemId ? res.data.item : i)));
        setMsg('Report listing renewed for another 30 days!');
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to renew report.');
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterType === 'all') return true;
    if (filterType === 'archived') return item.status === 'archived';
    return item.type === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Reports</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track, edit, and renew all items you have reported as lost or found.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-200 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Report Another Item
        </Link>
      </div>

      {msg && (
        <div className="p-3 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md flex items-center shadow-sm">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Reports ({items.length})
        </button>
        <button
          onClick={() => setFilterType('lost')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'lost'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Lost ({items.filter((i) => i.type === 'lost').length})
        </button>
        <button
          onClick={() => setFilterType('found')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'found'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Found ({items.filter((i) => i.type === 'found').length})
        </button>
        <button
          onClick={() => setFilterType('archived')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'archived'
              ? 'bg-slate-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Archived / Expired ({items.filter((i) => i.status === 'archived').length})
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-md border border-slate-200 p-4 space-y-3 animate-pulse">
              <div className="w-full h-40 bg-slate-200 rounded-xl"></div>
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-5 bg-slate-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <div key={item._id} className="relative group">
              <ItemCard item={item} />
              {/* Quick action overlay buttons */}
              <div className="absolute top-2 right-2 z-20 flex items-center space-x-1.5 opacity-90">
                {item.status === 'archived' && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleRenew(item._id);
                    }}
                    className="p-1.5 bg-brand-600 text-white rounded-lg shadow-md hover:bg-brand-700 transition-colors"
                    title="Renew for 30 days"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setEditingItem(item);
                  }}
                  className="p-1.5 bg-white/95 text-slate-700 hover:text-brand-600 rounded-lg shadow-md border border-slate-200 transition-colors"
                  title="Edit Report"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-md border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-md bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No reports in this tab</h3>
          <p className="text-xs text-slate-500">
            You haven't reported any {filterType !== 'all' ? filterType : ''} items yet.
          </p>
          <Link
            to="/report"
            className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700"
          >
            Create Report
          </Link>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onItemUpdated={(updated) => {
            setItems((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
            setMsg('Report updated successfully.');
            setTimeout(() => setMsg(''), 4000);
          }}
        />
      )}
    </div>
  );
}
