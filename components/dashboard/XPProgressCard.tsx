import React from 'react';
import { Trophy, Zap, Gift, Star, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { StudentXP } from '../../types';
import { motion } from 'motion/react';

interface XPProgressCardProps {
  xp: number;
  level: number;
  xpHistory?: StudentXP[];
}

const LEVEL_THRESHOLDS = [0, 100, 300];
const LEVEL_DISCOUNTS = [0, 5, 10];
const LEVEL_LABELS: Record<number, string> = { 1: 'level1Desc', 2: 'level2Desc', 3: 'level3Desc' };
const LEVEL_COLORS: Record<number, { bg: string; text: string; ring: string; gradient: string }> = {
  1: { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-300', ring: 'ring-slate-300', gradient: 'from-slate-400 to-slate-500' },
  2: { bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-600 dark:text-indigo-400', ring: 'ring-indigo-400', gradient: 'from-indigo-500 to-purple-500' },
  3: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-600 dark:text-yellow-400', ring: 'ring-yellow-400', gradient: 'from-yellow-400 to-orange-500' },
};

const XP_REASON_ICONS: Record<string, React.ReactNode> = {
  enrollment_approved: <Zap className="h-3.5 w-3.5 text-green-500" />,
  course_completed: <Trophy className="h-3.5 w-3.5 text-blue-500" />,
  review_submitted: <Star className="h-3.5 w-3.5 text-yellow-500" />,
};

export const XPProgressCard: React.FC<XPProgressCardProps> = ({ xp, level, xpHistory = [] }) => {
  const { t } = useLanguage();
  const colors = LEVEL_COLORS[level] || LEVEL_COLORS[1];
  const discount = LEVEL_DISCOUNTS[level - 1] || 0;

  // Progress to next level
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const isMaxLevel = level >= 3;
  const progressXP = xp - currentThreshold;
  const neededXP = nextThreshold - currentThreshold;
  const progressPercent = isMaxLevel ? 100 : Math.min(100, (progressXP / neededXP) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden"
    >
      {/* Level badge header */}
      <div className={`bg-gradient-to-r ${colors.gradient} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white/80 text-xs font-medium uppercase tracking-wider">{t('currentLevel')}</p>
              <p className="text-xl font-bold">{t('level')} {level} - {t(LEVEL_LABELS[level] as any)}</p>
            </div>
          </div>
          {discount > 0 && (
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <p className="text-xs font-medium text-white/80">{t('yourDiscount')}</p>
              <p className="text-lg font-bold">{discount}%</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* XP Progress bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {xp} XP
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isMaxLevel
                ? t('maxLevel')
                : `${nextThreshold - xp} XP ${t('xpToNextLevel')}`}
            </span>
          </div>
          <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              className={`h-full rounded-full bg-gradient-to-r ${colors.gradient}`}
            />
          </div>
          {!isMaxLevel && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
              {level === 1 ? t('reachLevel2') : t('reachLevel3')}
            </p>
          )}
        </div>

        {/* Recent XP History */}
        {xpHistory.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('xpHistory')}</p>
            <div className="space-y-1.5">
              {xpHistory.slice(0, 4).map(entry => (
                <div key={entry.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-2">
                    {XP_REASON_ICONS[entry.reason] || <Zap className="h-3.5 w-3.5 text-gray-400" />}
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {entry.reason === 'enrollment_approved' ? t('enrollmentXP')
                        : entry.reason === 'course_completed' ? t('courseCompletedXP')
                        : entry.reason === 'review_submitted' ? t('reviewXP')
                        : entry.reason}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-green-600 dark:text-green-400">+{entry.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
