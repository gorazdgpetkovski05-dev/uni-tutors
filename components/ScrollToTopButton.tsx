import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const ScrollToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 md:bottom-8 right-4 z-40 p-3 rounded-full bg-indigo-600/80 dark:bg-indigo-500/80 text-white shadow-lg backdrop-blur-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
