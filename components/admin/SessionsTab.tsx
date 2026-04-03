import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Enrollment, Session as SessionRecord } from '../../types';

interface SessionsTabProps {
  enrollments: Enrollment[];
  addSession: (enrollmentId: string, title: string, status: string) => void;
  updateSession: (id: string, status: string) => Promise<void>;
  t: (k: any) => string;
}

export const SessionsTab: React.FC<SessionsTabProps> = ({ enrollments, addSession, updateSession, t }) => {
  const [sessions, setSessions] = useState<Record<string, SessionRecord[]>>({});
  const [newSessionTitle, setNewSessionTitle] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const enrollmentIds = enrollments.map(e => e.id).join(',');
  useEffect(() => {
    fetchSessions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentIds]);

  const fetchSessions = async () => {
    const ids = enrollments.map(e => e.id);
    if (ids.length === 0) return;
    const { data } = await supabase.from('sessions').select('*').in('enrollment_id', ids).order('created_at', { ascending: false });
    if (data) {
      const grouped: Record<string, SessionRecord[]> = {};
      data.forEach(s => {
        if (!grouped[s.enrollment_id]) grouped[s.enrollment_id] = [];
        grouped[s.enrollment_id].push(s);
      });
      setSessions(grouped);
    }
  };

  const handleAddSession = async (enrollmentId: string) => {
    const title = newSessionTitle[enrollmentId] || `${t('session')} ${(sessions[enrollmentId]?.length || 0) + 1}`;
    await addSession(enrollmentId, title, 'scheduled');
    setNewSessionTitle({ ...newSessionTitle, [enrollmentId]: '' });
    fetchSessions();
  };

  const approvedEnrollments = enrollments.filter(e => e.status === 'approved' || e.status === 'completed');

  return (
    <div className="space-y-3">
      {approvedEnrollments.map(e => (
        <div key={e.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <button onClick={() => setExpanded(expanded === e.id ? null : e.id)}
            aria-expanded={expanded === e.id}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className="text-left">
              <p className="font-bold text-gray-900 dark:text-white">{(e as any).student?.full_name || t('unknown')} → {(e as any).course?.title || t('unknown')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{sessions[e.id]?.length || 0} {t('lectures').toLowerCase()} • {t(e.status)}</p>
            </div>
            {expanded === e.id ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </button>

          {expanded === e.id && (
            <div className="p-4 border-t border-gray-100 dark:border-slate-700 space-y-2">
              {(sessions[e.id] || []).map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{s.title}</p>
                  <select value={s.status} onChange={async (ev) => { await updateSession(s.id, ev.target.value); fetchSessions(); }}
                    className="px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                    <option value="scheduled">{t('scheduled')}</option>
                    <option value="completed">{t('completed')}</option>
                    <option value="missed">{t('missed')}</option>
                    <option value="cancelled">{t('cancelled')}</option>
                  </select>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <input placeholder={t('sessionTitle')} aria-label={t('sessionTitle')} value={newSessionTitle[e.id] || ''}
                  onChange={ev => setNewSessionTitle({ ...newSessionTitle, [e.id]: ev.target.value })}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white" />
                <button onClick={() => handleAddSession(e.id)} aria-label={t('addSession')}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      {approvedEnrollments.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">{t('noEnrollments')}</div>
      )}
    </div>
  );
};
