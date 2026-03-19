
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Globe, Menu, X, Sun, Moon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { ContactModal } from './ContactModal';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400';

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(false);
    setIsContactModalOpen(true);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'mk' : 'en');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
      <motion.nav 
        initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm md:backdrop-blur-md border-b border-gray-200 dark:border-slate-800 transition-all duration-300 will-change-transform"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsMenuOpen(false)}>
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative"
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 dark:text-indigo-400">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-[2px] border-2 border-white dark:border-slate-900">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-900">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
              </motion.div>
              <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">UNI<span className="text-indigo-600 dark:text-indigo-400">Tutors</span></span>
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link to="/" className={`${isActive('/')} transition-colors`}>{t('home')}</Link>
              <Link to="/courses" className={`${isActive('/courses')} transition-colors`}>{t('courses')}</Link>
              <a href="#contact" onClick={handleContactClick} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('contact')}</a>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Theme Toggle */}
            <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-all duration-300 hover:shadow-md"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </motion.button>

            {/* Language Toggle */}
            <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-sm font-bold text-gray-700 dark:text-gray-300 transition-all duration-300 hover:shadow-md"
            >
                <Globe className="h-4 w-4" />
                {language === 'en' ? 'MK' : 'EN'}
            </motion.button>

            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-16 right-4 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden py-2"
          >
            <Link 
              to="/" 
              className={`block px-6 py-3 text-sm ${isActive('/')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t('home')}
            </Link>
            <Link 
              to="/courses" 
              className={`block px-6 py-3 text-sm ${isActive('/courses')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t('courses')}
            </Link>
            <a 
              href="#contact" 
              onClick={handleContactClick}
              className="block px-6 py-3 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {t('contact')}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
    </>
  );
};
