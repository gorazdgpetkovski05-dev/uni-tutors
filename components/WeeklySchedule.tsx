import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

interface WeeklyScheduleProps {
  courseIds: string[];
}

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({ courseIds }) => {
  const { t } = useLanguage();
  const [dayFlags, setDayFlags] = useState<boolean[]>(new Array(7).fill(false));

  const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

  useEffect(() => {
    if (courseIds.length === 0) return;

    const fetchSessions = async () => {
      const now = new Date();
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('id')
        .in('course_id', courseIds);

      if (!enrollments || enrollments.length === 0) return;

      const enrollmentIds = enrollments.map(e => e.id);

      const { data: sessions } = await supabase
        .from('sessions')
        .select('session_date')
        .in('enrollment_id', enrollmentIds)
        .eq('status', 'scheduled')
        .gte('session_date', now.toISOString())
        .lte('session_date', weekEnd.toISOString());

      if (!sessions) return;

      const flags = new Array(7).fill(false);
      sessions.forEach(s => {
        if (s.session_date) {
          const day = new Date(s.session_date).getDay();
          // Convert from Sun=0 to Mon=0 layout
          const idx = day === 0 ? 6 : day - 1;
          flags[idx] = true;
        }
      });
      setDayFlags(flags);
    };

    fetchSessions();
  }, [courseIds.join(',')]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md dark:shadow-slate-900/50 border border-gray-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-indigo-500" />
        {t('weeklySchedule')}
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {dayKeys.map((key, i) => (
          <div key={key} className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              {t(key)}
            </span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                dayFlags[i]
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 ring-2 ring-indigo-400 dark:ring-indigo-500'
                  : 'bg-gray-100 dark:bg-slate-700'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  dayFlags[i] ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-slate-500'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
