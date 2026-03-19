
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, CheckCircle2, AlertCircle, MessageCircle, BookOpen } from 'lucide-react';
import { BookingType } from '../types';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { WHATSAPP_URL } from '../constants';
import { ContactModal } from '../components/ContactModal';

export const CourseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, professors } = useData();
  const { t } = useLanguage();
  
  const course = courses.find(c => c.id === id);
  const professor = course ? professors.find(p => p.id === course.professorId) : null;

  const [bookingType] = useState<BookingType>('full');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
          <Link to="/courses" className="text-indigo-600 hover:text-indigo-800 mt-4 block">{t('backToCourses')}</Link>
        </div>
      </div>
    );
  }

  const handleBookClick = () => {
    setIsContactModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Image */}
      <div className="min-h-[400px] md:h-80 w-full relative overflow-hidden group">
        <img 
          src={course.image} 
          alt={course.title} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform" 
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[1px] md:backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 flex flex-col justify-end max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 pb-10 pt-20 md:pt-24">
          <Link to="/courses" className="text-white/80 hover:text-white flex items-center gap-2 mb-6 w-fit transition-colors">
            <ArrowLeft className="h-5 w-5" /> {t('backToCourses')}
          </Link>
          <div className="flex flex-wrap items-center gap-4 mb-2 animate-fade-in-up">
            <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold">{course.code}</span>
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm md:backdrop-blur-md">{t('flexibleSessions')}</span>
          </div>
          <h1 className="text-2xl md:text-5xl font-bold text-white mb-2 leading-tight">{course.title}</h1>
          <p className="text-base md:text-lg text-white/90 max-w-2xl line-clamp-3 md:line-clamp-none">{course.description}</p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Professor Card */}
            {professor && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                <img src={professor.avatar} alt={professor.name} className="h-16 w-16 rounded-full border-2 border-indigo-100" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{professor.name}</h3>
                  <p className="text-indigo-600 text-sm font-medium">{professor.specialty}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm text-gray-600 font-bold">{professor.rating}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Course Curriculum */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-slate-50">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  {t('whatYouWillStudy')}
                </h3>
              </div>
              
              <div className="p-6 sm:p-8">
                {course.curriculum && course.curriculum.length > 0 ? (
                  <div className="space-y-6">
                    {course.curriculum.map((item, index) => (
                      <div key={index} className="relative pl-10 sm:pl-12 group">
                        {/* Vertical Line */}
                        {index !== course.curriculum.length - 1 && (
                          <div className="absolute left-[15px] sm:left-[19px] top-10 bottom-[-24px] w-0.5 bg-indigo-100 group-hover:bg-indigo-200 transition-colors"></div>
                        )}
                        
                        {/* Number Indicator */}
                        <div className="absolute left-0 sm:left-1 top-1 w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors z-10 shadow-sm">
                          {index + 1}
                        </div>
                        
                        {/* Content */}
                        <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:border-indigo-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 ease-out">
                          <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 italic py-4">{t('noLectures')}</div>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-50">
                <h3 className="text-lg font-bold text-gray-900 mb-6">{t('bookingOptions')}</h3>
                
                {/* Details */}
                <div className="mb-6 space-y-3">
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <p className="text-sm font-medium text-indigo-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t('flexibleSessions')}
                    </p>
                    <p className="text-xs text-indigo-700 mt-2 pl-6 leading-relaxed">
                      {t('dynamicSessions')}
                    </p>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="flex justify-center items-center mb-6 py-4 border-y border-gray-50">
                  <div className="text-center">
                    <span className="block text-xs text-indigo-600 font-bold uppercase tracking-widest mb-1">{t('pricingTitle')}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {t('perCourse')}
                    </span>
                  </div>
                </div>

                <button 
                onClick={handleBookClick}
                className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-1 active:scale-[0.98]"
                >
                <MessageCircle className="h-5 w-5" />
                {t('confirmBooking')}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
        courseTitle={course.title}
      />
    </div>
  );
};
