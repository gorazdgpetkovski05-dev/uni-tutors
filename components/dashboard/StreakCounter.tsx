import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion } from 'motion/react';

const STREAK_KEY = 'unitutors_streak';
const LAST_VISIT_KEY = 'unitutors_last_visit';

function getStreak(): number {
  const today = new Date().toDateString();
  const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
  let streak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);

  if (lastVisit === today) return streak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (lastVisit === yesterday.toDateString()) { streak += 1; }
  else { streak = 1; }

  localStorage.setItem(STREAK_KEY, String(streak));
  localStorage.setItem(LAST_VISIT_KEY, today);
  return streak;
}

export const StreakCounter: React.FC = () => {
  const { t } = useLanguage();
  const [streak, setStreak] = useState(0);
  useEffect(() => { setStreak(getStreak()); }, []);

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(streak / 7, 1);
  const dashOffset = circumference * (1 - progress);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 flex items-center gap-4">
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="currentColor"
            className="text-gray-100 dark:text-slate-700" strokeWidth="4" />
          <motion.circle cx="32" cy="32" r={radius} fill="none" stroke="currentColor"
            className="text-orange-500" strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }} />
        </svg>
        <Flame className="absolute inset-0 m-auto h-5 w-5 text-orange-500" />
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900 dark:text-white">{streak} {t('dayStreak')}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{streak > 0 ? t('keepItUp') : t('streakBroken')}</p>
      </div>
    </motion.div>
  );
};
