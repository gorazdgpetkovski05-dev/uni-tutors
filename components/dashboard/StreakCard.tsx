import React, { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';

interface StreakData { dates: string[]; streak: number; }

const todayStr = () => new Date().toISOString().slice(0, 10);

const calcStreak = (dates: string[]): number => {
  if (dates.length === 0) return 0;
  const sorted = [...new Set(dates)].sort().reverse();
  let streak = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = new Date(sorted[i]);
    const prev = new Date(sorted[i + 1]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
};

export const StreakCard: React.FC = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<StreakData>({ dates: [], streak: 0 });

  useEffect(() => {
    const raw = localStorage.getItem('streak_data');
    const stored: StreakData = raw ? JSON.parse(raw) : { dates: [], streak: 0 };
    const today = todayStr();
    if (!stored.dates.includes(today)) {
      stored.dates.push(today);
    }
    // Keep only last 30 days
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
    stored.dates = stored.dates.filter(d => new Date(d) >= cutoff);
    stored.streak = calcStreak(stored.dates);
    localStorage.setItem('streak_data', JSON.stringify(stored));
    setData(stored);
  }, []);

  const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
  const now = new Date();
  const currentDay = (now.getDay() + 6) % 7; // 0=Mon
  const weekDates = dayKeys.map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (currentDay - i));
    return d.toISOString().slice(0, 10);
  });

  const isActive = data.dates.includes(todayStr());
  const streakAlive = data.streak > 0 && isActive;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 rounded-xl p-4 text-white relative overflow-hidden"
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
      <div className="flex items-center gap-3 mb-3">
        <motion.div animate={streakAlive ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}>
          <Flame className="h-8 w-8 drop-shadow-lg" />
        </motion.div>
        <div>
          <p className="text-3xl font-black">{data.streak}</p>
          <p className="text-xs font-semibold text-white/90">{t('dayStreak')}</p>
        </div>
      </div>
      <div className="flex justify-between mb-2">
        {dayKeys.map((key, i) => {
          const active = data.dates.includes(weekDates[i]);
          return (
            <div key={key} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-white/70">{t(key)}</span>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                ${active ? 'bg-white text-orange-600' : 'bg-white/20 text-white/50'}`}>
                {active ? '✓' : ''}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs font-medium text-white/80 text-center">
        {streakAlive ? t('keepItUp') : t('streakBroken')}
      </p>
    </motion.div>
  );
};
