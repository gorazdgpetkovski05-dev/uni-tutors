
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  
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

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm md:backdrop-blur-md border-b border-gray-200 transition-all duration-300"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative"
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-[2px] border-2 border-white">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-900">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
              </motion.div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">UNI<span className="text-indigo-600">Tutors</span></span>
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link to="/" className={`${isActive('/')} transition-colors`}>{t('home')}</Link>
              <Link to="/courses" className={`${isActive('/courses')} transition-colors`}>{t('courses')}</Link>
              <a href="#pricing" onClick={handlePricingClick} className="text-gray-600 hover:text-indigo-600 transition-colors">{t('pricing')}</a>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-700 transition-colors"
            >
                <Globe className="h-4 w-4" />
                {language === 'en' ? 'MK' : 'EN'}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
