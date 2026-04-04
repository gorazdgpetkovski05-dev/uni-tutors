import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

export const CompleteProfilePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const avatarUrl = user?.user_metadata?.avatar_url || profile?.avatar_url;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = fullName.trim();
    if (trimmed.length < 2) { setError(t('fullNameRequired')); return; }
    setSaving(true);
    const { error: err } = await supabase.from('profiles')
      .update({ full_name: trimmed, ...(phone.trim() ? { phone: phone.trim() } : {}) })
      .eq('id', user!.id);
    if (err) { setError(err.message); setSaving(false); return; }
    await refreshProfile();
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800/50 dark:to-indigo-950 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center gap-3 mb-6">
          {avatarUrl && <img src={avatarUrl} alt="" className="w-16 h-16 rounded-full ring-2 ring-indigo-200 dark:ring-indigo-700" />}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('completeProfile')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{t('enterFullName')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input type="text" value={fullName} onChange={e => { setFullName(e.target.value); setError(''); }}
              placeholder={t('fullNameRequired')} required minLength={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder={t('phoneOptional')}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={saving}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors">
            {saving ? '...' : t('continueToApp')}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default CompleteProfilePage;
