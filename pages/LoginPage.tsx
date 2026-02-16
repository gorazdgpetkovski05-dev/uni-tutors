
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, ArrowRight, Loader, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, resetPassword, loading } = useAuth();
  const { notify } = useNotification();
  const { t } = useLanguage();
  
  // State
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      notify(t('welcomeBack'), 'Successfully logged in.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      notify(t('authFailed'), err.message || 'Invalid credentials', 'info');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await resetPassword(email);
          setResetSent(true);
          notify('Reset Link Sent', 'Check your email for instructions.', 'success');
      } catch (err: any) {
          notify('Error', err.message || 'Could not send reset link.', 'info');
      }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <span className="font-bold text-2xl text-gray-900">UNI<span className="text-indigo-600">Tutors</span></span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {view === 'login' ? t('signInTitle') : t('resetPassword')}
        </h2>
        {view === 'login' && (
            <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                {t('noAccount')}
            </Link>
            </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {view === 'login' ? (
            <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    {t('emailLabel')}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-xl py-3"
                    placeholder="name@university.edu.mk"
                    />
                </div>
                </div>

                <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {t('passwordLabel')}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-xl py-3"
                    placeholder="••••••••"
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                </div>

                <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    {t('rememberMe')}
                    </label>
                </div>

                <div className="text-sm">
                    <button type="button" onClick={() => setView('forgot')} className="font-medium text-indigo-600 hover:text-indigo-500 bg-transparent border-none p-0">
                        {t('forgotPass')}
                    </button>
                </div>
                </div>

                <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader className="animate-spin h-5 w-5" /> : <>{t('login')} <ArrowRight className="ml-2 h-4 w-4" /></>}
                </button>
                </div>
            </form>
          ) : (
            <div className="space-y-6">
                {!resetSent ? (
                    <>
                        <p className="text-sm text-gray-500 text-center mb-4">
                            {t('resetPasswordSub')}
                        </p>
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
                                    {t('emailLabel')}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                    id="reset-email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-xl py-3"
                                    placeholder="name@university.edu.mk"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-[1.02] disabled:opacity-50"
                            >
                                {loading ? <Loader className="animate-spin h-5 w-5" /> : t('sendResetLink')}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">{t('linkSent')}</h3>
                        <p className="mt-2 text-sm text-gray-500">{t('checkEmail')}</p>
                    </div>
                )}
                
                <div className="text-center">
                     <button 
                        type="button" 
                        onClick={() => { setView('login'); setResetSent(false); }}
                        className="flex items-center justify-center gap-2 mx-auto text-sm font-medium text-gray-600 hover:text-gray-900"
                     >
                        <ArrowLeft className="h-4 w-4" /> {t('backToLogin')}
                     </button>
                </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
