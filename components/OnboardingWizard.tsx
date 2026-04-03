import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { BookOpen, Calendar, Zap, ChevronRight, X, GraduationCap } from 'lucide-react';

const STORAGE_KEY = 'onboarding_completed';

const OnboardingWizard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const complete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    onClose();
  };

  const steps = [
    // Step 1 - Welcome
    <div className="flex flex-col items-center text-center gap-6">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
        <GraduationCap className="h-12 w-12 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('welcomeToUniTutors')}</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm">{t('onboardingStep1')}</p>
      <button onClick={() => setStep(1)}
        className="mt-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2">
        {t('letsGetStarted')} <ChevronRight className="h-4 w-4" />
      </button>
    </div>,
    // Step 2 - How it works
    <div className="flex flex-col items-center text-center gap-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('howPlatformWorks')}</h2>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {[
          { icon: BookOpen, label: t('onboardingStep1') },
          { icon: Calendar, label: t('onboardingStep2') },
          { icon: Zap, label: t('onboardingStep3') },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 text-left">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
              <item.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
          </div>
        ))}
      </div>
      <button onClick={() => setStep(2)}
        className="mt-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2">
        {t('next')} <ChevronRight className="h-4 w-4" />
      </button>
    </div>,
    // Step 3 - Ready
    <div className="flex flex-col items-center text-center gap-6">
      <div className="text-5xl">&#127891;</div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('youAreReady')}</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => { complete(); navigate('/courses'); }}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">
          {t('startExploring')}
        </button>
        <button onClick={complete}
          className="px-8 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
          {t('goToDashboard')}
        </button>
      </div>
    </div>,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 mx-4 w-full max-w-md"
      >
        <button onClick={complete} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm flex items-center gap-1">
          {t('skipOnboarding')} <X className="h-4 w-4" />
        </button>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            {steps[step]}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-2 mt-8">
          {steps.map((_, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === step ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-600'}`} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export { OnboardingWizard, STORAGE_KEY };
