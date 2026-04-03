import React, { useState, useMemo } from 'react';
import { Zap, Search } from 'lucide-react';
import { Profile } from '../../types';

interface UsersTabProps {
  users: Profile[];
  updateUserRole: (id: string, role: string) => void;
  t: (k: any) => string;
}

const ROLE_FILTERS = ['all', 'student', 'professor', 'admin'] as const;

export const UsersTab: React.FC<UsersTabProps> = ({ users, updateUserRole, t }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    let result = users;
    if (roleFilter !== 'all') result = result.filter(u => u.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u => u.full_name?.toLowerCase().includes(q));
    }
    return result;
  }, [users, roleFilter, search]);

  const roleColors: Record<string, string> = {
    student: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    professor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  const roleFilterLabels: Record<string, string> = {
    all: t('all'),
    student: t('students'),
    professor: t('professors'),
    admin: t('admins'),
  };

  const levelLabels: Record<number, string> = { 1: t('level1Desc'), 2: t('level2Desc'), 3: t('level3Desc') };
  const levelColors: Record<number, string> = {
    1: 'text-gray-500 dark:text-gray-400',
    2: 'text-blue-600 dark:text-blue-400',
    3: 'text-purple-600 dark:text-purple-400',
  };

  return (
    <div>
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('searchUsers')}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ROLE_FILTERS.map(f => (
            <button key={f} onClick={() => setRoleFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${roleFilter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400'}`}>
              {roleFilterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* User list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('noUsersFound')}</p>
        )}
        {filtered.map(u => (
          <div key={u.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-gray-300 dark:hover:border-slate-600 transition-colors">
            <div className="flex items-center gap-3">
              {u.avatar_url ? (
                <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  {u.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{u.full_name || t('noName')}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{new Date(u.created_at).toLocaleDateString()}</span>
                  {u.role === 'student' && (u.xp ?? 0) > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        {u.xp} XP
                      </span>
                      <span className={`font-medium ${levelColors[u.level || 1]}`}>
                        Lv.{u.level || 1} {levelLabels[u.level || 1]}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={u.role}
                onChange={e => {
                  const newRole = e.target.value;
                  if (!window.confirm(`${t('changeRoleConfirm')} "${newRole}"${t('changeRoleWarning')}`)) return;
                  updateUserRole(u.id, newRole);
                }}
                className="px-3 py-1.5 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
              >
                <option value="student">{t('student')}</option>
                <option value="professor">{t('professor')}</option>
                <option value="admin">{t('admin')}</option>
              </select>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${roleColors[u.role]}`}>
                {t(u.role)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
