import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCheck, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

export default function Notifications() {
  const navigate = useNavigate();
  const { fetchUnreadCount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id, link) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      fetchUnreadCount();
      if (link) {
        navigate(link);
      }
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      fetchUnreadCount();
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const unreadTotal = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay updated with automated match suggestions, claim approvals, and campus notices.
          </p>
        </div>

        {unreadTotal > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <CheckCheck className="w-4 h-4 mr-1 text-indigo-600" />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 animate-pulse h-16"></div>
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2.5">
          {notifications.map((item) => (
            <div
              key={item._id}
              onClick={() => handleMarkAsRead(item._id, item.link)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                !item.read
                  ? 'bg-indigo-50/50 border-indigo-200 hover:bg-indigo-50'
                  : 'bg-white border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <div
                className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                  !item.read ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-xs ${!item.read ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                  {item.message}
                </p>
                <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No notifications yet</h3>
          <p className="text-xs text-slate-500">
            When our matcher finds matching items or your claims are updated, notifications will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
