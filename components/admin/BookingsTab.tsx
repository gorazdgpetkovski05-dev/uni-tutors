import React, { useState } from 'react';
import { CheckCircle2, XCircle, DollarSign, CreditCard } from 'lucide-react';
import { Enrollment } from '../../types';

interface BookingsTabProps {
  enrollments: Enrollment[];
  updateEnrollment: (id: string, status: string, discord?: string) => void;
  markPaymentReceived: (id: string, amount: number) => void;
  t: (k: any) => string;
}

export const BookingsTab: React.FC<BookingsTabProps> = ({ enrollments, updateEnrollment, markPaymentReceived, t }) => {
  const [discordLinks, setDiscordLinks] = useState<Record<string, string>>({});
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? enrollments : enrollments.filter(e => e.status === filter);

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'pending', 'approved', 'rejected', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400'}`}>
            {t(f === 'all' ? 'all' : f)} {f === 'pending' && enrollments.filter(e => e.status === 'pending').length > 0 ? `(${enrollments.filter(e => e.status === 'pending').length})` : ''}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(e => {
          const course = (e as any).course;
          const calculatedPrice = course?.price_full
            ? Math.round(course.price_full * (1 - (e.discount_percent ?? 0) / 100))
            : null;
          const isPaid = e.price_paid && e.price_paid > 0;

          return (
            <div key={e.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{(e as any).student?.full_name || t('unknown')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {course?.title || t('unknown')} • {t(e.booking_type)} • {new Date(e.created_at).toLocaleDateString()}
                  </p>
                  {e.message && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 italic">"{e.message}"</p>}
                  {(e.status === 'approved' || e.status === 'completed') && calculatedPrice !== null && (
                    <div className="flex items-center gap-2 mt-2">
                      {isPaid ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> {t('paid')} {e.price_paid?.toLocaleString()} MKD
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold rounded-full">
                          <CreditCard className="h-3 w-3" /> {t('pending')} {calculatedPrice.toLocaleString()} MKD
                        </span>
                      )}
                      {e.discount_percent ? (
                        <span className="text-xs text-indigo-600 dark:text-indigo-400">{e.discount_percent}% {t('discountApplied')}</span>
                      ) : null}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {e.status === 'pending' && (
                      <>
                        <input
                          type="text"
                          placeholder={t('studyHubLink')}
                          aria-label={t('studyHubLink')}
                          value={discordLinks[e.id] || ''}
                          onChange={ev => setDiscordLinks({ ...discordLinks, [e.id]: ev.target.value })}
                          className="px-3 py-1.5 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white w-48"
                        />
                        <button onClick={() => updateEnrollment(e.id, 'approved', discordLinks[e.id])}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                          <CheckCircle2 className="h-4 w-4" /> {t('approve')}
                        </button>
                        <button onClick={() => updateEnrollment(e.id, 'rejected')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                          <XCircle className="h-4 w-4" /> {t('reject')}
                        </button>
                      </>
                    )}
                    {e.status === 'approved' && (
                      <button onClick={() => updateEnrollment(e.id, 'completed')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        <CheckCircle2 className="h-4 w-4" /> {t('markComplete')}
                      </button>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      e.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      e.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      e.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>{t(e.status)}</span>
                  </div>
                  {(e.status === 'approved' || e.status === 'completed') && !isPaid && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder={calculatedPrice ? String(calculatedPrice) : 'Amount (MKD)'}
                        aria-label={t('totalAmount')}
                        value={paymentAmounts[e.id] || ''}
                        onChange={ev => setPaymentAmounts({ ...paymentAmounts, [e.id]: ev.target.value })}
                        className="px-3 py-1.5 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white w-36"
                      />
                      <button
                        onClick={() => {
                          const amount = Number(paymentAmounts[e.id]) || calculatedPrice || 0;
                          if (amount > 0) markPaymentReceived(e.id, amount);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap">
                        <DollarSign className="h-4 w-4" /> {t('markPaid')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">{t('noBookings')}</div>
        )}
      </div>
    </div>
  );
};
