import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ItemCard from '../components/ItemCard';
import EditItemModal from '../components/EditItemModal';
import { PlusCircle, Inbox, Edit, RotateCcw, CheckCircle2 } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-reveal">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">My reports</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track, edit, and renew all items you have reported as lost or found.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium shadow-glow-sm hover:shadow-glow transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Report another item
        </Link>
      </div>

      {msg && (
        <div className="p-3.5 text-xs font-medium text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-lg flex items-center shadow-glow-emerald">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-3">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterType === 'all'
              ? 'bg-brand-600/30 text-brand-300 border border-brand-500/40 shadow-glow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          All reports ({items.length})
        </button>
        <button
          onClick={() => setFilterType('lost')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterType === 'lost'
              ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 shadow-glow-rose'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          Lost ({items.filter((i) => i.type === 'lost').length})
        </button>
        <button
          onClick={() => setFilterType('found')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterType === 'found'
              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-glow-emerald'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          Found ({items.filter((i) => i.type === 'found').length})
        </button>
        <button
          onClick={() => setFilterType('archived')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterType === 'archived'
              ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          Archived / Expired ({items.filter((i) => i.status === 'archived').length})
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl border border-white/[0.08] p-4 space-y-3 animate-pulse">
              <div className="w-full h-40 bg-white/[0.04] rounded-lg"></div>
              <div className="h-4 bg-white/[0.04] rounded w-1/3"></div>
              <div className="h-5 bg-white/[0.04] rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <div key={item._id} className="relative group">
              <ItemCard item={item} />
              {/* Quick action overlay buttons */}
              <div className="absolute top-2.5 right-2.5 z-20 flex items-center space-x-1.5 opacity-90">
                {item.status === 'archived' && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleRenew(item._id);
                    }}
                    className="p-1.5 bg-brand-600 text-white rounded-lg shadow-glow-sm hover:bg-brand-500 transition-colors"
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
                  className="p-1.5 glass-panel bg-[#0b0a17]/90 text-slate-300 hover:text-white rounded-lg border border-white/[0.15] hover:border-brand-500/50 transition-colors"
                  title="Edit report"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-xl border border-white/[0.08] p-12 text-center max-w-md mx-auto space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No reports in this tab</h3>
          <p className="text-xs text-slate-400">
            You haven't reported any {filterType !== 'all' ? filterType : ''} items yet.
          </p>
          <Link
            to="/report"
            className="inline-block px-4 py-2 rounded-lg text-xs font-medium text-white bg-brand-600 hover:bg-brand-500 shadow-glow-sm transition-all"
          >
            Create report
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
