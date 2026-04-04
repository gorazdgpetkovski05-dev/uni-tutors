import { useState, useCallback } from 'react';

const STORAGE_KEY = 'recently_viewed';
const MAX_ITEMS = 6;

function getStored(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

export function useRecentlyViewed() {
  const [recentIds, setRecentIds] = useState<string[]>(getStored);

  const addToRecent = useCallback((courseId: string) => {
    setRecentIds(prev => {
      const next = [courseId, ...prev.filter(id => id !== courseId)].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { recentIds, addToRecent };
}
