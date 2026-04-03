import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { Enrollment, CourseRecord, Profile, CourseProposal, SupportTicket } from '../types';
import {
  LayoutDashboard, BookOpen, Users, Ticket, LogOut,
  Clock, Star, HelpCircle,
} from 'lucide-react';
import { NotificationBell } from '../components/dashboard/NotificationBell';
import { BookingsTab } from '../components/admin/BookingsTab';
import { CoursesTab } from '../components/admin/CoursesTab';
import { UsersTab } from '../components/admin/UsersTab';
import { SessionsTab } from '../components/admin/SessionsTab';
import { ProposalsTab } from '../components/admin/ProposalsTab';
import { SupportTab } from '../components/admin/SupportTab';
import { OverviewTab } from '../components/admin/OverviewTab';

type AdminTab = 'overview' | 'bookings' | 'courses' | 'users' | 'proposals' | 'support' | 'sessions';

export const AdminPage: React.FC = () => {
  const { profile, signOut } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [proposals, setProposals] = useState<CourseProposal[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [enrollRes, courseRes, userRes, proposalRes, ticketRes] = await Promise.all([
      supabase.from('enrollments').select('*, student:profiles!enrollments_student_id_fkey(*), course:courses(*)').order('created_at', { ascending: false }),
      supabase.from('courses').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('course_proposals').select('*, professor:profiles!course_proposals_professor_id_fkey(*)').order('created_at', { ascending: false }),
      supabase.from('support_tickets').select('*, user:profiles!support_tickets_user_id_fkey(*), messages:support_ticket_messages(*, sender:profiles!support_ticket_messages_sender_id_fkey(*))').order('created_at', { ascending: false }),
    ]);
    if (enrollRes.data) setEnrollments(enrollRes.data);
    if (courseRes.data) setCourses(courseRes.data);
    if (userRes.data) setUsers(userRes.data);
    if (proposalRes.data) setProposals(proposalRes.data);
    if (ticketRes.data) setSupportTickets(ticketRes.data);
    setLoading(false);
  };

  // Booking actions — now awards XP on approval and completion
  const updateEnrollment = async (id: string, status: string, discordLink?: string) => {
    const enrollment = enrollments.find(e => e.id === id);

    // Calculate discount for student if approving
    let discountPercent = 0;
    if (status === 'approved' && enrollment) {
      const { data: studentProfile } = await supabase
        .from('profiles').select('level').eq('id', enrollment.student_id).single();
      if (studentProfile) {
        discountPercent = studentProfile.level >= 3 ? 10 : studentProfile.level >= 2 ? 5 : 0;
      }
    }

    const updates: any = { status };
    if (discordLink) updates.discord_link = discordLink;
    if (status === 'approved') {
      updates.discount_percent = discountPercent;
      // Calculate price_paid if course data available
      const course = (enrollment as any)?.course;
      if (course && course.price_full > 0) {
        updates.price_paid = Math.round(course.price_full * (1 - discountPercent / 100));
      }
    }
    const { error: enrollUpdateError } = await supabase.from('enrollments').update(updates).eq('id', id);
    if (enrollUpdateError) { if (import.meta.env.DEV) console.error('Failed:', enrollUpdateError.message); alert(t('operationFailed')); return; }

    if (enrollment) {
      // Notify student
      await supabase.from('notifications').insert({
        user_id: enrollment.student_id,
        title: status === 'approved' ? t('bookingApprovedTitle') : status === 'rejected' ? t('bookingRejectedTitle') : t('bookingUpdatedTitle'),
        message: status === 'approved'
          ? t('bookingApprovedMsg')
          : status === 'rejected'
          ? t('bookingRejectedMsg')
          : `${t('bookingStatusUpdated')}: ${status}`,
        type: status === 'approved' ? 'booking_approved' : status === 'rejected' ? 'booking_rejected' : 'general',
        link: '/dashboard',
      });

      // Award XP on approval (+50 XP)
      if (status === 'approved') {
        await supabase.from('student_xp').insert({
          student_id: enrollment.student_id,
          amount: 50,
          reason: 'enrollment_approved',
          reference_id: id,
        });
      }

      // Award XP on completion (+100 XP)
      if (status === 'completed') {
        await supabase.from('student_xp').insert({
          student_id: enrollment.student_id,
          amount: 100,
          reason: 'course_completed',
          reference_id: id,
        });
      }
    }
    fetchAll();
  };

  // Course actions
  const updateCourseStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('courses').update({ status }).eq('id', id);
    if (error) { if (import.meta.env.DEV) console.error('Failed:', error.message); alert(t('operationFailed')); return; }
    fetchAll();
  };

  // User role update
  const updateUserRole = async (id: string, role: string) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) { if (import.meta.env.DEV) console.error('Failed:', error.message); alert(t('operationFailed')); return; }
    if (role === 'professor') {
      const { data: existing } = await supabase.from('professors').select('id').eq('id', id).single();
      if (!existing) {
        await supabase.from('professors').insert({ id, specialty: '' });
      }
    }
    fetchAll();
  };

  // Proposal actions
  const updateProposal = async (id: string, status: string, notes?: string) => {
    const updates: any = { status };
    if (notes !== undefined) updates.admin_notes = notes;
    const { error: proposalUpdateError } = await supabase.from('course_proposals').update(updates).eq('id', id);
    if (proposalUpdateError) { if (import.meta.env.DEV) console.error('Failed:', proposalUpdateError.message); alert(t('operationFailed')); return; }

    const proposal = proposals.find(p => p.id === id);
    if (proposal) {
      await supabase.from('notifications').insert({
        user_id: proposal.professor_id,
        title: t('proposalUpdatedTitle'),
        message: `${t('proposalStatus')}: ${status}`,
        type: 'course_proposal',
      });
    }
    fetchAll();
  };

  // Support ticket actions
  const updateTicketStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('support_tickets').update({ status }).eq('id', id);
    if (error) { if (import.meta.env.DEV) console.error('Failed:', error.message); alert(t('operationFailed')); return; }
    fetchAll();
  };

  const sendTicketReply = async (ticketId: string, message: string) => {
    if (!profile) return;
    const { error } = await supabase.from('support_ticket_messages').insert({
      ticket_id: ticketId,
      sender_id: profile.id,
      message,
    });
    if (error) { if (import.meta.env.DEV) console.error('Failed:', error.message); alert(t('operationFailed')); return; }

    const ticket = supportTickets.find(t => t.id === ticketId);
    if (ticket) {
      await supabase.from('notifications').insert({
        user_id: ticket.user_id,
        title: t('supportReplyTitle'),
        message: t('supportReplyMsg'),
        type: 'support_ticket',
      });
    }
    fetchAll();
  };

  // Mark payment received
  const markPaymentReceived = async (id: string, amount: number) => {
    const { error } = await supabase.from('enrollments').update({ price_paid: amount }).eq('id', id);
    if (error) { if (import.meta.env.DEV) console.error('Failed:', error.message); alert(t('operationFailed')); return; }
    fetchAll();
  };

  // Session management
  const addSession = async (enrollmentId: string, title: string, status: string) => {
    const { error } = await supabase.from('sessions').insert({ enrollment_id: enrollmentId, title, status });
    if (error) { if (import.meta.env.DEV) console.error('Failed:', error.message); alert(t('operationFailed')); return; }
    fetchAll();
  };

  const updateSession = async (id: string, status: string) => {
    const { error } = await supabase.from('sessions').update({ status }).eq('id', id);
    if (error) { if (import.meta.env.DEV) console.error('Failed:', error.message); alert(t('operationFailed')); return; }
    fetchAll();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-200 dark:border-indigo-900"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin"></div>
        </div>
      </div>
    );
  }

  const pendingBookings = enrollments.filter(e => e.status === 'pending');
  const pendingProposals = proposals.filter(p => p.status === 'pending');
  const openTickets = supportTickets.filter(t => t.status === 'open' || t.status === 'in_progress');

  // Analytics
  const paidEnrollments = enrollments.filter(e => e.price_paid && e.price_paid > 0);
  const totalRevenue = paidEnrollments.reduce((sum, e) => sum + (e.price_paid ?? 0), 0);
  const pendingPaymentCount = enrollments.filter(e => e.status === 'approved' && (!e.price_paid || e.price_paid === 0)).length;
  const now = new Date();
  const weeklyData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7 * (7 - i));
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7);
    return { week: `W${i + 1}`, count: enrollments.filter(e => { const d = new Date(e.created_at); return d >= weekStart && d < weekEnd; }).length };
  });
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleString('default', { month: 'short' });
    const revenue = paidEnrollments.filter(e => { const ed = new Date(e.created_at); return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth(); }).reduce((sum, e) => sum + (e.price_paid ?? 0), 0);
    return { month: label, revenue };
  });
  const coursePopularity = (Object.entries(enrollments.reduce((acc, e) => { const title = (e as any).course?.title || 'Unknown'; acc[title] = (acc[title] || 0) + 1; return acc; }, {} as Record<string, number>)) as [string, number][]).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name: name.length > 22 ? name.slice(0, 22) + '…' : name, count }));

  const tabs: { key: AdminTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: 'overview', label: t('overview'), icon: LayoutDashboard },
    { key: 'bookings', label: t('bookings'), icon: Clock, badge: pendingBookings.length },
    { key: 'courses', label: t('courses'), icon: BookOpen },
    { key: 'users', label: t('users'), icon: Users },
    { key: 'sessions', label: t('sessionManagement'), icon: Star },
    { key: 'proposals', label: t('proposals'), icon: Ticket, badge: pendingProposals.length },
    { key: 'support', label: t('support'), icon: HelpCircle, badge: openTickets.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Top Bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('adminPanel')}</h1>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button onClick={signOut} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <LogOut className="h-4 w-4" /> {t('logout')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto bg-gray-100 dark:bg-slate-800 rounded-xl p-1 mb-6 no-scrollbar" role="tablist">
          {tabs.map(tab => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => { setActiveTab(tab.key); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.badge ? (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <OverviewTab
            stats={{
              totalUsers: users.length,
              totalCourses: courses.length,
              pendingBookingsCount: pendingBookings.length,
              openTicketsCount: openTickets.length,
              totalRevenue,
              pendingPaymentCount,
            }}
            weeklyData={weeklyData}
            monthlyRevenue={monthlyRevenue}
            coursePopularity={coursePopularity}
            recentEnrollments={enrollments.slice(0, 5).map(e => ({
              id: e.id,
              status: e.status,
              student: (e as any).student,
              course: (e as any).course,
            }))}
            userBreakdown={[
              { label: t('students'), count: users.filter(u => u.role === 'student').length, color: 'bg-blue-500' },
              { label: t('professors'), count: users.filter(u => u.role === 'professor').length, color: 'bg-purple-500' },
              { label: t('admins'), count: users.filter(u => u.role === 'admin').length, color: 'bg-red-500' },
            ]}
            onGoToBookings={() => setActiveTab('bookings')}
            onGoToProposals={() => setActiveTab('proposals')}
            onGoToSupport={() => setActiveTab('support')}
            pendingBookingsCount={pendingBookings.length}
            pendingProposalsCount={pendingProposals.length}
            openTicketsCount={openTickets.length}
            t={t}
          />
        )}

        {/* Bookings */}
        {activeTab === 'bookings' && (
          <BookingsTab enrollments={enrollments} updateEnrollment={updateEnrollment} markPaymentReceived={markPaymentReceived} t={t} />
        )}

        {/* Courses */}
        {activeTab === 'courses' && (
          <CoursesTab courses={courses} updateCourseStatus={updateCourseStatus} t={t} fetchAll={fetchAll} />
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <UsersTab users={users} updateUserRole={updateUserRole} t={t} />
        )}

        {/* Sessions */}
        {activeTab === 'sessions' && (
          <SessionsTab enrollments={enrollments.filter(e => e.status === 'approved' || e.status === 'completed')} addSession={addSession} updateSession={updateSession} t={t} />
        )}

        {/* Proposals */}
        {activeTab === 'proposals' && (
          <ProposalsTab proposals={proposals} updateProposal={updateProposal} t={t} />
        )}

        {/* Support */}
        {activeTab === 'support' && (
          <SupportTab tickets={supportTickets} updateTicketStatus={updateTicketStatus} sendReply={sendTicketReply} t={t} />
        )}
      </div>
    </div>
  );
};
