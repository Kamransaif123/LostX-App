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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-reveal">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-400 mt-1">
            Stay updated with automated match suggestions, claim approvals, and campus notices.
          </p>
        </div>

        {unreadTotal > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center px-3 py-1.5 rounded-lg glass-card border border-white/[0.1] text-xs font-medium text-slate-300 hover:text-white hover:border-brand-500/40 transition-all"
          >
            <CheckCheck className="w-4 h-4 mr-1.5 text-brand-400" />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4 rounded-xl border border-white/[0.08] animate-pulse h-16"></div>
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2.5">
          {notifications.map((item) => (
            <div
              key={item._id}
              onClick={() => handleMarkAsRead(item._id, item.link)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                !item.read
                  ? 'glass-panel bg-brand-500/10 border-brand-500/30 hover:border-brand-400/50'
                  : 'glass-card border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              <div
                className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${
                  !item.read
                    ? 'bg-brand-600 text-white shadow-glow-sm'
                    : 'bg-white/[0.05] text-slate-400'
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-xs ${!item.read ? 'font-semibold text-white' : 'text-slate-300'}`}>
                  {item.message}
                </p>
                <div className="flex items-center space-x-2 mt-1.5 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-brand-400 inline-block shadow-glow-sm"></span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-xl border border-white/[0.08] p-12 text-center max-w-md mx-auto space-y-3 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No notifications yet</h3>
          <p className="text-xs text-slate-400">
            When our matcher finds matching items or your claims are updated, notifications will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
