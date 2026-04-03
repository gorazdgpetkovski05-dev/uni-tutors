import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from('favorites')
      .select('course_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        setFavorites(new Set((data || []).map(r => r.course_id)));
        setLoading(false);
      });
  }, [user]);

  const toggleFavorite = useCallback(async (courseId: string) => {
    if (!user) return;
    if (favorites.has(courseId)) {
      setFavorites(prev => { const next = new Set(prev); next.delete(courseId); return next; });
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('course_id', courseId);
    } else {
      setFavorites(prev => new Set(prev).add(courseId));
      await supabase.from('favorites').insert({ user_id: user.id, course_id: courseId });
    }
  }, [user, favorites]);

  return { favorites, toggleFavorite, loading };
}
