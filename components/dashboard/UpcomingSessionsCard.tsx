import React from 'react';
import { Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Session as SessionRecord } from '../../types';
import { motion } from 'motion/react';

interface UpcomingSessionsCardProps {
  sessions: SessionRecord[];
  enrollmentMap?: Record<string, { courseName: string; studentName?: string }>;
}

export const UpcomingSessionsCard: React.FC<UpcomingSessionsCardProps> = ({ sessions, enrollmentMap = {} }) => {
  const { t } = useLanguage();

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const localDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayStr = localDateStr(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = localDateStr(tomorrow);

  // Get upcoming sessions (scheduled, sorted by date)
  const upcoming = sessions
    .filter(s => s.status === 'scheduled')
    .sort((a, b) => {
      const dateA = a.session_date || a.created_at;
      const dateB = b.session_date || b.created_at;
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    })
    .slice(0, 5);

  const getDateLabel = (dateStr: string) => {
    const d = localDateStr(new Date(dateStr));
    if (d === todayStr) return t('today');
    if (d === tomorrowStr) return t('tomorrow');
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(dateStr));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-500" />
          {t('upcomingSessions')}
        </h3>
        <span className="text-xs text-gray-400 dark:text-gray-500">{upcoming.length} {t('scheduled').toLowerCase()}</span>
      </div>

      {upcoming.length === 0 ? (
        <div className="p-6 text-center">
          <CheckCircle2 className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-400 dark:text-gray-500">{t('noUpcomingSessions')}</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
          {upcoming.map((session, i) => {
            const info = enrollmentMap[session.enrollment_id];
            const dateStr = session.session_date || session.created_at;
            return (
              <div
                key={session.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {session.title || info?.courseName || t('session')}
                  </p>
                  {info?.studentName && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{info.studentName}</p>
                  )}
                </div>
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                  {getDateLabel(dateStr)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
