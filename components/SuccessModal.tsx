import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Confetti } from './Confetti';

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  xpEarned: number;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, title, description, xpEarned, onClose }) => {
  const { t } = useLanguage();

  return (
    <>
      <Confetti trigger={isOpen} />
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center border border-gray-200 dark:border-slate-700"
            >
              <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X className="h-5 w-5" />
              </button>
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                {t('congratulations')}
              </p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>
              <div className="inline-flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-4 py-2 mb-6">
                <span className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">{t('xpEarned')}:</span>
                <span className="text-yellow-700 dark:text-yellow-300 text-lg font-bold">+{xpEarned} XP</span>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
              >
                {t('continueBtn')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
