import React, { useState, useEffect } from 'react';
import { CourseCard } from '../components/CourseCard';
import { Search, Filter, ArrowUpDown, Sparkles } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { getRecommendations } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import type { Course } from '../types';

type SortOption = 'newest' | 'price_low' | 'price_high' | 'top_rated';

export const CoursesPage: React.FC = () => {
  const { courses } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const { t } = useLanguage();
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const fetchRecs = async () => {
      setLoadingRecs(true);
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course:courses(title)')
        .eq('student_id', user.id);
      if (cancelled) return;
      const enrolledTitles = (enrollments || []).map((e: any) => e.course?.title).filter(Boolean);
      const visibleCourses = courses.filter(c => !c.hidden);
      const recs = await getRecommendations(enrolledTitles, visibleCourses);
      if (!cancelled) {
        setRecommendations(recs);
        setLoadingRecs(false);
      }
    };
    if (courses.length > 0) fetchRecs();
    return () => { cancelled = true; };
  }, [user, courses]);

  // Extract unique universities from available courses
  const universities = ['All', ...new Set(courses.map(c => c.university || 'UniTutors'))];

  const filteredCourses = courses
    .filter(c => {
      if (c.hidden) return false;
      const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesUni = selectedUniversity === 'All' || c.university === selectedUniversity;
      return matchesSearch && matchesUni;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      if (sortBy === 'price_low') return (a.priceSingle ?? 0) - (b.priceSingle ?? 0);
      if (sortBy === 'price_high') return (b.priceSingle ?? 0) - (a.priceSingle ?? 0);
      if (sortBy === 'top_rated') return (b.averageRating ?? 0) - (a.averageRating ?? 0);
      return 0;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800/50 dark:to-indigo-950 py-12 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('availableCourses')}</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('selectSubject')}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
             {/* University Filter */}
             <div className="relative">
                <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="pl-10 pr-8 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white w-full sm:w-48 appearance-none cursor-pointer transition-colors"
                >
                    <option value="All">{t('allUniversities')}</option>
                    {universities.filter(u => u !== 'All').map(uni => (
                        <option key={uni} value={uni}>{uni}</option>
                    ))}
                </select>
             </div>

             {/* Sort */}
             <div className="relative">
                <ArrowUpDown className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="pl-10 pr-8 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white w-full sm:w-48 appearance-none cursor-pointer transition-colors"
                >
                  <option value="newest">{t('sortNewest')}</option>
                  <option value="price_low">{t('sortPriceLow')}</option>
                  <option value="price_high">{t('sortPriceHigh')}</option>
                  <option value="top_rated">{t('sortTopRated')}</option>
                </select>
             </div>

             {/* Search */}
             <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white w-full sm:w-64 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                />
            </div>
          </div>
        </motion.div>

        {/* AI Recommendations */}
        {user && (loadingRecs || recommendations.length > 0) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('recommendedForYou')}</h2>
              <span className="text-xs text-indigo-500 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">AI</span>
            </div>
            {loadingRecs ? (
              <div className="flex gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex-1 h-48 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
            <div className="border-b border-gray-200 dark:border-slate-700 mt-10 mb-2" />
          </motion.div>
        )}

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredCourses.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 mt-4 transition-colors"
          >
            <div className="text-gray-400 dark:text-gray-500 mb-2">
                <Search className="h-10 w-10 mx-auto opacity-50" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">{t('noCoursesFound')}</p>
            <button 
                onClick={() => {setSearchTerm(''); setSelectedUniversity('All');}}
                className="mt-4 text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-800 dark:hover:text-indigo-300 transition-all duration-300 hover:-translate-y-0.5"
            >
                {t('clearFilters')}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
