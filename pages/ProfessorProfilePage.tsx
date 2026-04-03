
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, BookOpen, Users, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Review, Session as SessionRecord } from '../types';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { CourseCard } from '../components/CourseCard';
import { AvailabilityBadge } from '../components/AvailabilityBadge';
import { VerifiedBadge, TopRatedBadge, ExperienceBadge, ResponseTimeBadge } from '../components/badges/TrustBadges';
import { WeeklySchedule } from '../components/WeeklySchedule';
import { motion } from 'motion/react';

const BIO_CHAR_LIMIT = 300;

const BioSection: React.FC<{ bio: string | null; noBioText: string; title: string; readMoreText: string; readLessText: string }> = ({ bio, noBioText, title, readMoreText, readLessText }) => {
  const [expanded, setExpanded] = useState(false);

  if (!bio) {
    return (
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-400 dark:text-gray-500 italic">{noBioText}</p>
      </div>
    );
  }

  const isLong = bio.length > BIO_CHAR_LIMIT;
  const paragraphs = bio.split(/\n+/).filter(p => p.trim());

  // For truncation: show text up to BIO_CHAR_LIMIT chars
  const truncatedParagraphs = useMemo(() => {
    if (!isLong || expanded) return paragraphs;
    let remaining = BIO_CHAR_LIMIT;
    const result: string[] = [];
    for (const p of paragraphs) {
      if (remaining <= 0) break;
      if (p.length <= remaining) {
        result.push(p);
        remaining -= p.length;
      } else {
        // Cut at last word boundary
        const cut = p.slice(0, remaining);
        const lastSpace = cut.lastIndexOf(' ');
        result.push((lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '...');
        break;
      }
    }
    return result;
  }, [paragraphs, isLong, expanded]);

  const displayParagraphs = expanded ? paragraphs : truncatedParagraphs;

  return (
    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      <div className="text-gray-600 dark:text-gray-400 leading-relaxed space-y-3">
        {displayParagraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
        >
          {expanded ? readLessText : readMoreText}
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
};

export const ProfessorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { courses, professors } = useData();
  const { t } = useLanguage();

  const professor = professors.find(p => p.id === id);
  const professorCourses = courses.filter(c => c.professorId === id);

  const [bio, setBio] = useState<string | null>(null);
  const [reviews, setReviews] = useState<(Review & { student?: { full_name: string; avatar_url: string | null } })[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchProfessorDetails = async () => {
      // Fetch bio from professors table (where bio column lives)
      const { data: profData } = await supabase
        .from('professors')
        .select('bio')
        .eq('id', id)
        .single();

      if (profData) {
        setBio(profData.bio || null);
      }

      // Fetch member since from profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', id)
        .single();

      if (profileData) {
        setMemberSince(profileData.created_at);
      }

      // Fetch reviews for this professor
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*, student:profiles!reviews_student_id_fkey(full_name, avatar_url)')
        .eq('professor_id', id)
        .order('created_at', { ascending: false });

      if (reviewData) {
        setReviews(reviewData);
        if (reviewData.length > 0) {
          const avg = reviewData.reduce((sum, r) => sum + r.rating, 0) / reviewData.length;
          setAvgRating(Math.round(avg * 10) / 10);
        }
      }

      // Fetch total unique students enrolled in this professor's courses
      const { count } = await supabase
        .from('enrollments')
        .select('student_id', { count: 'exact', head: true })
        .in('course_id', professorCourses.map(c => c.id));

      setTotalStudents(count || 0);

      // Fetch sessions for availability badge
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select('id')
        .in('course_id', professorCourses.map(c => c.id));

      if (enrollmentData && enrollmentData.length > 0) {
        const { data: sessionData } = await supabase
          .from('sessions')
          .select('*')
          .in('enrollment_id', enrollmentData.map(e => e.id))
          .order('session_date', { ascending: true });
        if (sessionData) setSessions(sessionData);
      }
    };

    fetchProfessorDetails();
  }, [id, professorCourses.length]);

  if (!professor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center px-4">
          <BookOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('courseNotFound')}</h2>
          <Link to="/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:-translate-y-1">
            <ArrowLeft className="h-4 w-4" /> {t('backToProfessors')}
          </Link>
        </div>
      </div>
    );
  }

  const rating = avgRating ?? professor.rating;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20 transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 dark:from-indigo-900 dark:to-slate-900 pt-24 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <Link to="/courses" className="text-white/80 hover:text-white flex items-center gap-2 mb-8 w-fit transition-colors">
            <ArrowLeft className="h-5 w-5" /> {t('backToProfessors')}
          </Link>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 -mt-24 relative z-10">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.21, 1.02, 0.73, 1] }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-slate-900/50 border border-gray-200 dark:border-slate-700 p-6 sm:p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img
              src={professor.avatar}
              alt={professor.name}
              className="w-28 h-28 rounded-full object-cover ring-4 ring-indigo-100 dark:ring-indigo-900/50 shadow-lg"
            />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                {professor.name}
                <VerifiedBadge verified={true} />
              </h1>
              <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-2">{professor.specialty}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                <TopRatedBadge rating={rating} />
                <ExperienceBadge sessionCount={sessions.length} />
                <ResponseTimeBadge />
              </div>
              {rating > 0 && (
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`h-5 w-5 ${i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-slate-600'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{rating.toFixed(1)}</span>
                  {reviews.length > 0 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">({reviews.length} {t('reviews')})</span>
                  )}
                </div>
              )}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {professorCourses.length} {t('courses')}</span>
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {totalStudents} {t('totalStudents')}</span>
                {memberSince && (
                  <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {t('memberSince')} {new Date(memberSince).getFullYear()}</span>
                )}
              </div>
              <div className="mt-3">
                <AvailabilityBadge sessions={sessions} />
              </div>
            </div>
          </div>

          {/* Bio */}
          <BioSection bio={bio} noBioText={t('noBio')} title={t('aboutProfessor')} readMoreText={t('readMore')} readLessText={t('readLess')} />
        </motion.div>

        {/* Weekly Schedule */}
        {professorCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.21, 1.02, 0.73, 1] }}
            className="mb-8"
          >
            <WeeklySchedule courseIds={professorCourses.map(c => c.id)} />
          </motion.div>
        )}

        {/* Courses Section */}
        {professorCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.21, 1.02, 0.73, 1] }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('coursesBy')} {professor.name}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {professorCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.21, 1.02, 0.73, 1] }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-md dark:shadow-slate-900/50 border border-gray-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                {t('reviews')} ({reviews.length})
              </h3>
              {avgRating !== null && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-bold text-gray-900 dark:text-white text-lg">{avgRating.toFixed(1)}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`h-4 w-4 ${i <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 space-y-5">
              {reviews.map(review => (
                <div key={review.id} className="flex gap-4 border-b border-gray-100 dark:border-slate-700 last:border-0 pb-5 last:pb-0">
                  <img
                    src={review.student?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.student?.full_name || 'S')}&background=6366f1&color=fff`}
                    alt={review.student?.full_name || 'Student'}
                    className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{review.student?.full_name || 'Student'}</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
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
          </motion.div>
        )}
      </div>
    </div>
  );
};
