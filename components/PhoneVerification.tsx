import React, { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CheckCircle2, X, Phone } from 'lucide-react';

interface Props { open: boolean; onClose: () => void; }

const PhoneVerification: React.FC<Props> = ({ open, onClose }) => {
  const { user, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const fullPhone = `+389${phone.replace(/^0+/, '')}`;

  const sendCode = async () => {
    if (!phone.trim() || loading) return;
    setLoading(true); setError('');
    try {
      const { error: err } = await supabase.auth.updateUser({ phone: fullPhone });
      if (err) throw err;
      setStep(2); setCooldown(60);
    } catch (e: any) { setError(e.message || 'Failed to send code'); }
    finally { setLoading(false); }
  };

  const verifyCode = async () => {
    const token = code.join('');
    if (token.length !== 6 || loading) return;
    setLoading(true); setError('');
    try {
      const { error: err } = await supabase.auth.verifyOtp({ phone: fullPhone, token, type: 'sms' });
      if (err) throw err;
      await supabase.from('profiles').update({ phone: fullPhone, phone_verified: true, phone_verified_at: new Date().toISOString() }).eq('id', user!.id);
      await refreshProfile();
      setStep(3);
    } catch (e: any) {
      setError(e.message?.includes('expired') ? t('codeExpired') : (e.message || 'Verification failed'));
    } finally { setLoading(false); }
  };

  const handleDigit = useCallback((index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...code]; next[index] = value; setCode(next);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  }, [code]);

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) inputs.current[index - 1]?.focus();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Phone className="h-5 w-5" /> {t('verifyPhone')}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        {error && <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">{error}</div>}
        {step === 1 && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('enterPhoneNumber')}</p>
            <div className="flex gap-2 mb-4">
              <span className="flex items-center px-3 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300">+389</span>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="7X XXX XXX"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <button onClick={sendCode} disabled={!phone.trim() || loading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors">
              {loading ? '...' : t('sendCode')}
            </button>
          </div>
        )}
        {step === 2 && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('enterCode')}</p>
            <div className="flex gap-2 justify-center mb-4">
              {code.map((d, i) => (
                <input key={i} ref={el => { inputs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={e => handleDigit(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)}
                  className="w-10 h-12 text-center text-lg font-bold border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              ))}
            </div>
            <button onClick={verifyCode} disabled={code.join('').length !== 6 || loading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors mb-2">
              {loading ? '...' : t('verifyCode')}
            </button>
            <button onClick={sendCode} disabled={cooldown > 0 || loading}
              className="w-full py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg disabled:opacity-50 transition-colors">
              {cooldown > 0 ? `${t('resendIn')} ${cooldown}s` : t('resendCode')}
            </button>
          </div>
        )}
        {step === 3 && (
          <div className="text-center py-4">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">{t('phoneVerifiedSuccess')}</p>
            <button onClick={onClose} className="mt-4 px-6 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">OK</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneVerification;
