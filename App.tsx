
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Home } from './pages/Home';
import { CoursesPage } from './pages/CoursesPage';
const CourseDetailsPage = React.lazy(() => import('./pages/CourseDetailsPage').then(m => ({ default: m.CourseDetailsPage })));
const ProfessorProfilePage = React.lazy(() => import('./pages/ProfessorProfilePage').then(m => ({ default: m.ProfessorProfilePage })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = React.lazy(() => import('./pages/SignupPage').then(m => ({ default: m.SignupPage })));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AdminPage = React.lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
import { DataProvider } from './contexts/DataContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { NotificationProvider } from './contexts/NotificationContext';
import { ToastProvider } from './contexts/ToastContext';

import { DiscountPopup } from './components/DiscountPopup';
import { InfoModal } from './components/InfoModal';
import { GeoNoticeBanner } from './components/GeoNoticeBanner';
import { CookieConsent } from './components/CookieConsent';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotFoundPage } from './components/NotFoundPage';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { TopProgressBar } from './components/TopProgressBar';
import { Breadcrumbs } from './components/Breadcrumbs';

const Footer: React.FC = () => {
    const { t } = useLanguage();
    const [modalConfig, setModalConfig] = React.useState<{ isOpen: boolean; title: string; message: string }>({
        isOpen: false,
        title: '',
        message: ''
    });

    const handleLinkClick = (e: React.MouseEvent, topic: string) => {
        e.preventDefault();
        let message = "";
        let title = "";
        if (topic === 'Privacy') {
            message = t('footerPrivacyMsg');
            title = t('privacy');
        } else if (topic === 'Terms') {
            message = t('footerTermsMsg');
            title = t('terms');
        } else if (topic === 'Support') {
            message = t('footerSupportMsg');
            title = t('support');
        }

        setModalConfig({ isOpen: true, title, message });
    };

    return (
        <footer className="bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 py-12 border-t border-gray-200 dark:border-slate-800 transition-colors duration-300">
            <InfoModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                title={modalConfig.title}
                message={modalConfig.message}
            />
            <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="mb-2 font-medium text-gray-700 dark:text-slate-300">{t('footerContact')}</p>
            <p>&copy; {new Date().getFullYear()} {t('footerRights')}</p>
            <div className="mt-4 flex justify-center space-x-6 text-sm">
                <a href="#" onClick={(e) => handleLinkClick(e, 'Privacy')} className="hover:text-indigo-600 dark:hover:text-white transition-colors">{t('privacy')}</a>
                <a href="#" onClick={(e) => handleLinkClick(e, 'Terms')} className="hover:text-indigo-600 dark:hover:text-white transition-colors">{t('terms')}</a>
                <a href="#" onClick={(e) => handleLinkClick(e, 'Support')} className="hover:text-indigo-600 dark:hover:text-white transition-colors">{t('support')}</a>
            </div>
            </div>
        </footer>
    );
};

const ScrollToTop: React.FC = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [pathname]);
    return null;
};

const AppContent: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const location = useLocation();

    // Hide navbar/footer on auth pages and admin
    const isAuthPage = ['/login', '/signup'].includes(location.pathname);
    const isAdminPage = location.pathname.startsWith('/admin');

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
            <ScrollToTop />
            <TopProgressBar />
            <GeoNoticeBanner />
            <CookieConsent />
            <DiscountPopup />
            {!isAuthPage && <Navbar />}
            {!isAuthPage && !isAdminPage && <Breadcrumbs />}
            <main className={`flex-grow ${!isAuthPage ? 'pt-16' : ''} ${!isAuthPage && !isAdminPage ? 'pb-16 md:pb-0' : ''}`}>
                <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/courses" element={<CoursesPage />} />
                        <Route path="/courses/:id" element={<CourseDetailsPage />} />
                        <Route path="/professor/:id" element={<ProfessorProfilePage />} />
                        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
                        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                {isAdmin ? <Navigate to="/admin" replace /> : <DashboardPage />}
                            </ProtectedRoute>
                        } />
                        <Route path="/admin" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/pricing" element={<Navigate to="/" replace />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </React.Suspense>
            </main>
            {!isAuthPage && !isAdminPage && <Footer />}
            {!isAuthPage && !isAdminPage && <MobileBottomNav />}
            <ScrollToTopButton />
        </div>
    );
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <LanguageProvider>
          <ErrorBoundary>
            <AuthProvider>
              <NotificationProvider>
                <DataProvider>
                    <Router>
                        <AppContent />
                    </Router>
                </DataProvider>
              </NotificationProvider>
            </AuthProvider>
          </ErrorBoundary>
        </LanguageProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
