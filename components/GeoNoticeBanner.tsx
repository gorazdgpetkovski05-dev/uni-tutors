import React, { useState, useEffect } from 'react';
import { X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export const GeoNoticeBanner: React.FC = () => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show once per session and only if country appears non-MK
    if (sessionStorage.getItem('geoNoticeDismissed')) return;

    const detectNonMk = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      try {
        const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        if (data.country_code && data.country_code !== 'MK') {
          setVisible(true);
        }
      } catch {
        // Network/timeout — don't show banner
      } finally {
        clearTimeout(timeoutId);
      }
    };

    detectNonMk();
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem('geoNoticeDismissed', '1');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-indigo-600 text-white py-2.5 px-4 flex items-center justify-between gap-3 z-50"
        >
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 flex-shrink-0" />
            <span>{t('geoNoticeText')}</span>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="p-1 hover:bg-indigo-700 rounded-md transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
