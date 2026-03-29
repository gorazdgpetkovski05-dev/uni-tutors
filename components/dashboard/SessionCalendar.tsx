import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Session as SessionRecord } from '../../types';

interface SessionCalendarProps {
  sessions: SessionRecord[];
}

const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_MK = ['Нед', 'Пон', 'Вто', 'Сре', 'Чет', 'Пет', 'Саб'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_MK = ['Јануари', 'Февруари', 'Март', 'Април', 'Мај', 'Јуни', 'Јули', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'];

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-500',
  completed: 'bg-green-500',
  missed: 'bg-red-500',
  cancelled: 'bg-gray-400',
};

export const SessionCalendar: React.FC<SessionCalendarProps> = ({ sessions }) => {
  const { t, language } = useLanguage();
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const dayNames = language === 'mk' ? DAYS_MK : DAYS_EN;
  const monthNames = language === 'mk' ? MONTHS_MK : MONTHS_EN;

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Map sessions by local date string (YYYY-MM-DD) using user's timezone
  const sessionsByDate = new Map<string, SessionRecord[]>();
  sessions.forEach(s => {
    const raw = s.session_date || s.created_at;
    const d = new Date(raw);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!sessionsByDate.has(dateStr)) sessionsByDate.set(dateStr, []);
    sessionsByDate.get(dateStr)!.push(s);
  });

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('calendar')}</h3>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            <ChevronLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[140px] text-center">
            {monthNames[viewMonth]} {viewYear}
          </span>
          <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="p-3">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {dayNames.map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-gray-400 dark:text-gray-500 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />;

            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const daySessions = sessionsByDate.get(dateStr) || [];
            const hasSession = daySessions.length > 0;

            return (
              <div
                key={dateStr}
                className={`relative flex flex-col items-center justify-center h-9 rounded-lg text-xs transition-colors
                  ${isToday(day) ? 'bg-indigo-600 text-white font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'}
                `}
              >
                {day}
                {hasSession && (
                  <div className="flex gap-0.5 absolute bottom-0.5">
                    {daySessions.slice(0, 3).map((s, j) => (
                      <div key={j} className={`w-1 h-1 rounded-full ${STATUS_COLORS[s.status] || 'bg-blue-500'}`} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-3 flex flex-wrap gap-3">
        {[
          { key: 'scheduled', label: t('scheduled'), color: 'bg-blue-500' },
          { key: 'completed', label: t('completed'), color: 'bg-green-500' },
          { key: 'missed', label: t('missed'), color: 'bg-red-500' },
        ].map(item => (
          <div key={item.key} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${item.color}`} />
            <span className="text-[10px] text-gray-500 dark:text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
