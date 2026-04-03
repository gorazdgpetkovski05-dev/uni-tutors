import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, actionLabel, actionLink, onAction }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
    className="flex flex-col items-center py-14 px-4"
  >
    <div className="relative mb-5">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 dark:from-indigo-900/50 dark:to-purple-900/50 blur-md scale-125" />
      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center">
        <Icon className="h-7 w-7 text-indigo-500 dark:text-indigo-400" />
      </div>
    </div>
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">{description}</p>
    {actionLabel && actionLink && (
      <Link to={actionLink} className="mt-5 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all hover:-translate-y-0.5 shadow-sm">
        {actionLabel}
      </Link>
    )}
    {actionLabel && onAction && !actionLink && (
      <button onClick={onAction} className="mt-5 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all hover:-translate-y-0.5 shadow-sm">
        {actionLabel}
      </button>
    )}
  </motion.div>
);
