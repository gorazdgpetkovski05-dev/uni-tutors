
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { CoursesPage } from './pages/CoursesPage';
import { DashboardPage } from './pages/DashboardPage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LanguageProvider } from './contexts/LanguageContext';

const Footer: React.FC = () => {
    const location = useLocation();
    if(location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/dashboard') return null;
    
    return (
        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 text-center">
            <p>&copy; {new Date().getFullYear()} FINKI Tutors. All rights reserved.</p>
            <div className="mt-4 flex justify-center space-x-6 text-sm">
                <a href="#" className="hover:text-white">Privacy</a>
                <a href="#" className="hover:text-white">Terms</a>
                <a href="#" className="hover:text-white">Support</a>
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
            <Navbar />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route index element={<Home />} />
                    
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/courses" element={<CoursesPage />} />
                    <Route path="/courses/:id" element={<CourseDetailsPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    
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
        <NotificationProvider>
        <DataProvider>
            <AuthProvider>
            <Router>
                <AppContent />
            </Router>
            </AuthProvider>
        </DataProvider>
        </NotificationProvider>
    </LanguageProvider>
  );
};

export default App;
