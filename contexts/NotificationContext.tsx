import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: async () => {},
  markAllRead: async () => {},
  refetch: async () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setNotifications(data);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    fetchNotifications();

    const channel = supabase
      .channel('notifications-global')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchNotifications]);

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllRead, refetch: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
