import React, { useState } from 'react';
import { X, Star, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Enrollment } from '../../types';

interface ReviewFormProps {
  enrollment: Enrollment;
  onClose: () => void;
  onSubmitted: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ enrollment, onClose, onSubmitted }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0) return;
    setLoading(true);
    setError('');

    const course = enrollment.course;
    if (!course) {
      setError(t('courseNotFound'));
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('reviews').insert({
      student_id: user.id,
      course_id: enrollment.course_id,
      professor_id: course.professor_id,
      enrollment_id: enrollment.id,
      rating,
      comment: comment || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      // Award 10 XP for submitting a review
      await supabase.from('student_xp').insert({
        student_id: user.id,
        amount: 10,
        reason: 'review_submitted',
        reference_id: enrollment.id,
      });
      onSubmitted();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 p-6 w-full max-w-md">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('leaveReview')}</h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{enrollment.course?.title}</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('ratingLabel')}</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`${i} star${i > 1 ? 's' : ''}`}
                    onClick={() => setRating(i)}
                    onMouseEnter={() => setHoveredRating(i)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-transform hover:scale-125 active:scale-95"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        i <= (hoveredRating || rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('reviewComment')}</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder={t('reviewPlaceholder')}
              />
            </div>

            <button
              type="submit"
              disabled={loading || rating === 0}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> {t('submitReview')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
