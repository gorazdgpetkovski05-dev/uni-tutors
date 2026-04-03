import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, LayoutDashboard, MessageSquare, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

export const MobileBottomNav: React.FC = () => {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const { user, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();

  const dashboardPath = isAdmin ? '/admin' : '/dashboard';

  const tabs = [
    { to: '/', icon: Home, label: t('home') },
    { to: '/courses', icon: BookOpen, label: t('courses') },
    { to: user ? dashboardPath : '/login', icon: LayoutDashboard, label: t('dashboard') },
    ...(user
      ? [{ to: '/dashboard', icon: MessageSquare, label: t('messages'), badge: unreadCount }]
      : []),
    ...(user
      ? [{ to: '/dashboard', icon: User, label: t('profile') }]
      : [{ to: '/signup', icon: User, label: t('signup') }]),
  ];

  const isActive = (to: string) => pathname === to;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-14">
        {tabs.map(({ to, icon: Icon, label, badge }) => {
          const active = isActive(to);
          return (
            <Link
              key={label}
              to={to}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200 ${
                active
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <span className="relative">
                <Icon className="h-5 w-5" />
                {badge != null && badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </span>
              <span className="text-[10px] mt-0.5 font-medium leading-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
