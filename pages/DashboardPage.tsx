import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { Enrollment, Session as SessionRecord, CourseRecord, StudentXP, Review } from '../types';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  BookOpen, Clock, CheckCircle2, XCircle, AlertCircle, LogOut,
  ChevronRight, User, Send, MessageSquare, Star, HelpCircle,
  TrendingUp, Users, Award, BarChart3, Zap
} from 'lucide-react';
import { NotificationBell } from '../components/dashboard/NotificationBell';
import { ReviewForm } from '../components/reviews/ReviewForm';
import { XPProgressCard } from '../components/dashboard/XPProgressCard';
import { SessionCalendar } from '../components/dashboard/SessionCalendar';
import { UpcomingSessionsCard } from '../components/dashboard/UpcomingSessionsCard';
import { CourseProgressCard } from '../components/dashboard/CourseProgressCard';
import { StreakCard } from '../components/dashboard/StreakCard';
import { SuccessModal } from '../components/SuccessModal';
import { MessageThread } from '../components/messaging/MessageThread';

// ─── Student Dashboard ─────────────────────────────────────────────────────────
const StudentDashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [enrollments, setEnrollments] = useState<(Enrollment & { course?: CourseRecord })[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [xpHistory, setXpHistory] = useState<StudentXP[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'history' | 'support'>('courses');
  const [reviewEnrollment, setReviewEnrollment] = useState<Enrollment | null>(null);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [messageEnrollment, setMessageEnrollment] = useState<(Enrollment & { course?: CourseRecord }) | null>(null);

  // Detect enrollment success from URL param
  useEffect(() => {
    if (searchParams.get('enrolled') === 'true') {
      setEnrollSuccess(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Support ticket state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile?.full_name || '');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  useEffect(() => { fetchData(); }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const [enrollRes, xpRes] = await Promise.all([
      supabase.from('enrollments').select('*, course:courses(*)').eq('student_id', user.id).order('created_at', { ascending: false }),
      supabase.from('student_xp').select('*').eq('student_id', user.id).order('created_at', { ascending: false }).limit(10),
    ]);

    if (enrollRes.data) {
      setEnrollments(enrollRes.data);
      const enrollmentIds = enrollRes.data.map(e => e.id);
      if (enrollmentIds.length > 0) {
        const { data: sessionData } = await supabase
          .from('sessions').select('*').in('enrollment_id', enrollmentIds).order('session_date', { ascending: true });
        if (sessionData) setSessions(sessionData);
      }
    }
    if (xpRes.data) setXpHistory(xpRes.data);
    setLoading(false);
  };

  const submitSupportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const sanitizedSubject = ticketSubject.trim().slice(0, 200);
    const sanitizedDesc = ticketDesc.trim().slice(0, 2000);
    if (!sanitizedSubject || !sanitizedDesc) return;
    setTicketSubmitting(true);
    const { error: ticketError } = await supabase.from('support_tickets').insert({ user_id: user.id, subject: sanitizedSubject, description: sanitizedDesc });
    if (ticketError) { console.error('Failed to submit ticket:', ticketError.message); setTicketSubmitting(false); return; }
    setTicketSubject(''); setTicketDesc('');
    setTicketSubmitting(false); setTicketSuccess(true);
    setTimeout(() => setTicketSuccess(false), 3000);
  };

  const saveProfile = async () => {
    if (!user) return;
    const sanitizedName = editName.trim().slice(0, 100);
    if (!sanitizedName) return;
    await supabase.from('profiles').update({ full_name: sanitizedName }).eq('id', user.id);
    setEditingProfile(false);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
    fetchData();
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  };

  const sessionStatusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    missed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-200 dark:border-indigo-900"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin"></div>
        </div>
      </div>
    );
  }

  const activeEnrollments = enrollments.filter(e => e.status === 'approved');
  const pendingEnrollments = enrollments.filter(e => e.status === 'pending');
  const completedEnrollments = enrollments.filter(e => e.status === 'completed');

  const enrollmentMap: Record<string, { courseName: string }> = {};
  enrollments.forEach(e => {
    enrollmentMap[e.id] = { courseName: e.course?.title || t('unknownCourse') };
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('welcomeBack')}, {profile?.full_name || t('student')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('welcomeMessage')}</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <button onClick={() => setEditingProfile(!editingProfile)} className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
            <User className="h-4 w-4" /> {t('editProfile')}
          </button>
          <button onClick={signOut} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
            <LogOut className="h-4 w-4" /> {t('logout')}
          </button>
        </div>
      </div>

      {/* Profile Edit */}
      {profileSaveSuccess && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {t('profileUpdated')}
        </div>
      )}
      {editingProfile && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 mb-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">{t('editProfile')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('fullName')}</label>
              <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={t('fullName')} />
            </div>
            <div className="flex gap-3">
              <button onClick={saveProfile}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all">
                <CheckCircle2 className="h-4 w-4" /> {t('saveChanges')}
              </button>
              <button onClick={() => { setEditingProfile(false); setEditName(profile?.full_name || ''); }}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                {t('cancel')}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: t('enrolledCourses'), value: activeEnrollments.length, icon: BookOpen, bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
          { label: t('pendingRequests'), value: pendingEnrollments.length, icon: Clock, bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' },
          { label: t('completedCourses'), value: completedEnrollments.length, icon: CheckCircle2, bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
          { label: t('totalSessions'), value: sessions.filter(s => s.status === 'completed').length, icon: Star, bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-2`}>
              <stat.icon className={`h-5 w-5 ${stat.text}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* XP + Streak + Calendar + Upcoming row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <XPProgressCard xp={profile?.xp || 0} level={profile?.level || 1} xpHistory={xpHistory} />
        <UpcomingSessionsCard sessions={sessions} enrollmentMap={enrollmentMap} />
        <div className="flex flex-col gap-4">
          <StreakCard />
          <SessionCalendar sessions={sessions} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link to="/courses" className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md">
          <BookOpen className="h-4 w-4" /> {t('browseCourses')}
        </Link>
        <button onClick={() => setActiveTab('support')} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all hover:-translate-y-0.5">
          <HelpCircle className="h-4 w-4" /> {t('support')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1 mb-6">
        {(['courses', 'history', 'support'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab === 'courses' ? t('myCourses') : tab === 'history' ? t('sessionHistory') : t('support')}
          </button>
        ))}
      </div>

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
          {enrollments.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-slate-700 text-center">
              <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">{t('noEnrollments')}</p>
              <Link to="/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all">
                {t('browseCourses')} <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            enrollments.map(enrollment => (
              <motion.div
                key={enrollment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white">{enrollment.course?.title || t('unknownCourse')}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[enrollment.status]}`}>
                        {t(enrollment.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {enrollment.course?.code} • {t(enrollment.booking_type)} • {new Date(enrollment.created_at).toLocaleDateString()}
                    </p>
                    {enrollment.discount_percent > 0 && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                        <Zap className="h-3 w-3" /> {t('discountApplied')}: {enrollment.discount_percent}%
                      </p>
                    )}
                    {enrollment.status === 'approved' && enrollment.discord_link && (
                      <a href={enrollment.discord_link} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 px-4 py-2 text-sm bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md">
                        <MessageSquare className="h-4 w-4" /> {t('joinDiscord')}
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {enrollment.status === 'approved' && (
                      <button onClick={() => setMessageEnrollment(enrollment)}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                        title={t('messages')}>
                        <MessageSquare className="h-4 w-4" /> {t('messages')}
                      </button>
                    )}
                    {enrollment.status === 'completed' && (
                      <button onClick={() => setReviewEnrollment(enrollment)}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 rounded-lg font-bold hover:from-yellow-300 hover:to-orange-300 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md hover:shadow-yellow-400/30">
                        <Star className="h-4 w-4 fill-current" /> {t('leaveReview')}
                      </button>
                    )}
                    {enrollment.course && (
                      <Link to={`/courses/${enrollment.course.id}`}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                        {t('viewDetails')} <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
                {enrollment.status === 'approved' && (
                  <CourseProgressCard enrollment={enrollment} sessions={sessions} courseName={enrollment.course?.title || t('unknownCourse')} />
                )}
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* Session History Tab */}
      {activeTab === 'history' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-3">
          {sessions.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-slate-700 text-center">
              <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">{t('noSessions')}</p>
            </div>
          ) : (
            sessions.map(session => {
              const enrollment = enrollments.find(e => e.id === session.enrollment_id);
              return (
                <div key={session.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 flex items-center justify-between hover:border-gray-300 dark:hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${
                      session.status === 'completed' ? 'bg-green-500' :
                      session.status === 'scheduled' ? 'bg-blue-500' :
                      session.status === 'missed' ? 'bg-red-500' : 'bg-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{session.title || enrollment?.course?.title || t('session')}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {session.session_date
                          ? new Date(session.session_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                          : new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${sessionStatusColors[session.status]}`}>
                    {t(session.status)}
                  </span>
                </div>
              );
            })
          )}
        </motion.div>
      )}

      {/* Support Tab */}
      {activeTab === 'support' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            {t('submitSupportTicket')}
          </h3>
          {ticketSuccess && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> {t('ticketSubmitted')}
            </div>
          )}
          <form onSubmit={submitSupportTicket} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('subject')}</label>
              <input type="text" value={ticketSubject} onChange={e => setTicketSubject(e.target.value)} required maxLength={200}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={t('ticketSubjectPlaceholder')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('descriptionLabel')}</label>
              <textarea value={ticketDesc} onChange={e => setTicketDesc(e.target.value)} required rows={4} maxLength={2000}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder={t('ticketDescPlaceholder')} />
            </div>
            <button type="submit" disabled={ticketSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50">
              <Send className="h-4 w-4" /> {t('submitTicket')}
            </button>
          </form>
        </motion.div>
      )}

      {/* Review Modal */}
      {reviewEnrollment && (
        <ReviewForm
          enrollment={reviewEnrollment}
          onClose={() => setReviewEnrollment(null)}
          onSubmitted={() => { setReviewEnrollment(null); fetchData(); }}
        />
      )}

      {/* Message Thread Modal */}
      {messageEnrollment && user && (
        <MessageThread
          enrollmentId={messageEnrollment.id}
          currentUserId={user.id}
          otherUserName={messageEnrollment.course?.title || t('unknownCourse')}
          onClose={() => setMessageEnrollment(null)}
        />
      )}

      {/* Enrollment Success Modal */}
      <SuccessModal
        isOpen={enrollSuccess}
        title={t('requestSent')}
        description={t('requestSentDesc')}
        xpEarned={50}
        onClose={() => setEnrollSuccess(false)}
      />
    </div>
  );
};

// ─── Professor Dashboard ────────────────────────────────────────────────────────
const ProfessorDashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { t } = useLanguage();
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [enrollments, setEnrollments] = useState<(Enrollment & { student?: any; course?: any })[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'students' | 'schedule' | 'proposal'>('overview');
  const [messageEnrollment, setMessageEnrollment] = useState<(Enrollment & { student?: any; course?: any }) | null>(null);

  // Course proposal state
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDesc, setProposalDesc] = useState('');
  const [proposalCode, setProposalCode] = useState('');
  const [proposalUni, setProposalUni] = useState('');
  const [proposalSubmitting, setProposalSubmitting] = useState(false);
  const [proposalSuccess, setProposalSuccess] = useState(false);

  // Schedule session state
  const [schedCourseId, setSchedCourseId] = useState('');
  const [schedTitle, setSchedTitle] = useState('');
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [schedNotes, setSchedNotes] = useState('');
  const [schedSuccess, setSchedSuccess] = useState(false);
  const [schedSubmitting, setSchedSubmitting] = useState(false);

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile?.full_name || '');
  const [editSpecialty, setEditSpecialty] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState(profile?.avatar_url || '');
  const [editBio, setEditBio] = useState('');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  useEffect(() => { fetchData(); }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const { data: courseData } = await supabase.from('courses').select('*').eq('professor_id', user.id);
    if (courseData) setCourses(courseData);

    const courseIds = (courseData || []).map(c => c.id);

    const [enrollRes, reviewRes] = await Promise.all([
      courseIds.length > 0
        ? supabase.from('enrollments').select('*, student:profiles!enrollments_student_id_fkey(*), course:courses(*)').in('course_id', courseIds)
        : Promise.resolve({ data: [] }),
      courseIds.length > 0
        ? supabase.from('reviews').select('*, student:profiles!reviews_student_id_fkey(*)').in('course_id', courseIds).order('created_at', { ascending: false }).limit(10)
        : Promise.resolve({ data: [] }),
    ]);
    if (enrollRes.data) setEnrollments(enrollRes.data);
    if (reviewRes.data) setReviews(reviewRes.data);

    // Fetch sessions for professor's enrollments
    const enrollmentIds = (enrollRes.data || []).map(e => e.id);
    if (enrollmentIds.length > 0) {
      const { data: sessionData } = await supabase.from('sessions').select('*').in('enrollment_id', enrollmentIds).order('session_date', { ascending: true });
      if (sessionData) setSessions(sessionData);
    }

    const { data: profData } = await supabase.from('professors').select('*').eq('id', user.id).single();
    if (profData) {
      setEditSpecialty(profData.specialty || '');
      setEditBio((profData as any).bio || '');
    }

    setLoading(false);
  };

  const submitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const sanitizedTitle = proposalTitle.trim().slice(0, 200);
    const sanitizedDesc = proposalDesc.trim().slice(0, 2000);
    const sanitizedCode = proposalCode.trim().slice(0, 20);
    const sanitizedUni = proposalUni.trim().slice(0, 200);
    if (!sanitizedTitle || !sanitizedDesc) return;
    setProposalSubmitting(true);
    const { error: proposalError } = await supabase.from('course_proposals').insert({
      professor_id: user.id, title: sanitizedTitle, description: sanitizedDesc,
      course_code: sanitizedCode, university: sanitizedUni,
    });
    if (proposalError) { console.error('Failed to submit proposal:', proposalError.message); setProposalSubmitting(false); return; }
    setProposalTitle(''); setProposalDesc(''); setProposalCode(''); setProposalUni('');
    setProposalSubmitting(false); setProposalSuccess(true);
    setTimeout(() => setProposalSuccess(false), 3000);
  };

  const saveProfile = async () => {
    if (!user) return;
    const sanitizedName = editName.trim().slice(0, 100);
    if (!sanitizedName) return;
    const sanitizedSpecialty = editSpecialty.trim().slice(0, 200);
    const sanitizedBio = editBio.trim().slice(0, 1000);
    // Validate avatar URL if provided
    let safeAvatarUrl = '';
    if (editAvatarUrl) {
      try {
        const url = new URL(editAvatarUrl);
        if (url.protocol === 'https:' || url.protocol === 'http:') {
          safeAvatarUrl = editAvatarUrl.trim().slice(0, 500);
        }
      } catch {
        // Invalid URL, skip it
      }
    }
    const profileUpdate: any = { full_name: sanitizedName };
    if (safeAvatarUrl) profileUpdate.avatar_url = safeAvatarUrl;
    await supabase.from('profiles').update(profileUpdate).eq('id', user.id);
    await supabase.from('professors').update({ specialty: sanitizedSpecialty, bio: sanitizedBio }).eq('id', user.id);
    setEditingProfile(false);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
    fetchData();
  };

  const scheduleSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedCourseId || !schedTitle || !schedDate) return;
    if (schedDate < new Date().toISOString().split('T')[0]) {
      alert(t('sessionDatePastError'));
      return;
    }
    const naiveDate = schedTime ? `${schedDate}T${schedTime}:00` : `${schedDate}T00:00:00`;
    const d = new Date(naiveDate);
    const sessionDate = d.toISOString();
    setSchedSubmitting(true);
    try {
      // Get all approved enrollments for this course
      const courseEnrollments = enrollments.filter(en => en.course_id === schedCourseId && en.status === 'approved');
      if (courseEnrollments.length === 0) return;
      // Insert a session per enrollment
      await Promise.all(courseEnrollments.map(en =>
        supabase.from('sessions').insert({
          enrollment_id: en.id,
          title: schedTitle,
          status: 'scheduled',
          session_date: sessionDate,
          notes: schedNotes || null,
        })
      ));
      // Notify enrolled students
      await Promise.all(courseEnrollments.map(en =>
        supabase.from('notifications').insert({
          user_id: en.student_id,
          title: t('sessionScheduled'),
          message: `${schedTitle} — ${new Date(sessionDate).toLocaleString()}`,
          type: 'general',
          link: '/dashboard',
        })
      ));
      setSchedTitle(''); setSchedDate(''); setSchedTime(''); setSchedNotes(''); setSchedCourseId('');
      setSchedSuccess(true);
      setTimeout(() => setSchedSuccess(false), 3000);
      fetchData();
    } finally {
      setSchedSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-200 dark:border-indigo-900"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin"></div>
        </div>
      </div>
    );
  }

  const activeStudents = enrollments.filter(e => e.status === 'approved').length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '—';

  const enrollmentMap: Record<string, { courseName: string; studentName?: string }> = {};
  enrollments.forEach(e => {
    enrollmentMap[e.id] = { courseName: e.course?.title || '', studentName: e.student?.full_name };
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('welcomeBack')}, {profile?.full_name || t('professor')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('welcomeMessage')}</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <button onClick={() => setEditingProfile(!editingProfile)} className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
            <User className="h-4 w-4" /> {t('editProfile')}
          </button>
          <button onClick={signOut} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
            <LogOut className="h-4 w-4" /> {t('logout')}
          </button>
        </div>
      </div>

      {/* Profile Edit */}
      {profileSaveSuccess && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {t('profileUpdated')}
        </div>
      )}
      {editingProfile && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 mb-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">{t('editProfile')}</h3>
          <div className="flex items-center gap-4 mb-4">
            <img
              src={editAvatarUrl || profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(editName)}&background=6366f1&color=fff&size=128`}
              alt={editName}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-indigo-50 dark:ring-indigo-900/30"
            />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('avatarUrl')}</label>
              <input type="url" value={editAvatarUrl} onChange={e => setEditAvatarUrl(e.target.value)}
                placeholder="https://example.com/your-photo.jpg"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('fullName')}</label>
              <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('specialty')}</label>
              <input type="text" value={editSpecialty} onChange={e => setEditSpecialty(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('bio')}</label>
            <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={3}
              placeholder={t('bioPlaceholder')}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <button onClick={saveProfile} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all">
            {t('saveChanges')}
          </button>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: t('assignedCourses'), value: courses.length, icon: BookOpen, bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
          { label: t('activeStudents'), value: activeStudents, icon: Users, bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
          { label: t('sessionsCompleted'), value: completedSessions, icon: CheckCircle2, bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
          { label: t('averageRating'), value: avgRating, icon: Star, bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-2`}>
              <stat.icon className={`h-5 w-5 ${stat.text}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Calendar + Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <UpcomingSessionsCard sessions={sessions} enrollmentMap={enrollmentMap} />
        <SessionCalendar sessions={sessions} />
      </div>

      {/* Recent Reviews */}
      {reviews.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 mb-6 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" /> {t('recentReviews')}
            </h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {reviews.slice(0, 5).map(review => (
              <div key={review.id} className="px-4 py-3 flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                  {(review.student as any)?.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{(review.student as any)?.full_name || t('student')}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{review.comment}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1 mb-6 overflow-x-auto no-scrollbar">
        {(['overview', 'courses', 'students', 'schedule', 'proposal'] as const).map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
            {tab === 'overview' ? t('overview') : tab === 'courses' ? t('myCourses') : tab === 'students' ? t('myStudents') : tab === 'schedule' ? t('scheduleSession') : t('proposeCourse')}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
          {/* Student progress list */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-500" /> {t('studentProgress')}
              </h3>
            </div>
            {enrollments.filter(e => e.status === 'approved').length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400 dark:text-gray-500">{t('noStudents')}</div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {enrollments.filter(e => e.status === 'approved').slice(0, 8).map(e => {
                  const studentSessions = sessions.filter(s => s.enrollment_id === e.id);
                  const completed = studentSessions.filter(s => s.status === 'completed').length;
                  const total = studentSessions.length;
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

                  return (
                    <div key={e.id} className="px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-xs font-bold text-green-600 dark:text-green-400 flex-shrink-0">
                        {e.student?.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{e.student?.full_name || t('unknownStudent')}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{e.course?.title}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">{completed}/{total}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* My Courses */}
      {activeTab === 'courses' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
          {courses.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-slate-700 text-center">
              <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">{t('noCourses')}</p>
            </div>
          ) : courses.map(course => {
            const courseEnrollments = enrollments.filter(e => e.course_id === course.id);
            const activeCount = courseEnrollments.filter(e => e.status === 'approved').length;
            return (
              <div key={course.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{course.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{course.code} • {course.university}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Users className="h-3 w-3" /> {activeCount} {t('activeStudents').toLowerCase()}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${course.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'}`}>
                    {course.status === 'published' ? t('published') : course.status === 'draft' ? t('draft') : t('archived')}
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Students */}
      {activeTab === 'students' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-3">
          {enrollments.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-slate-700 text-center">
              <p className="text-gray-500 dark:text-gray-400">{t('noStudents')}</p>
            </div>
          ) : enrollments.map(e => (
            <div key={e.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 flex items-center justify-between hover:border-gray-300 dark:hover:border-slate-600 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  {e.student?.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{e.student?.full_name || t('unknownStudent')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{e.course?.title} • {t(e.booking_type)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {e.status === 'approved' && (
                  <button onClick={() => setMessageEnrollment(e)}
                    className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                    title={t('messages')}>
                    <MessageSquare className="h-4 w-4" />
                  </button>
                )}
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${e.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : e.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'}`}>
                  {t(e.status)}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Schedule Session */}
      {activeTab === 'schedule' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t('scheduleSession')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{t('scheduleSessionDesc')}</p>
          {schedSuccess && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> {t('sessionScheduled')}
            </div>
          )}
          <form onSubmit={scheduleSession} className="space-y-4">
            <div>
              <label htmlFor="sched-course" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('course')}</label>
              <select id="sched-course" value={schedCourseId} onChange={e => setSchedCourseId(e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">{t('selectCourse')}</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              {schedCourseId && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {enrollments.filter(en => en.course_id === schedCourseId && en.status === 'approved').length} {t('enrolledStudentsWillBeScheduled')}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="sched-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sessionTitle')}</label>
              <input id="sched-title" type="text" value={schedTitle} onChange={e => setSchedTitle(e.target.value)} required
                placeholder={t('sessionTitlePlaceholder')}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sched-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('dateLabel')}</label>
                <input id="sched-date" type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)} required
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label htmlFor="sched-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('timeOptional')}</label>
                <input id="sched-time" type="time" value={schedTime} onChange={e => setSchedTime(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label htmlFor="sched-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('notesOptional')}</label>
              <textarea id="sched-notes" value={schedNotes} onChange={e => setSchedNotes(e.target.value)} rows={3}
                placeholder={t('notesPlaceholder')}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
            <button type="submit" disabled={schedSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50">
              <Send className="h-4 w-4" /> {t('scheduleSession')}
            </button>
          </form>
        </motion.div>
      )}

      {/* Propose Course */}
      {activeTab === 'proposal' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('proposeCourse')}</h3>
          {proposalSuccess && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> {t('proposalSubmitted')}
            </div>
          )}
          <form onSubmit={submitProposal} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('courseTitle')}</label>
                <input type="text" value={proposalTitle} onChange={e => setProposalTitle(e.target.value)} required
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('courseCode')}</label>
                <input type="text" value={proposalCode} onChange={e => setProposalCode(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('university')}</label>
              <input type="text" value={proposalUni} onChange={e => setProposalUni(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('descriptionLabel')}</label>
              <textarea value={proposalDesc} onChange={e => setProposalDesc(e.target.value)} required rows={4}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
            <button type="submit" disabled={proposalSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50">
              <Send className="h-4 w-4" /> {t('submitProposal')}
            </button>
          </form>
        </motion.div>
      )}

      {/* Message Thread Modal */}
      {messageEnrollment && user && (
        <MessageThread
          enrollmentId={messageEnrollment.id}
          currentUserId={user.id}
          otherUserName={messageEnrollment.student?.full_name || t('unknownStudent')}
          onClose={() => setMessageEnrollment(null)}
        />
      )}
    </div>
  );
};

// ─── Main Dashboard Page (role-based) ───────────────────────────────────────────
export const DashboardPage: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800/50 dark:to-indigo-950 py-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {profile?.role === 'professor' ? <ProfessorDashboard /> : <StudentDashboard />}
      </div>
    </div>
  );
};
