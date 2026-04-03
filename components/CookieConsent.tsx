import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export const CookieConsent: React.FC = () => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('cookieConsent')) setVisible(true);
  }, []);

  const accept = (value: 'all' | 'necessary') => {
    localStorage.setItem('cookieConsent', value);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ duration: 0.35 }}
          className="fixed bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none"
        >
          <div className="pointer-events-auto max-w-lg w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg px-5 py-4 flex flex-col sm:flex-row items-center gap-3">
            <p className="text-sm text-gray-600 dark:text-slate-300 flex-1">{t('cookieConsent')}</p>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => accept('necessary')}
                className="px-3.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                {t('necessaryOnly')}
              </button>
              <button
                onClick={() => accept('all')}
                className="px-3.5 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
              >
                {t('acceptAll')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
