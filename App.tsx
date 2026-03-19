
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { DataProvider } from './contexts/DataContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

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

const AppContent: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
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
    <ThemeProvider>
      <LanguageProvider>
          <DataProvider>
              <Router>
                  <AppContent />
              </Router>
          </DataProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
