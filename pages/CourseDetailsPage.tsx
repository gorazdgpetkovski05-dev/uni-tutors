
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, CheckCircle2, AlertCircle, MessageCircle, BookOpen, Star, Send } from 'lucide-react';
import { BookingType, Review } from '../types';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { WHATSAPP_URL } from '../constants';
import { ContactModal } from '../components/ContactModal';
import { EnrollmentCount, RecentActivity, LiveViewers } from '../components/SocialProof';

export const CourseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, professors } = useData();
  const { t } = useLanguage();
  const { user, profile, isProfessor } = useAuth();

  const course = courses.find(c => c.id === id);
  const professor = course ? professors.find(p => p.id === course.professorId) : null;

  const [bookingType] = useState<BookingType>('full');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [reviews, setReviews] = useState<(Review & { student?: { full_name: string } })[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);

  useEffect(() => {
    if (user && id) checkEnrollment();
    if (id) fetchReviews();
  }, [user, id]);

  const checkEnrollment = async () => {
    if (!user || !id) return;
    const { data } = await supabase
      .from('enrollments')
      .select('status')
      .eq('student_id', user.id)
      .eq('course_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (data) setEnrollmentStatus(data.status);
  };

  const fetchReviews = async () => {
    if (!id) return;
    const { data } = await supabase
      .from('reviews')
      .select('*, student:profiles!reviews_student_id_fkey(full_name)')
      .eq('course_id', id)
      .order('created_at', { ascending: false });
    if (data) {
      setReviews(data);
      if (data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAvgRating(Math.round(avg * 10) / 10);
      }
    }
  };

  const handleEnroll = async () => {
    if (!user || !id) return;
    setEnrolling(true);

    const { error } = await supabase.from('enrollments').insert({
      student_id: user.id,
      course_id: id,
      booking_type: 'full',
    });

    if (!error) {
      setEnrollmentStatus('pending');
      setEnrollSuccess(true);

      // Notify admin(s)
      const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
      if (admins) {
        const notifications = admins.map(admin => ({
          user_id: admin.id,
          title: t('newBookingRequest'),
          message: `${profile?.full_name || t('student')} — ${course?.title}`,
          type: 'booking_request' as const,
          link: '/admin',
        }));
        await supabase.from('notifications').insert(notifications);
      }

      // Notify professor
      if (course?.professorId) {
        await supabase.from('notifications').insert({
          user_id: course.professorId,
          title: t('newBookingRequest'),
          message: `${profile?.full_name || t('student')} — ${course.title}`,
          type: 'booking_request' as const,
        });
      }

      setTimeout(() => setEnrollSuccess(false), 4000);
    }
    setEnrolling(false);
  };

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center px-4">
          <BookOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('courseNotFound')}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{t('noCoursesFound')}</p>
          <Link to="/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:-translate-y-1">
            <ArrowLeft className="h-4 w-4" /> {t('backToCourses')}
          </Link>
        </div>
      </div>
    );
  }

  const handleBookClick = () => {
    setIsContactModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20 transition-colors duration-300">
      {/* Header Image */}
      <div className="min-h-[300px] max-h-[50vh] md:h-80 w-full relative overflow-hidden group">
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
              <Link to={`/professor/${professor.id}`} className="block group">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md dark:shadow-slate-900/50 border border-gray-200 dark:border-slate-700 flex items-center gap-4 transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-2xl dark:group-hover:shadow-indigo-500/40 group-hover:border-indigo-300 dark:group-hover:border-indigo-500 active:scale-[0.98] cursor-pointer">
                  <img src={professor.avatar} alt={professor.name} className="h-16 w-16 rounded-full border-2 border-indigo-100 dark:border-indigo-900" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{professor.name}</h3>
                    <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">{professor.specialty}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-bold">
                        {avgRating !== null ? avgRating : professor.rating}
                      </span>
                      {reviews.length > 0 && (
                        <span className="text-xs text-gray-400">({reviews.length} {t('reviews')})</span>
                      )}
                    </div>
                  </div>
                  <ArrowLeft className="h-5 w-5 text-gray-300 dark:text-gray-600 ml-auto rotate-180 group-hover:text-indigo-500 transition-colors" />
                </div>
              </Link>
            )}

            {/* Course Curriculum */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md dark:shadow-slate-900/50 border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  {t('whatYouWillStudy')}
                </h3>
              </div>

              <div className="p-6 sm:p-8">
                {course.curriculum && course.curriculum.length > 0 ? (
                  <div className="space-y-6">
                    {course.curriculum.map((item, index) => (
                      <div key={index} className="relative pl-10 sm:pl-12 group">
                        {index !== course.curriculum!.length - 1 && (
                          <div className="absolute left-[15px] sm:left-[19px] top-10 bottom-[-24px] w-0.5 bg-indigo-100 dark:bg-indigo-900/50 group-hover:bg-indigo-300 dark:group-hover:bg-indigo-500/50 transition-colors"></div>
                        )}
                        <div className="absolute left-0 sm:left-1 top-1 w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm group-hover:bg-indigo-600 group-hover:border-indigo-600 dark:group-hover:bg-indigo-500 dark:group-hover:border-indigo-500 group-hover:text-white transition-all duration-300 z-10 shadow-sm group-hover:scale-110 group-hover:-translate-y-1">
                          {index + 1}
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-sm group-hover:border-indigo-300 dark:group-hover:border-indigo-500 group-hover:shadow-2xl dark:group-hover:shadow-indigo-500/40 group-hover:-translate-y-2 group-hover:scale-[1.02] transition-all duration-300 ease-out relative overflow-hidden active:scale-[0.98]">
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 relative z-10">{item.title}</h4>
                          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base relative z-10">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 dark:text-gray-500 italic py-4">{t('noLectures')}</div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md dark:shadow-slate-900/50 border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    {t('reviews')} ({reviews.length})
                  </h3>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-bold text-gray-900 dark:text-white text-lg">
                        {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                      </span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => {
                          const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
                          return <Star key={i} className={`h-4 w-4 ${i <= Math.round(avg) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />;
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-5">
                  {reviews.map(review => (
                    <div key={review.id} className="flex gap-4 border-b border-gray-100 dark:border-slate-700 last:border-0 pb-5 last:pb-0">
                      <img
                        src={review.student?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.student?.full_name || 'S')}&background=6366f1&color=fff`}
                        alt={review.student?.full_name || t('student')}
                        className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{review.student?.full_name || t('student')}</p>
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className={`h-3.5 w-3.5 ${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{review.comment}</p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-indigo-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('bookingOptions')}</h3>

                {/* Social Proof */}
                {id && (
                  <div className="flex flex-col gap-1.5 mb-4 pb-4 border-b border-gray-100 dark:border-slate-700">
                    <EnrollmentCount courseId={id} />
                    <RecentActivity courseId={id} />
                    <LiveViewers />
                  </div>
                )}

                {/* Details */}
                <div className="mb-6 space-y-3">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                    <p className="text-sm font-medium text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t('flexibleSessions')}
                    </p>
                    <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-2 pl-6 leading-relaxed">
                      {t('dynamicSessions')}
                    </p>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="flex justify-center items-center mb-6 py-4 border-y border-gray-50 dark:border-slate-700">
                  <div className="text-center">
                    <span className="block text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest mb-1">{t('pricingTitle')}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-slate-200">
                      {t('perCourse')}
                    </span>
                  </div>
                </div>

                {/* Enrollment Success */}
                {enrollSuccess && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                    <CheckCircle2 className="h-4 w-4" /> {t('enrollSuccess')}
                  </div>
                )}

                {/* Enroll Button (for logged-in students) */}
                {user && !isProfessor && (
                  <div className="mb-3">
                    {enrollmentStatus === 'approved' || enrollmentStatus === 'completed' ? (
                      <div className="w-full flex items-center justify-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 py-3 rounded-xl font-bold text-sm">
                        <CheckCircle2 className="h-5 w-5" /> {t('alreadyEnrolled')}
                      </div>
                    ) : enrollmentStatus === 'pending' ? (
                      <div className="w-full flex items-center justify-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 py-3 rounded-xl font-bold text-sm">
                        <Clock className="h-5 w-5" /> {t('enrollmentPending')}
                      </div>
                    ) : (
                      <button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="w-full flex items-center justify-center gap-3 bg-green-600 text-white py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:bg-green-700 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50"
                      >
                        <Send className="h-5 w-5" />
                        {enrolling ? '...' : t('enrollInCourse')}
                      </button>
                    )}
                  </div>
                )}

                {/* Login to Enroll */}
                {!user && (
                  <Link to="/login" className="mb-3 w-full flex items-center justify-center gap-3 bg-green-600 text-white py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:bg-green-700 hover:shadow-xl hover:-translate-y-1">
                    <Send className="h-5 w-5" /> {t('loginToEnroll')}
                  </Link>
                )}

                {/* Contact Button */}
                <div className="group">
                  <button
                  onClick={handleBookClick}
                  className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white py-4 rounded-xl font-bold transition-all duration-300 shadow-lg group-hover:bg-indigo-700 group-hover:shadow-xl group-hover:shadow-indigo-500/30 group-hover:-translate-y-1 group-hover:scale-[1.02] active:scale-[0.98]"
                  >
                  <MessageCircle className="h-5 w-5" />
                  {t('confirmBooking')}
                  </button>
                </div>
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
