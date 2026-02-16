
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, LogIn, UserPlus, LogOut, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const isActive = (path: string) => location.pathname === path ? 'text-indigo-600 font-semibold' : 'text-gray-600 hover:text-indigo-600';

  const handlePricingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('pricing');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      const element = document.getElementById('pricing');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'mk' : 'en');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isAuthPage) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition-colors">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">UNI<span className="text-indigo-600">Tutors</span></span>
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link to="/" className={isActive('/')}>{t('home')}</Link>
              <Link to="/courses" className={isActive('/courses')}>{t('courses')}</Link>
              <a href="#pricing" onClick={handlePricingClick} className="text-gray-600 hover:text-indigo-600">{t('pricing')}</a>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button 
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-700 transition-colors"
            >
                <Globe className="h-4 w-4" />
                {language === 'en' ? 'MK' : 'EN'}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                 <span className="text-sm font-medium text-gray-700 hidden sm:block">Hi, {user?.name.split(' ')[0]}</span>
                 <Link to="/dashboard">
                  <button className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${location.pathname === '/dashboard' ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    <LayoutDashboard className="h-4 w-4" />
                    <span>{t('dashboard')}</span>
                  </button>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                    <LogIn className="h-4 w-4" />
                    {t('login')}
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    <UserPlus className="h-4 w-4" />
                    {t('signup')}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
