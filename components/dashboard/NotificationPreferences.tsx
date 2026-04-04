import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { NotificationType } from '../../types';

const STORAGE_KEY = 'notification_prefs';

export interface NotificationPrefs {
  booking: boolean;
  sessions: boolean;
  reviews: boolean;
  support: boolean;
  general: boolean;
}

const defaultPrefs: NotificationPrefs = { booking: true, sessions: true, reviews: true, support: true, general: true };

export const getNotificationPrefs = (): NotificationPrefs => {
  try { return { ...defaultPrefs, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
  catch { return defaultPrefs; }
};

export const isTypeEnabled = (type: NotificationType): boolean => {
  const p = getNotificationPrefs();
  if (['booking_request', 'booking_approved', 'booking_rejected', 'booking_completed'].includes(type)) return p.booking;
  if (type === 'course_proposal') return p.sessions;
  if (type === 'review_received') return p.reviews;
  if (['support_ticket', 'ticket_update'].includes(type)) return p.support;
  return p.general;
};

const Toggle: React.FC<{ checked: boolean; onChange: () => void; label: string }> = ({ checked, onChange, label }) => (
  <label className="flex items-center justify-between py-2.5 cursor-pointer group">
    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{label}</span>
    <button type="button" role="switch" aria-checked={checked} onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-600'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </label>
);

export const NotificationPreferences: React.FC = () => {
  const { t } = useLanguage();
  const [prefs, setPrefs] = useState<NotificationPrefs>(getNotificationPrefs);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new Event('notification_prefs_changed'));
  }, [prefs]);

  const toggle = (key: keyof NotificationPrefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{t('notificationPreferences')}</h3>
      <div className="divide-y divide-gray-100 dark:divide-slate-700">
        <Toggle checked={prefs.booking} onChange={() => toggle('booking')} label={t('bookingUpdates')} />
        <Toggle checked={prefs.sessions} onChange={() => toggle('sessions')} label={t('sessionNotifications')} />
        <Toggle checked={prefs.reviews} onChange={() => toggle('reviews')} label={t('reviewRequests')} />
        <Toggle checked={prefs.support} onChange={() => toggle('support')} label={t('supportReplies')} />
        <Toggle checked={prefs.general} onChange={() => toggle('general')} label={t('generalAnnouncements')} />
      </div>
    </div>
  );
};
