
import React from 'react';
import { ShieldCheck, Star, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const Badge: React.FC<{ icon: React.ReactNode; label: string; className: string }> = ({ icon, label, className }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${className}`} title={label}>
    {icon}{label}
  </span>
);

export const VerifiedBadge: React.FC<{ verified: boolean }> = ({ verified }) => {
  const { t } = useLanguage();
  if (!verified) return null;
  return (
    <Badge
      icon={<ShieldCheck className="h-3 w-3" />}
      label={t('verified')}
      className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
    />
  );
};

export const TopRatedBadge: React.FC<{ rating: number }> = ({ rating }) => {
  const { t } = useLanguage();
  if (rating < 4.5) return null;
  return (
    <Badge
      icon={<Star className="h-3 w-3 fill-current" />}
      label={t('topRated')}
      className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
    />
  );
};

export const ExperienceBadge: React.FC<{ sessionCount: number }> = ({ sessionCount }) => {
  const { t } = useLanguage();
  if (sessionCount < 50) return null;
  const tier = sessionCount >= 100 ? '100+' : '50+';
  return (
    <Badge
      icon={null}
      label={`${tier} ${t('sessionsLabel')}`}
      className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
    />
  );
};

export const ResponseTimeBadge: React.FC = () => {
  const { t } = useLanguage();
  return (
    <Badge
      icon={<Clock className="h-3 w-3" />}
      label={t('fastResponse')}
      className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
    />
  );
};
