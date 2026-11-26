import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCheck, Sparkles, Clock } from 'lucide-react';

export default function Notifications() {
  const navigate = useNavigate();
  const { fetchUnreadCount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/notifications').then((res) => { if (res.data?.success) setNotifications(res.data.notifications); }).catch(console.error).finally(() => setLoading(false)); }, []);

  const handleMarkAsRead = async (id, link) => {
    try { await api.patch(`/notifications/${id}/read`); setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n))); fetchUnreadCount(); if (link) navigate(link); } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    try { await api.patch('/notifications/read-all'); setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))); fetchUnreadCount(); } catch (err) { console.error(err); }
  };

  const unreadTotal = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-reveal">
      <div className="flex items-center justify-between pb-4 border-b border-[#E4E6EF]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-gray-500 mt-0.5">Match suggestions, claim approvals, and campus notices.</p>
        </div>
        {unreadTotal > 0 && <button onClick={handleMarkAllRead} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#E4E6EF] text-xs font-medium text-gray-600 hover:bg-[#EEF0F8] transition-colors"><CheckCheck className="w-4 h-4 mr-1.5 text-brand-600" />Mark all read</button>}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="card h-16 animate-pulse" />)}</div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2.5">
          {notifications.map((item) => (
            <div key={item._id} onClick={() => handleMarkAsRead(item._id, item.link)} className={`card px-4 py-3.5 cursor-pointer flex items-start space-x-3.5 ${!item.read ? 'border-brand-200 bg-brand-50/60' : ''}`}>
              <div className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${!item.read ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'}`}><Sparkles className="w-4 h-4" /></div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs ${!item.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{item.message}</p>
                <div className="flex items-center space-x-2 mt-1 text-[11px] text-gray-400"><Clock className="w-3 h-3" /><span>{new Date(item.createdAt).toLocaleString()}</span>{!item.read && <span className="w-2 h-2 rounded-full bg-brand-600 inline-block" />}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto"><Bell className="w-6 h-6" /></div>
          <h3 className="text-base font-semibold text-gray-900">No notifications yet</h3>
          <p className="text-xs text-gray-500">When items are matched or claims are updated, you'll see them here.</p>
        </div>
      )}
    </div>
  );
}