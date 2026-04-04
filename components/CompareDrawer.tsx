import React from 'react';
import { X, Star, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { Course } from '../types';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

interface CompareDrawerProps {
  courses: Course[];
  onRemove: (id: string) => void;
  onClose: () => void;
}

export const CompareDrawer: React.FC<CompareDrawerProps> = ({ courses, onRemove, onClose }) => {
  const { professors } = useData();
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed inset-0 z-50 flex items-end"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-h-[80vh] overflow-auto bg-white dark:bg-slate-800 rounded-t-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('compareCourses')}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${courses.length}, minmax(0, 1fr))` }}>
          {courses.map((course) => {
            const prof = professors.find(p => p.id === course.professorId);
            return (
              <div key={course.id} className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                <img src={course.image} alt={course.title} className="w-full h-28 object-cover rounded-lg" />
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">{course.title}</h3>

                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
                  <p><span className="font-medium text-gray-700 dark:text-gray-300">{t('university')}:</span> {course.university || 'UniTutors'}</p>
                  <p><span className="font-medium text-gray-700 dark:text-gray-300">{t('professor')}:</span> {prof?.name || t('unknownProfessor')}</p>
                  <p><span className="font-medium text-gray-700 dark:text-gray-300">{t('price')}:</span> {course.priceSingle} / {course.priceFull} ден.</p>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{t('rating')}:</span>
                    {course.averageRating ? (
                      <>
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span>{course.averageRating.toFixed(1)} ({course.reviewCount || 0})</span>
                      </>
                    ) : <span>-</span>}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Link to={`/courses/${course.id}`} className="flex-1 text-center text-xs bg-indigo-600 text-white py-1.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1">
                    <ExternalLink className="h-3 w-3" />{t('viewDetails')}
                  </Link>
                  <button onClick={() => onRemove(course.id)} className="text-xs text-red-500 hover:text-red-600 py-1.5 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    {t('removeFromCompare')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
