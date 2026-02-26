
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookingModal } from '../components/BookingModal';
import { ArrowLeft, Calendar, Clock, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { BookingType } from '../types';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';

export const CourseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, professors } = useData();
  const { t } = useLanguage();
  
  const course = courses.find(c => c.id === id);
  const professor = course ? professors.find(p => p.id === course.professorId) : null;

  const [bookingType, setBookingType] = useState<BookingType>('full');
  const [selectedLectureId, setSelectedLectureId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const startDate = course.lectures.length > 0 ? new Date(course.lectures[0].date) : new Date();
  const endDate = course.lectures.length > 0 ? new Date(course.lectures[course.lectures.length - 1].date) : new Date();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const totalPrice = bookingType === 'full' ? course.priceFull : course.priceSingle;

  const handleBookClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Image */}
      <div className="h-64 md:h-80 w-full relative overflow-hidden group">
        <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 flex flex-col justify-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <Link to="/courses" className="text-white/80 hover:text-white flex items-center gap-2 mb-6 w-fit transition-colors">
            <ArrowLeft className="h-5 w-5" /> {t('backToCourses')}
          </Link>
          <div className="flex flex-wrap items-center gap-4 mb-2 animate-fade-in-up">
            <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold">{course.code}</span>
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md">{course.lectures.length} {t('lectures')}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{course.title}</h1>
          <p className="text-lg text-white/90 max-w-2xl">{course.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
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

            {/* Course Syllabus & Dates */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">{t('courseSchedule')}</h3>
                <p className="text-gray-500 text-sm mt-1">
                   {bookingType === 'full' 
                      ? `${t('courseScheduleFull')} ${formatDate(startDate.toISOString())} - ${formatDate(endDate.toISOString())}.`
                      : t('courseScheduleSingle')}
                </p>
              </div>
              
              <div className="divide-y divide-gray-50">
                {course.lectures.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 italic">{t('noLectures')}</div>
                ) : (
                    course.lectures.map((lecture, index) => (
                    <div 
                        key={lecture.id} 
                        className={`p-4 transition-colors hover:bg-gray-50 flex items-start gap-4 cursor-pointer ${bookingType === 'single' && selectedLectureId === lecture.id ? 'bg-indigo-50 hover:bg-indigo-50 ring-1 ring-inset ring-indigo-500' : ''}`}
                        onClick={() => {
                            if (bookingType === 'single') setSelectedLectureId(lecture.id);
                        }}
                    >
                        <div className="flex-shrink-0 w-16 text-center pt-1">
                        <span className="block text-xs font-bold text-gray-400 uppercase">{new Date(lecture.date).toLocaleString('default', { month: 'short' })}</span>
                        <span className={`block text-xl font-bold ${bookingType === 'single' && selectedLectureId === lecture.id ? 'text-indigo-600' : 'text-gray-900'}`}>{new Date(lecture.date).getDate()}</span>
                        </div>
                        
                        <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h4 className={`font-semibold ${bookingType === 'single' && selectedLectureId === lecture.id ? 'text-indigo-900' : 'text-gray-900'}`}>{lecture.title}</h4>
                            {bookingType === 'single' && (
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedLectureId === lecture.id ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
                                    {selectedLectureId === lecture.id && <CheckCircle2 className="h-3 w-3 text-white" />}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {lecture.duration} mins</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Study Hub / Online</span>
                        </div>
                        </div>
                    </div>
                    ))
                )}
              </div>
            </div>

          </div>

          {/* Sidebar Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-50">
                <h3 className="text-lg font-bold text-gray-900 mb-6">{t('bookingOptions')}</h3>
                
                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
                  <button 
                    onClick={() => setBookingType('full')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${bookingType === 'full' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {t('fullCourseBundle')}
                  </button>
                  <button 
                    onClick={() => setBookingType('single')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${bookingType === 'single' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {t('singleLecture')}
                  </button>
                </div>

                {/* Details */}
                <div className="mb-6 space-y-3">
                  {bookingType === 'full' ? (
                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <p className="text-sm font-medium text-indigo-900 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {course.lectures.length} {t('totalSessions')}
                      </p>
                      <p className="text-xs text-indigo-700 mt-1 pl-6">
                        Start: {formatDate(startDate.toISOString())}<br/>
                        End: {formatDate(endDate.toISOString())}
                      </p>
                    </div>
                  ) : (
                    <div className={`p-3 rounded-lg border ${selectedLectureId ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-100'}`}>
                      <p className={`text-sm font-medium flex items-center gap-2 ${selectedLectureId ? 'text-indigo-900' : 'text-gray-500'}`}>
                        <Calendar className="h-4 w-4" />
                        {selectedLectureId 
                          ? `Date: ${formatDate(course.lectures.find(l => l.id === selectedLectureId)?.date || '')}` 
                          : t('selectLecture')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Price & Action */}
                <div className="flex justify-between items-end mb-4">
                  <span className="text-sm text-gray-500 font-medium">{t('totalAmount')}</span>
                  <span className="text-3xl font-bold text-gray-900">{totalPrice} <span className="text-base font-normal text-gray-500">MKD</span></span>
                </div>

                <button 
                disabled={bookingType === 'single' && !selectedLectureId}
                onClick={handleBookClick}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                >
                {t('bookAppt')}
                </button>
                
                <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {t('approvalRequired')}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <BookingModal 
        course={course}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bookingType={bookingType}
        selectedLectureId={selectedLectureId}
        price={totalPrice}
      />
    </div>
  );
};
