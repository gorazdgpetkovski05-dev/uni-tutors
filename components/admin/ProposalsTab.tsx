import React, { useState } from 'react';
import { CourseProposal } from '../../types';

interface ProposalsTabProps {
  proposals: CourseProposal[];
  updateProposal: (id: string, status: string, notes?: string) => void;
  t: (k: any) => string;
}

export const ProposalsTab: React.FC<ProposalsTabProps> = ({ proposals, updateProposal, t }) => {
  const [notes, setNotes] = useState<Record<string, string>>({});

  return (
    <div className="space-y-3">
      {proposals.map(p => (
        <div key={p.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row justify-between gap-3">
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{p.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{(p as any).professor?.full_name} • {p.course_code} • {p.university}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{p.description}</p>
            </div>
            <div className="flex flex-col gap-2">
              {p.status === 'pending' && (
                <>
                  <input placeholder={t('adminNotes')} value={notes[p.id] || ''} onChange={e => setNotes({...notes, [p.id]: e.target.value})}
                    className="px-3 py-1.5 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white" />
                  <div className="flex gap-2">
                    <button onClick={() => updateProposal(p.id, 'approved', notes[p.id])}
                      className="flex-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">{t('approve')}</button>
                    <button onClick={() => updateProposal(p.id, 'rejected', notes[p.id])}
                      className="flex-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">{t('reject')}</button>
                  </div>
                </>
              )}
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-center ${
                p.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                p.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                p.status === 'in_review' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>{p.status}</span>
            </div>
          </div>
        </div>
      ))}
      {proposals.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">{t('noProposals')}</div>
      )}
    </div>
  );
};
