import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Notification } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export const NotificationBell: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClick = (n: Notification) => {
    markAsRead(n.id);
    if (n.link) navigate(n.link);
    setIsOpen(false);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('justNow');
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-all"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white">{t('notifications')}</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800">
                  {t('markAllRead')}
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-400 dark:text-gray-500 text-sm">
                  {t('noNotifications')}
                </div>
              ) : (
                notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left p-4 border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${!n.read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      {!n.read && <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>}
                      <div className={!n.read ? '' : 'ml-5'}>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
