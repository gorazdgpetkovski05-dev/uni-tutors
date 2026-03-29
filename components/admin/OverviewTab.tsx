import React from 'react';
import {
  Users, BookOpen, Clock, AlertCircle, DollarSign, CreditCard,
  TrendingUp, BarChart3, HelpCircle, Ticket,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface OverviewStats {
  totalUsers: number;
  totalCourses: number;
  pendingBookingsCount: number;
  openTicketsCount: number;
  totalRevenue: number;
  pendingPaymentCount: number;
}

interface WeeklyDataPoint {
  week: string;
  count: number;
}

interface MonthlyRevenuePoint {
  month: string;
  revenue: number;
}

interface CoursePopularityPoint {
  name: string;
  count: number;
}

interface RecentEnrollment {
  id: string;
  status: string;
  student?: { full_name?: string };
  course?: { title?: string };
}

interface UserBreakdownItem {
  label: string;
  count: number;
  color: string;
}

interface OverviewTabProps {
  stats: OverviewStats;
  weeklyData: WeeklyDataPoint[];
  monthlyRevenue: MonthlyRevenuePoint[];
  coursePopularity: CoursePopularityPoint[];
  recentEnrollments: RecentEnrollment[];
  userBreakdown: UserBreakdownItem[];
  onGoToBookings: () => void;
  onGoToProposals: () => void;
  onGoToSupport: () => void;
  pendingBookingsCount: number;
  pendingProposalsCount: number;
  openTicketsCount: number;
  t: (k: any) => string;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  weeklyData,
  monthlyRevenue,
  coursePopularity,
  recentEnrollments,
  userBreakdown,
  onGoToBookings,
  onGoToProposals,
  onGoToSupport,
  pendingBookingsCount,
  pendingProposalsCount,
  openTicketsCount,
  t,
}) => {
  const statCards = [
    { label: t('totalUsers'), value: stats.totalUsers, icon: Users, bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
    { label: t('totalCourses'), value: stats.totalCourses, icon: BookOpen, bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    { label: t('pendingBookings'), value: stats.pendingBookingsCount, icon: Clock, bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' },
    { label: t('openTickets'), value: stats.openTicketsCount, icon: AlertCircle, bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
    { label: t('totalRevenue'), value: `${stats.totalRevenue.toLocaleString()} MKD`, icon: DollarSign, bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
    { label: t('pendingPayment'), value: stats.pendingPaymentCount, icon: CreditCard, bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className={`h-4 w-4 ${stat.text}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-500" /> Enrollment Trend (8 weeks)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} name="Enrollments" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" /> Monthly Revenue (MKD)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [`${v} MKD`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-500" /> Course Popularity (Top 5)
          </h3>
          {coursePopularity.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={coursePopularity} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Enrollments" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No enrollment data yet</p>
          )}
        </div>
      </div>

      {/* Action alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingBookingsCount > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-yellow-800 dark:text-yellow-300">{pendingBookingsCount} {t('pendingBookings')}</h3>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">{t('reviewNow')}</p>
              </div>
            </div>
            <button onClick={onGoToBookings} className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors">
              {t('reviewNow')} →
            </button>
          </div>
        )}
        {pendingProposalsCount > 0 && (
          <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Ticket className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-purple-800 dark:text-purple-300">{pendingProposalsCount} {t('proposals')}</h3>
                <p className="text-xs text-purple-600 dark:text-purple-400">{t('reviewNow')}</p>
              </div>
            </div>
            <button onClick={onGoToProposals} className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
              {t('reviewNow')} →
            </button>
          </div>
        )}
        {openTicketsCount > 0 && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-red-800 dark:text-red-300">{openTicketsCount} {t('openTickets')}</h3>
                <p className="text-xs text-red-600 dark:text-red-400">{t('support')}</p>
              </div>
            </div>
            <button onClick={onGoToSupport} className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
              {t('reviewNow')} →
            </button>
          </div>
        )}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent enrollments */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" /> {t('recentBookings')}
            </h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {recentEnrollments.map(e => (
              <div key={e.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                    {e.student?.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{e.student?.full_name || t('unknown')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{e.course?.title}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                  e.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  e.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                }`}>{t(e.status)}</span>
              </div>
            ))}
            {recentEnrollments.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-400">{t('noBookings')}</div>
            )}
          </div>
        </div>

        {/* User breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-500" /> {t('userBreakdown')}
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {userBreakdown.map(item => {
              const total = userBreakdown.reduce((sum, u) => sum + u.count, 0);
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
