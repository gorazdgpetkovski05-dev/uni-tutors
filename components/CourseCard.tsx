
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Course } from '../types';
import { useData } from '../contexts/DataContext';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { professors } = useData();
  const professor = professors.find(p => p.id === course.professorId);
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 flex flex-col h-full will-change-transform">
      <div className="relative h-48">
        <img src={course.image} alt={course.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-600">
          {course.code}
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.description}</p>
        
        <div className="flex items-center gap-3 mb-6">
          <img src={professor?.avatar || 'https://ui-avatars.com/api/?name=Prof'} alt={professor?.name} className="h-8 w-8 rounded-full border border-gray-200" loading="lazy" />
          <div className="text-sm">
            <p className="font-medium text-gray-900">{professor?.name || 'Unknown Professor'}</p>
            <p className="text-xs text-gray-500">{professor?.specialty}</p>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex justify-center mb-6 border-t border-gray-50 pt-4">
             <div className="text-center">
                <span className="block text-xs text-indigo-600 font-bold uppercase tracking-widest mb-1">{t('pricingTitle')}</span>
                <span className="text-sm font-semibold text-gray-900">{t('perLecture')}</span>
             </div>
          </div>
          
          <Link 
            to={`/courses/${course.id}`}
            className="w-full group flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl transition-all duration-300 font-medium hover:-translate-y-1 hover:shadow-lg active:scale-95"
          >
            {t('viewDetails')}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
