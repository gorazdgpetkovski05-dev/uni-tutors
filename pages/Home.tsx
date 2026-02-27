
import React, { useEffect, useRef, useState } from 'react';
import { Hero } from '../components/Hero';
import { ArrowRight, Clock, Check, Trophy, Users, BookOpen, Calendar, ShieldCheck, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, useInView, useSpring, useTransform } from 'motion/react';

const Counter: React.FC<{ value: string, suffix?: string }> = ({ value, suffix = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
  
  const spring = useSpring(0, {
    mass: 1,
    stiffness: 100,
    damping: 30,
  });

  const display = useTransform(spring, (current) => 
    Math.round(current).toLocaleString() + suffix
  );

  useEffect(() => {
    if (isInView) {
      spring.set(numericValue);
    }
  }, [isInView, spring, numericValue]);

  return <motion.span ref={ref}>{display}</motion.span>;
};

const FadeInSection: React.FC<{ children: React.ReactNode, className?: string, delay?: number, direction?: 'up' | 'down' | 'left' | 'right' | 'none' }> = ({ children, className = "", delay = 0, direction = 'up' }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  const directions = {
    up: { y: isMobile ? 20 : 40 },
    down: { y: isMobile ? -20 : -40 },
    left: { x: isMobile ? 20 : 40 },
    right: { x: isMobile ? -20 : -40 },
    none: {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: isMobile ? "-50px" : "-100px" }}
      transition={{ duration: isMobile ? 0.5 : 0.8, delay: isMobile ? delay * 0.5 : delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const Home: React.FC = () => {
  const { landingPageData } = useData();
  const { t } = useLanguage();

  return (
    <div className="overflow-x-hidden">
      <Hero />
      
      {/* STATS SECTION */}
      <section className="bg-slate-900 text-white py-12 border-b border-indigo-500/30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <FadeInSection delay={0.1} direction="none">
              <div className="space-y-2 group">
                <div className="text-4xl font-bold text-indigo-400 group-hover:scale-110 transition-transform duration-300 inline-block">
                  <Counter value={landingPageData.statsStudents} suffix="+" />
                </div>
                <div className="text-sm text-slate-400 uppercase tracking-wider font-medium">{t('statStudents')}</div>
              </div>
            </FadeInSection>
            
            <FadeInSection delay={0.2} direction="none">
              <div className="space-y-2 group">
                <div className="text-4xl font-bold text-indigo-400 group-hover:scale-110 transition-transform duration-300 inline-block">
                  <Counter value={landingPageData.statsSuccessStories} suffix="+" />
                </div>
                <div className="text-sm text-slate-400 uppercase tracking-wider font-medium">{t('statSuccessStories')}</div>
              </div>
            </FadeInSection>
            
            <FadeInSection delay={0.3} direction="none">
              <div className="space-y-2 group">
                <div className="text-4xl font-bold text-indigo-400 group-hover:scale-110 transition-transform duration-300 inline-block">
                  <Counter value={landingPageData.statsLectures} suffix="+" />
                </div>
                <div className="text-sm text-slate-400 uppercase tracking-wider font-medium">{t('statLectures')}</div>
              </div>
            </FadeInSection>
            
            <FadeInSection delay={0.4} direction="none">
              <div className="space-y-2 group">
                <div className="text-4xl font-bold text-indigo-400 group-hover:scale-110 transition-transform duration-300 inline-block">
                  <Counter value={landingPageData.statsPassRate} suffix="%" />
                </div>
                <div className="text-sm text-slate-400 uppercase tracking-wider font-medium">{t('statPassRate')}</div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
          <FadeInSection className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {t('howItWorks')}
            </h2>
            <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
              {t('howItWorksSub')}
            </p>
          </FadeInSection>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
              className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200 -z-10 origin-left"
            ></motion.div>

            {[
              { icon: BookOpen, title: t('step1Title'), desc: t('step1Desc') },
              { icon: Users, title: t('step2Title'), desc: t('step2Desc') },
              { icon: Calendar, title: t('step3Title'), desc: t('step3Desc') },
              { icon: ShieldCheck, title: t('step4Title'), desc: t('step4Desc') }
            ].map((step, idx) => (
              <FadeInSection key={idx} delay={idx * 0.15} className="text-center bg-white p-4 group">
                <div className="w-24 h-24 mx-auto bg-white rounded-full border-4 border-indigo-50 flex items-center justify-center mb-6 relative z-10 shadow-sm group-hover:border-indigo-200 transition-colors">
                  <motion.div 
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg"
                  >
                    <step.icon className="h-8 w-8" />
                  </motion.div>
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white">
                    {idx + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS GRID */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeInSection direction="right">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
                {t('whyChoose')} <span className="text-indigo-600">FINKI Tutors</span>?
              </h2>
              <p className="text-lg text-gray-500 mb-8">
                {t('whyChooseSub')}
              </p>
              
              <div className="space-y-6">
                {[
                  { title: t('benefit1Title'), desc: t('benefit1Desc') },
                  { title: t('benefit2Title'), desc: t('benefit2Desc') },
                  { title: t('benefit3Title'), desc: t('benefit3Desc') },
                  { title: t('benefit4Title'), desc: t('benefit4Desc') }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + (idx * 0.1) }}
                    className="flex gap-4 group"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <Check className="h-5 w-5 text-green-600 group-hover:text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{item.title}</h4>
                      <p className="text-gray-500">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </FadeInSection>
            
            <FadeInSection className="relative h-full min-h-[400px]" delay={0.2} direction="left">
              <div className="absolute inset-0 bg-indigo-600 rounded-3xl transform rotate-3 opacity-10"></div>
              <motion.img 
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5 }}
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                alt="Students collaborating" 
                className="relative rounded-3xl shadow-2xl object-cover h-full w-full cursor-pointer"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border border-gray-100 max-w-xs"
              >
                <div className="flex items-center gap-3 mb-2">
                   <Trophy className="h-8 w-8 text-yellow-500" />
                   <div>
                      <p className="font-bold text-gray-900">#1 Platform</p>
                      <p className="text-xs text-gray-500">Voted by Student Parliament</p>
                   </div>
                </div>
              </motion.div>
            </FadeInSection>
          </div>
        </div>
      </section>
      
      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-64 bg-slate-900/5 -z-10 skew-y-3 transform origin-top-left"></div>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
          <FadeInSection className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {t('pricingTitle')}
            </h2>
            <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
              {t('pricingSub')}
            </p>
          </FadeInSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <FadeInSection className="h-full" delay={0.1}>
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:border-indigo-100 transition-all hover:shadow-xl h-full flex flex-col group">
                <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('singleLecture')}</h3>
                <p className="text-gray-500 mb-6">{t('singleLectureDesc')}</p>
                <div className="text-4xl font-bold text-gray-900 mb-6">750 <span className="text-base font-medium text-gray-400">{t('perLecture')}</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center text-gray-600"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>{t('featureLive')}</li>
                  <li className="flex items-center text-gray-600"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>{t('featureQA')}</li>
                  <li className="flex items-center text-gray-600"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>{t('featureMaterials')}</li>
                </ul>
                <Link to="/courses" className="block w-full text-center py-4 border-2 border-indigo-600 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors">
                  {t('bookLecture')}
                </Link>
              </div>
            </FadeInSection>

            <FadeInSection className="h-full" delay={0.2}>
              <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden h-full flex flex-col transform hover:-translate-y-2 transition-all duration-300 hover:shadow-indigo-500/20">
                 <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-yellow-500 text-slate-900 text-xs font-bold px-4 py-2 rounded-bl-2xl uppercase tracking-wider shadow-md">
                    {t('mostPopular')}
                 </div>
                <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                  <GraduationCap className="h-7 w-7 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{t('fullCourseBundle')}</h3>
                <p className="text-indigo-200 mb-6">{t('fullCourseDesc')}</p>
                <div className="text-4xl font-bold mb-6">6000 <span className="text-base font-medium text-indigo-300">{t('perCourse')}</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center text-indigo-100"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>{t('featureAllLectures')}</li>
                  <li className="flex items-center text-indigo-100"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>{t('featureSave')}</li>
                  <li className="flex items-center text-indigo-100"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>{t('featureCert')}</li>
                  <li className="flex items-center text-indigo-100"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>{t('featureSupport')}</li>
                </ul>
                <Link to="/courses" className="block w-full text-center py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-bold rounded-xl hover:from-yellow-300 hover:to-yellow-400 transition-all shadow-lg shadow-yellow-500/20">
                  {t('getFullCourse')}
                </Link>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

       {/* FINAL CTA */}
       <section className="py-24 bg-indigo-600 relative overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full opacity-50 blur-3xl"
          ></motion.div>
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-700 rounded-full opacity-50 blur-3xl"
          ></motion.div>

          <div className="max-w-[1600px] mx-auto px-4 text-center relative z-10 text-white">
             <FadeInSection>
               <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">{t('readyToBoost')}</h2>
               <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">{t('joinThousands')}</p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Link to="/courses" className="inline-flex items-center justify-center gap-3 text-indigo-900 bg-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                    {t('browseCourses')} <ArrowRight className="h-5 w-5" />
                 </Link>
               </div>
             </FadeInSection>
          </div>
       </section>
    </div>
  );
};
