
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';

export const Hero: React.FC = () => {
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    }
  };

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-900 min-h-[85vh] grid lg:grid-cols-2 transition-colors duration-300">
      <div className="flex items-center px-4 sm:px-6 lg:px-12 xl:px-24 py-16 lg:py-24">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl lg:leading-[1.1] will-change-transform will-change-opacity"
          >
            <span className="block xl:inline">{t('heroTitle')}</span>{' '}
            <span className="block text-indigo-600 dark:text-indigo-400 xl:inline relative">
              UniTutors MK
              <motion.svg 
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
                className="absolute w-full h-3 -bottom-1 left-0 text-yellow-300 dark:text-yellow-500 -z-10" 
                viewBox="0 0 100 10" 
                preserveAspectRatio="none"
              >
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </motion.svg>
            </span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="mt-6 text-base text-gray-500 dark:text-gray-400 sm:mt-8 sm:text-lg md:mt-8 md:text-xl"
          >
            {t('heroSubtitle')}
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/courses"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-2 hover:scale-105 active:scale-95"
            >
              {t('browseCourses')}
            </Link>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row gap-6 text-sm text-gray-500 dark:text-gray-400"
          >
             <div className="flex items-center gap-2">
                <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full"><CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" /></div>
                <span>{t('verifiedProfs')}</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full"><CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" /></div>
                <span>{t('onlineGroup')}</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full"><CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" /></div>
                <span>{t('flexPay')}</span>
             </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Hero Image / Background */}
      <div className="relative h-64 sm:h-72 md:h-96 lg:h-full overflow-hidden">
        <motion.div 
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.21, 1.02, 0.73, 1] }}
          className="h-full w-full relative will-change-transform will-change-opacity"
        >
             <img
              className="h-full w-full object-cover object-center"
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1950&q=80"
              alt="Students learning"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-0 bg-indigo-900/10 dark:bg-indigo-900/30 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-slate-900 via-transparent to-transparent hidden lg:block"></div>
            
            {/* Floating Decorative Elements */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 right-1/4 w-12 h-12 bg-yellow-400/20 backdrop-blur-sm rounded-full hidden md:block"
            />
            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-1/3 right-1/3 w-8 h-8 bg-indigo-400/20 backdrop-blur-sm rounded-full hidden md:block"
            />
        </motion.div>
      </div>
    </div>
  );
};
