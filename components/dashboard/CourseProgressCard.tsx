import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Enrollment, Session } from '../../types';
import { motion } from 'motion/react';
import { Calendar } from 'lucide-react';

interface CourseProgressCardProps {
  enrollment: Enrollment & { course?: { title: string } };
  sessions: Session[];
  courseName: string;
}

export const CourseProgressCard: React.FC<CourseProgressCardProps> = ({ enrollment, sessions, courseName }) => {
  const { t } = useLanguage();
  const courseSessions = sessions.filter(s => s.enrollment_id === enrollment.id);
  const completed = courseSessions.filter(s => s.status === 'completed').length;
  const total = courseSessions.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const nextSession = courseSessions
    .filter(s => s.status === 'scheduled' && s.session_date)
    .sort((a, b) => new Date(a.session_date!).getTime() - new Date(b.session_date!).getTime())[0];

  const barColor = percent >= 75 ? 'bg-green-500' : percent >= 25 ? 'bg-blue-500' : 'bg-gray-400';
  const milestones = [25, 50, 75, 100];
  const reachedMilestone = milestones.filter(m => percent >= m).pop();

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700/50">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{t('courseProgress')}</span>
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
          {total > 0 ? `${percent}% ${t('progressPercent')}` : t('awaitingSession')}
        </span>
      </div>
      <div className="relative h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: total > 0 ? `${percent}%` : '0%' }}
          transition={{ type: 'spring', stiffness: 60, damping: 15, delay: 0.2 }}
          className={`h-full rounded-full ${barColor} transition-colors duration-500`}
        />
        {milestones.map(m => (
          <div key={m} className="absolute top-0 h-full w-0.5" style={{ left: `${m}%` }}>
            <div className={`h-full w-full ${percent >= m ? 'bg-white/50' : 'bg-gray-300 dark:bg-slate-500'}`} />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        {milestones.map(m => (
          <span key={m} className={`text-[9px] font-medium ${percent >= m ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
            {m}%
          </span>
        ))}
      </div>
      {reachedMilestone && reachedMilestone >= 50 && (
        <p className="text-[10px] text-green-600 dark:text-green-400 font-medium mt-0.5">{t('milestoneReached')}</p>
      )}
      {nextSession?.session_date && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
          <Calendar className="h-3 w-3" /> {t('nextSessionOn')} {new Date(nextSession.session_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </p>
      )}
    </div>
  );
};
