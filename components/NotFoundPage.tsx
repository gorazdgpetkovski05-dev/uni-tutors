import React from 'react';
import { Link } from 'react-router-dom';
import { Home, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const NotFoundPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-indigo-600 dark:text-indigo-400">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">
          {t('pageNotFound')}
        </h1>
        <p className="mt-2 text-gray-500 dark:text-slate-400">
          {t('pageNotFoundDesc')}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            {t('goHome')}
          </Link>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            {t('browseCourses')}
          </Link>
        </div>
      </div>
    </div>
  );
};
