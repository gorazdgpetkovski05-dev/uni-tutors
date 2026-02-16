
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, ArrowRight, Loader, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  const { notify } = useNotification();
  const { t } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
        await signup(email, password, fullName);
        notify('Account Created', 'Successfully signed up. You can now login.', 'success');
        navigate('/login');
    } catch (err: any) {
        const msg = err.message || 'Could not create account.';
        setErrorMsg(msg);
        notify('Signup Failed', msg, 'info');
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
          {t('createAccount')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('haveAccount')} {' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            {t('login')}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">
                      <p className="font-bold">Registration Error</p>
                      <p>{errorMsg}</p>
                  </div>
              </div>
          )}

          <form className="space-y-6" onSubmit={handleSignup}>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t('fullNameLabel')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-xl py-3"
                  placeholder="Marko Markovski"
                />
              </div>
            </div>

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
                  autoComplete="new-password"
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

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? <Loader className="animate-spin h-5 w-5" /> : <>{t('createAccount')} <ArrowRight className="ml-2 h-4 w-4" /></>}
              </button>
            </div>
          </form>

          <div className="mt-6">
             <p className="text-xs text-center text-gray-500">{t('termsAgree')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
