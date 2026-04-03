import React, { useState, useEffect, useMemo } from 'react';
import { Users, TrendingUp, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

export const EnrollmentCount: React.FC<{ courseId: string }> = ({ courseId }) => {
  const [count, setCount] = useState<number | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId)
      .then(({ count: c }) => { if (c !== null) setCount(c); });
  }, [courseId]);

  if (count === null || count === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <Users className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
      <span className="font-medium">{count} {t('studentsEnrolled')}</span>
    </div>
  );
};

export const RecentActivity: React.FC<{ courseId: string }> = ({ courseId }) => {
  const [count, setCount] = useState<number | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId)
      .gte('created_at', weekAgo.toISOString())
      .then(({ count: c }) => { if (c !== null) setCount(c); });
  }, [courseId]);

  if (!count || count === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
      <TrendingUp className="h-4 w-4" />
      <span className="font-medium">{count} {t('enrolledThisWeek')}</span>
    </div>
  );
};

export const LiveViewers: React.FC = () => {
  const { t } = useLanguage();
  const viewers = useMemo(() => Math.floor(Math.random() * 10) + 3, []);

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <Eye className="h-4 w-4" />
      <span>{viewers} {t('viewingNow')}</span>
    </div>
  );
};
