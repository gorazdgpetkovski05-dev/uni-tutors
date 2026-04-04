import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props { isOpen: boolean; onClose: () => void }

const Key: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-semibold rounded-md border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-200 shadow-[0_1px_0_1px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_1px_rgba(0,0,0,0.3)] font-mono">
    {children}
  </kbd>
);

const shortcuts = [
  { key: '/', tKey: 'shortcutSearch' },
  { key: 'Esc', tKey: 'shortcutClose' },
  { key: 'd', tKey: 'shortcutDarkMode' },
  { key: '?', tKey: 'shortcutHelp' },
] as const;

export const ShortcutsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          data-modal-overlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-gray-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('keyboardShortcuts')}</h2>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              {shortcuts.map(({ key, tKey }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t(tKey)}</span>
                  <Key>{key}</Key>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
