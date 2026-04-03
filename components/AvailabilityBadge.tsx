import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Session as SessionRecord } from '../types';

interface AvailabilityBadgeProps {
  sessions: SessionRecord[];
}

export const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({ sessions }) => {
  const { t } = useLanguage();
  const now = new Date();
  const upcoming = sessions
    .filter(s => s.status === 'scheduled' && s.session_date && new Date(s.session_date) > now)
    .sort((a, b) => new Date(a.session_date!).getTime() - new Date(b.session_date!).getTime());

  const isAvailable = upcoming.length === 0;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="font-medium text-gray-700 dark:text-gray-300">
        {isAvailable ? t('available') : t('busy')}
      </span>
      {!isAvailable && upcoming[0]?.session_date && (
        <span className="text-gray-500 dark:text-gray-400">
          &middot; {t('nextSession')}: {new Date(upcoming[0].session_date).toLocaleDateString()}
        </span>
      )}
    </div>
  );
};
