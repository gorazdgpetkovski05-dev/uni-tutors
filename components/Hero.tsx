
import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const Hero: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const { landingPageData } = useData();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="relative overflow-hidden bg-white min-h-[90vh] flex items-center">
      <div className="max-w-7xl mx-auto w-full">
        <div className="relative z-10 pb-8 bg-white/0 lg:max-w-2xl lg:w-full">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className={`sm:text-center lg:text-left transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:leading-[1.1]">
                <span className="block xl:inline">{t('heroTitle')}</span>{' '}
                <span className="block text-indigo-600 xl:inline relative">
                  UniTutors MK
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-300 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                  </svg>
                </span>
              </h1>
              <p className="mt-6 text-base text-gray-500 sm:mt-8 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-8 md:text-xl lg:mx-auto">
                {t('heroSubtitle')}
              </p>
              
              <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start gap-4">
                <Link
                  to="/courses"
                  className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-1"
                >
                  {t('browseCourses')}
                </Link>
                <Link
                  to={isAuthenticated ? "/dashboard" : "/signup"}
                  className="w-full flex items-center justify-center px-8 py-4 border-2 border-indigo-100 text-lg font-bold rounded-xl text-indigo-700 bg-white hover:bg-indigo-50 transition-all"
                >
                  {isAuthenticated ? t('goToDashboard') : t('joinNow')}
                </Link>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-6 sm:justify-center lg:justify-start text-sm text-gray-500">
                 <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-1 rounded-full"><CheckCircle2 className="h-4 w-4 text-green-600" /></div>
                    <span>{t('verifiedProfs')}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-1 rounded-full"><CheckCircle2 className="h-4 w-4 text-green-600" /></div>
                    <span>{t('onlineGroup')}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-1 rounded-full"><CheckCircle2 className="h-4 w-4 text-green-600" /></div>
                    <span>{t('flexPay')}</span>
                 </div>
              </div>

            </div>
          </main>
        </div>
      </div>
      
      {/* Hero Image / Background */}
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 overflow-hidden">
        <div className={`h-56 w-full sm:h-72 md:h-96 lg:w-full lg:h-full transition-all duration-[1.5s] ease-out transform ${loaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'}`}>
             <img
              className="h-full w-full object-cover object-center"
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1950&q=80"
              alt="Students learning"
            />
            <div className="absolute inset-0 bg-indigo-900/10 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent lg:via-white/0"></div>
        </div>
      </div>
    </div>
  );
};
