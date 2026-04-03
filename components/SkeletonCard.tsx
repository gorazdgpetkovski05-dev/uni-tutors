import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200 dark:bg-slate-700" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
      <div className="flex gap-2 pt-2">
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-lg w-20" />
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-lg w-24" />
      </div>
    </div>
  </div>
);
