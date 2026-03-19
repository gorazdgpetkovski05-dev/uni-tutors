
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { DataProvider } from './contexts/DataContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

import { DiscountPopup } from './components/DiscountPopup';
import { InfoModal } from './components/InfoModal';

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
        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
            <InfoModal 
                isOpen={modalConfig.isOpen} 
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                title={modalConfig.title}
                message={modalConfig.message}
            />
            <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="mb-2 font-medium text-slate-300">{t('footerContact')}</p>
            <p>&copy; {new Date().getFullYear()} {t('footerRights')}</p>
            <div className="mt-4 flex justify-center space-x-6 text-sm">
                <a href="#" onClick={(e) => handleLinkClick(e, 'Privacy')} className="hover:text-white">{t('privacy')}</a>
                <a href="#" onClick={(e) => handleLinkClick(e, 'Terms')} className="hover:text-white">{t('terms')}</a>
                <a href="#" onClick={(e) => handleLinkClick(e, 'Support')} className="hover:text-white">{t('support')}</a>
            </div>
            </div>
        </footer>
    );
};

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Use a small timeout to ensure the new page content has rendered
        const timeoutId = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 10);
        
        return () => clearTimeout(timeoutId);
    }, [pathname]);

    return null;
};

const AppContent: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <ScrollToTop />
            <DiscountPopup />
            <Navbar />
            <main className="flex-grow pt-16">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/courses" element={<CoursesPage />} />
                    <Route path="/courses/:id" element={<CourseDetailsPage />} />
                    <Route path="/pricing" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

const App: React.FC = () => {
  return (
    <LanguageProvider>
        <DataProvider>
            <Router>
                <AppContent />
            </Router>
        </DataProvider>
    </LanguageProvider>
  );
};

export default App;
