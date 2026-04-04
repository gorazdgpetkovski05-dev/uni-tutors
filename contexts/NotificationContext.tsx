import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Notification } from '../types';
import { isTypeEnabled } from '../components/dashboard/NotificationPreferences';

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
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [prefsVersion, setPrefsVersion] = useState(0);

  // Listen for localStorage changes from the preferences panel
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'notification_prefs') setPrefsVersion(v => v + 1);
    };
    window.addEventListener('storage', onStorage);
    // Also listen for same-tab changes via custom event
    const onCustom = () => setPrefsVersion(v => v + 1);
    window.addEventListener('notification_prefs_changed', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('notification_prefs_changed', onCustom);
    };
  }, []);

  const notifications = useMemo(
    () => allNotifications.filter(n => isTypeEnabled(n.type)),
    [allNotifications, prefsVersion]
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setAllNotifications(data);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setAllNotifications([]);
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
        setAllNotifications(prev => [payload.new as Notification, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchNotifications]);

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setAllNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    setAllNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllRead, refetch: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
