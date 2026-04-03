
import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';

const HIDDEN_PATHS = ['/', '/login', '/signup', '/dashboard', '/admin'];

export const Breadcrumbs: React.FC = () => {
  const { pathname } = useLocation();
  const { id } = useParams();
  const { t } = useLanguage();
  const { courses, professors } = useData();

  if (HIDDEN_PATHS.includes(pathname)) return null;

  const segments: { label: string; to?: string }[] = [{ label: t('home'), to: '/' }];

  if (pathname.startsWith('/courses')) {
    segments.push({ label: t('courses'), to: '/courses' });
    if (id) {
      const course = courses.find(c => c.id === id);
      segments.push({ label: course?.title || id });
    }
  } else if (pathname.startsWith('/professor')) {
    segments.push({ label: t('courses'), to: '/courses' });
    if (id) {
      const prof = professors.find(p => p.id === id);
      segments.push({ label: prof ? `${t('breadcrumbProfessor')} ${prof.name}` : id });
    }
  }

  if (segments.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400">
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
            {isLast || !seg.to ? (
              <span className="text-gray-800 dark:text-slate-200 font-medium truncate max-w-[200px]">{seg.label}</span>
            ) : (
              <Link to={seg.to} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{seg.label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};
