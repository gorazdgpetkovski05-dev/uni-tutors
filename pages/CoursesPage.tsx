
import React, { useState } from 'react';
import { CourseCard } from '../components/CourseCard';
import { Search, Filter } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';

export const CoursesPage: React.FC = () => {
  const { courses } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('All');
  const { t } = useLanguage();

  // Extract unique universities from available courses
  const universities = ['All', ...new Set(courses.map(c => c.university || 'FINKI'))];

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUni = selectedUniversity === 'All' || c.university === selectedUniversity;
    return matchesSearch && matchesUni;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('availableCourses')}</h1>
            <p className="mt-2 text-gray-600">{t('selectSubject')}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
             {/* University Filter */}
             <div className="relative">
                <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white w-full sm:w-48 appearance-none cursor-pointer"
                >
                    <option value="All">{t('allUniversities')}</option>
                    {universities.filter(u => u !== 'All').map(uni => (
                        <option key={uni} value={uni}>{uni}</option>
                    ))}
                </select>
             </div>

             {/* Search */}
             <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                type="text" 
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
                />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => (
            <CourseCard 
              key={course.id} 
              course={course} 
            />
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 mt-4">
            <div className="text-gray-400 mb-2">
                <Search className="h-10 w-10 mx-auto opacity-50" />
            </div>
            <p className="text-gray-500 font-medium">{t('noCoursesFound')}</p>
            <button 
                onClick={() => {setSearchTerm(''); setSelectedUniversity('All');}}
                className="mt-4 text-indigo-600 font-bold hover:underline"
            >
                Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
