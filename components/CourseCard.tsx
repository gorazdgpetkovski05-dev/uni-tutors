
import React from 'react';
import { ArrowRight, Star, Heart } from 'lucide-react';
import { Course } from '../types';
import { useData } from '../contexts/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { VerifiedBadge, TopRatedBadge } from './badges/TrustBadges';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { professors } = useData();
  const professor = professors.find(p => p.id === course.professorId);
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorited = favorites.has(course.id);

  return (
    <Link to={`/courses/${course.id}`} className="block group h-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600 rounded-2xl">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md dark:shadow-slate-900/50 border border-gray-200 dark:border-slate-700 overflow-hidden group-hover:shadow-2xl group-hover:shadow-indigo-500/40 dark:group-hover:shadow-indigo-500/50 group-hover:border-indigo-300 dark:group-hover:border-indigo-500 group-hover:-translate-y-3 transition-all duration-300 ease-out flex flex-col h-full will-change-transform relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors duration-300 z-10"></div>
          <img src={course.image} alt={course.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" loading="lazy" decoding="async" />
          {user && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(course.id); }}
              aria-label={isFavorited ? t('removeFromFavorites') : t('addToFavorites')}
              className="absolute top-4 left-4 z-20 p-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform duration-200"
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-500 dark:text-gray-400'}`} />
            </button>
          )}
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-600 dark:text-indigo-400 z-20 shadow-sm">
            {course.code}
          </div>
        </div>
        
        <div className="p-6 flex-1 flex flex-col relative z-20">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{course.title}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
          
          <div
            className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 -mx-2 px-2 py-1 rounded-lg transition-colors"
            onClick={(e) => { if (professor) { e.preventDefault(); e.stopPropagation(); navigate(`/professor/${professor.id}`); } }}
          >
            <img src={professor?.avatar || 'https://ui-avatars.com/api/?name=Prof'} alt={professor?.name} className="h-8 w-8 rounded-full border border-gray-200 dark:border-slate-600" loading="lazy" />
            <div className="text-sm">
              <p className="font-medium text-gray-900 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{professor?.name || t('unknownProfessor')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{professor?.specialty}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-1">
            <VerifiedBadge verified={true} />
            {professor?.rating !== undefined && <TopRatedBadge rating={professor.rating} />}
          </div>

          {course.reviewCount !== undefined && course.reviewCount > 0 && course.averageRating !== undefined ? (
            <div className="flex items-center gap-1.5 mb-4">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.round(course.averageRating!) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-slate-600'}`} />
              ))}
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{course.averageRating.toFixed(1)} ({course.reviewCount})</span>
            </div>
          ) : (
            <div className="mb-4" />
          )}

          <div className="mt-auto">
            <div className="flex justify-center mb-6 border-t border-gray-50 dark:border-slate-700 pt-4">
               <div className="text-center">
                  <span className="block text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest mb-1">{t('pricingTitle')}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-slate-200">{t('perLecture')}</span>
               </div>
            </div>
            
            <div 
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 group-hover:bg-indigo-700 text-white py-3 rounded-xl transition-all duration-300 font-medium group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-indigo-500/30"
            >
              {t('viewDetails')}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
