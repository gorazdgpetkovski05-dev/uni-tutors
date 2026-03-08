
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { DataProvider } from './contexts/DataContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

import { DiscountPopup } from './components/DiscountPopup';

const Footer: React.FC = () => {
    const { t } = useLanguage();

    const handleLinkClick = (e: React.MouseEvent, topic: string) => {
        e.preventDefault();
        let message = "";
        if (topic === 'Privacy') message = t('footerPrivacyMsg');
        else if (topic === 'Terms') message = t('footerTermsMsg');
        else if (topic === 'Support') message = t('footerSupportMsg');
        
        alert(message);
    };

    return (
        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
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

// Component to handle initial redirect logic more aggressively
const RedirectHandler: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // If we are at the root (or hash root), ensure we render Home
        if (location.pathname === '/' || location.pathname === '') {
            // Already there
        }
    }, [location, navigate]);

    return null;
};

const AppContent: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <RedirectHandler />
            <DiscountPopup />
            <Navbar />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route index element={<Home />} />
                    
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
