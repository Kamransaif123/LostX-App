import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lostx_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('lostx_token') || null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await api.get('/notifications');
      if (res.data && typeof res.data.unreadCount === 'number') {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (e) {
      // Quiet fail on polling error
    }
  }, [token]);

  // Load user profile on mount
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('lostx_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Failed to restore session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  // 30-second polling for unread notifications (as per plan specs)
  useEffect(() => {
    if (!token) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [token, fetchUnreadCount]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.token && res.data?.user) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('lostx_token', res.data.token);
      localStorage.setItem('lostx_user', JSON.stringify(res.data.user));
      fetchUnreadCount();
      return res.data;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data?.token && res.data?.user) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('lostx_token', res.data.token);
      localStorage.setItem('lostx_user', JSON.stringify(res.data.user));
      fetchUnreadCount();
      return res.data;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setUnreadCount(0);
    localStorage.removeItem('lostx_token');
    localStorage.removeItem('lostx_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        unreadCount,
        login,
        register,
        logout,
        fetchUnreadCount,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
