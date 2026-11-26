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

  useEffect(() => {
    api.get('/items/mine').then((res) => { if (res.data?.success) setItems(res.data.items); }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleRenew = async (itemId) => {
    try {
      const res = await api.patch(`/items/${itemId}/renew`);
      if (res.data?.success && res.data.item) {
        setItems((prev) => prev.map((i) => (i._id === itemId ? res.data.item : i)));
        setMsg('Report listing renewed for another 30 days!');
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (err) { alert(err.response?.data?.message || 'Failed to renew.'); }
  };

  const filteredItems = items.filter((item) => {
    if (filterType === 'all') return true;
    if (filterType === 'archived') return item.status === 'archived';
    return item.type === filterType;
  });

  const tabCls = (active) => `px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${active ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-600 hover:bg-[#EEF0F8] border border-[#E4E6EF]'}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-reveal">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E6EF]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">My reports</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track, edit, and renew all items you have reported as lost or found.</p>
        </div>
        <Link to="/report" className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto">
          <PlusCircle className="w-4 h-4 mr-1.5" /> Report another item
        </Link>
      </div>

      {msg && <div className="p-3 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />{msg}</div>}

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setFilterType('all')} className={tabCls(filterType === 'all')}>All ({items.length})</button>
        <button onClick={() => setFilterType('lost')} className={tabCls(filterType === 'lost')}>Lost ({items.filter((i) => i.type === 'lost').length})</button>
        <button onClick={() => setFilterType('found')} className={tabCls(filterType === 'found')}>Found ({items.filter((i) => i.type === 'found').length})</button>
        <button onClick={() => setFilterType('archived')} className={tabCls(filterType === 'archived')}>Archived ({items.filter((i) => i.status === 'archived').length})</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-4 space-y-3 animate-pulse"><div className="w-full h-40 bg-gray-100 rounded-lg" /><div className="h-4 bg-gray-100 rounded w-1/3" /></div>)}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <div key={item._id} className="relative group">
              <ItemCard item={item} />
              <div className="absolute top-2.5 right-2.5 z-20 flex items-center space-x-1.5">
                {item.status === 'archived' && (
                  <button onClick={(e) => { e.preventDefault(); handleRenew(item._id); }} className="p-1.5 bg-brand-600 text-white rounded-lg shadow-sm hover:bg-brand-700 transition-colors" title="Renew for 30 days"><RotateCcw className="w-3.5 h-3.5" /></button>
                )}
                <button onClick={(e) => { e.preventDefault(); setEditingItem(item); }} className="p-1.5 bg-white text-gray-600 hover:text-brand-600 rounded-lg shadow-sm border border-[#E4E6EF] transition-colors" title="Edit report"><Edit className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto"><Inbox className="w-6 h-6" /></div>
          <h3 className="text-base font-semibold text-gray-900">No reports in this tab</h3>
          <p className="text-xs text-gray-500">You haven't reported any {filterType !== 'all' ? filterType : ''} items yet.</p>
          <Link to="/report" className="inline-block px-4 py-2 rounded-lg text-xs font-medium text-white bg-brand-600 hover:bg-brand-700">Create report</Link>
        </div>
      )}

      {editingItem && (
        <EditItemModal item={editingItem} onClose={() => setEditingItem(null)} onItemUpdated={(updated) => { setItems((prev) => prev.map((i) => (i._id === updated._id ? updated : i))); setMsg('Report updated successfully.'); setTimeout(() => setMsg(''), 4000); }} />
      )}
    </div>
  );
}