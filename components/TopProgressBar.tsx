
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export const TopProgressBar: React.FC = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed top-0 left-0 h-[3px] bg-indigo-600 z-[60] pointer-events-none"
          initial={{ width: '0%', opacity: 1 }}
          animate={{ width: '80%', opacity: 1 }}
          exit={{ width: '100%', opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      )}
    </AnimatePresence>
  );
};
