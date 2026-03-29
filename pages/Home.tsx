
import React, { useEffect, useRef, useState } from 'react';
import { Hero } from '../components/Hero';
import { ArrowRight, Clock, Check, Users, BookOpen, Calendar, ShieldCheck, GraduationCap, Star, ChevronDown, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CourseCard } from '../components/CourseCard';
import { supabase } from '../lib/supabase';
import { motion, useInView, useSpring, useTransform, AnimatePresence } from 'motion/react';

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
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.5, 
        delay: delay, 
        ease: [0.21, 1.02, 0.73, 1] 
      }}
      className={`${className} will-change-transform will-change-opacity`}
    >
      {children}
    </motion.div>
  );
};

import { WHATSAPP_URL } from '../constants';
import { MessageCircle } from 'lucide-react';

interface Testimonial {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: { full_name: string } | null;
  courses: { title: string } | null;
}

const StarRating: React.FC<{ rating: number; size?: string }> = ({ rating, size = 'h-4 w-4' }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`${size} ${i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-slate-600'}`} />
    ))}
  </div>
);

export const Home: React.FC = () => {
  const { landingPageData, courses, professors } = useData();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from('reviews')
      .select('id, rating, comment, created_at, profiles(full_name), courses(title)')
      .gte('rating', 4)
      .not('comment', 'is', null)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => { if (data) setTestimonials(data as any); });
  }, []);

  const handleContactClick = () => {
    navigate('/courses');
  };

  const featuredCourses = courses.slice(0, 3);

  const faqItems = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
    { q: t('faq4Q'), a: t('faq4A') },
    { q: t('faq5Q'), a: t('faq5A') },
    { q: t('faq6Q'), a: t('faq6A') },
  ];

  return (
    <div className="overflow-x-hidden">
      <Hero />

      {/* STATS BAR */}
      <section className="py-16 bg-white dark:bg-slate-800 overflow-hidden transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: landingPageData?.statsStudents ?? "1200", label: t('statsStudents') || "Students", suffix: "+" },
              { value: landingPageData?.statsSuccessStories ?? "450", label: t('statsSuccess') || "Success Stories", suffix: "+" },
              { value: landingPageData?.statsLectures ?? "3500", label: t('statsLectures') || "Lectures", suffix: "+" },
              { value: landingPageData?.statsPassRate ?? "98", label: t('statsPassRate') || "Pass Rate", suffix: "%" },
            ].map((stat, idx) => (
              <FadeInSection key={idx} delay={idx * 0.1} className="text-center">
                <div className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-2">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</p>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-white dark:bg-slate-900 overflow-hidden transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
          <FadeInSection className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              {t('howItWorks')}
            </h2>
            <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
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
              <FadeInSection key={idx} delay={idx * 0.15} className="h-full group">
                <div className="text-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-700 transition-all duration-300 ease-out group-hover:shadow-xl group-hover:shadow-indigo-500/20 dark:group-hover:shadow-indigo-500/30 group-hover:border-indigo-300 dark:group-hover:border-indigo-500 group-hover:-translate-y-2 h-full active:scale-[0.98]">
                  <div className="w-24 h-24 mx-auto bg-white dark:bg-slate-900 rounded-full border-4 border-indigo-50 dark:border-slate-700 flex items-center justify-center mb-6 relative z-10 shadow-sm group-hover:border-indigo-200 dark:group-hover:border-indigo-500/30 transition-colors">
                    <motion.div 
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg"
                    >
                      <step.icon className="h-8 w-8" />
                    </motion.div>
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-slate-800">
                      {idx + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS GRID */}
      <section className="py-24 bg-gray-50 dark:bg-slate-800/50 overflow-hidden transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeInSection direction="right">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl mb-6">
                {t('whyChoose')} <span className="text-indigo-600 dark:text-indigo-400">UniTutors</span>?
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
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
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400 group-hover:text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">{item.title}</h4>
                      <p className="text-gray-500 dark:text-gray-400">{item.desc}</p>
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
                loading="lazy"
                decoding="async"
                className="relative rounded-3xl shadow-2xl object-cover h-full w-full cursor-pointer will-change-transform"
              />
            </FadeInSection>
          </div>
        </div>
      </section>
      
      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 inset-x-0 h-64 bg-slate-900/5 dark:bg-slate-800/30 -z-10 skew-y-3 transform origin-top-left"></div>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
          <FadeInSection className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              {t('pricingTitle')}
            </h2>
            <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              {t('pricingSub')}
            </p>
          </FadeInSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <FadeInSection className="h-full group" delay={0.1}>
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-gray-200 dark:border-slate-700 transition-all duration-300 ease-out group-hover:shadow-xl group-hover:shadow-indigo-500/30 dark:group-hover:shadow-indigo-500/40 group-hover:border-indigo-300 dark:group-hover:border-indigo-500 group-hover:-translate-y-2 h-full flex flex-col active:scale-[0.98]">
                <div className="h-14 w-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('singleLecture')}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">{t('singleLectureDesc')}</p>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">{t('perLecture')}</div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center text-gray-600 dark:text-gray-300"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>{t('featureLive')}</li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>{t('featureQA')}</li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>{t('featureMaterials')}</li>
                </ul>
                <button 
                  onClick={() => handleContactClick()}
                  className="flex items-center justify-center gap-2 w-full text-center py-4 border-2 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-lg active:scale-95"
                >
                  <BookOpen className="h-5 w-5" />
                  {t('browseCourses')}
                </button>
              </div>
            </FadeInSection>

            <FadeInSection className="h-full group" delay={0.2}>
              <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden h-full flex flex-col transition-all duration-300 ease-out group-hover:shadow-2xl group-hover:shadow-indigo-500/40 group-hover:-translate-y-2 border border-slate-700/50 group-hover:border-indigo-500 dark:border-slate-700 dark:group-hover:border-indigo-500 active:scale-[0.98]">
                 <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-yellow-500 dark:from-slate-900 dark:to-black text-slate-900 dark:text-yellow-400 text-xs font-bold px-4 py-2 rounded-bl-2xl uppercase tracking-wider shadow-md dark:border-b dark:border-l dark:border-slate-700">
                    {t('mostPopular')}
                 </div>
                <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-7 w-7 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{t('fullCourseBundle')}</h3>
                <p className="text-indigo-200 mb-2">{t('fullCourseDesc')}</p>
                <p className="text-green-400 text-sm font-bold mb-6">{t('discountText')}</p>
                <div className="text-2xl font-bold mb-6 flex items-center gap-2 text-yellow-400">
                  {t('perCourse')}
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center text-indigo-100"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>{t('featureAllLectures')}</li>
                  <li className="flex items-center text-indigo-100"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>{t('featureSave')}</li>
                  <li className="flex items-center text-indigo-100"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>{t('featureFeedback')}</li>
                  <li className="flex items-center text-indigo-100"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>{t('featureSupport')}</li>
                </ul>
                <button 
                  onClick={() => handleContactClick()}
                  className="flex items-center justify-center gap-2 w-full text-center py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-bold rounded-xl hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-yellow-500/40 hover:-translate-y-2 hover:scale-105 active:scale-95"
                >
                  <BookOpen className="h-5 w-5" />
                  {t('browseCourses')}
                </button>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      {featuredCourses.length > 0 && (
        <section className="py-24 bg-gray-50 dark:bg-slate-800/50 overflow-hidden transition-colors duration-300">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
            <FadeInSection className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">{t('featuredCoursesTitle')}</h2>
              <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t('featuredCoursesSub')}</p>
            </FadeInSection>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredCourses.map((course, i) => (
                <FadeInSection key={course.id} delay={i * 0.1}>
                  <CourseCard course={course} />
                </FadeInSection>
              ))}
            </div>
            <FadeInSection className="text-center mt-12">
              <Link to="/courses" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
                {t('viewAllCourses')} <ArrowRight className="h-5 w-5" />
              </Link>
            </FadeInSection>
          </div>
        </section>
      )}

      {/* MEET THE PROFESSORS */}
      {professors.length > 0 && (
        <section className="py-24 bg-white dark:bg-slate-900 overflow-hidden transition-colors duration-300">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
            <FadeInSection className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">{t('meetProfessorsTitle')}</h2>
              <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t('meetProfessorsSub')}</p>
            </FadeInSection>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {professors.map((prof, i) => (
                <FadeInSection key={prof.id} delay={i * 0.1}>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 text-center">
                    <img
                      src={prof.avatar}
                      alt={prof.name}
                      className="w-20 h-20 rounded-full mx-auto mb-4 object-cover ring-4 ring-indigo-50 dark:ring-indigo-900/30"
                    />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{prof.name}</h3>
                    <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-3">{prof.specialty}</p>
                    {prof.rating > 0 && (
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <StarRating rating={prof.rating} />
                        <span className="text-sm text-gray-500 dark:text-gray-400">{prof.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {(prof.courseCount ?? 0) > 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{prof.courseCount} {t('courses')}</p>
                    )}
                    <Link to="/courses" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
                      {t('viewProfile')} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section className="py-24 bg-gray-50 dark:bg-slate-800/50 overflow-hidden transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
          <FadeInSection className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">{t('testimonialsTitle')}</h2>
            <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t('testimonialsSub')}</p>
          </FadeInSection>
          {testimonials.length === 0 ? (
            <FadeInSection className="text-center text-gray-400 dark:text-gray-500 py-8">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>{t('noTestimonials')}</p>
            </FadeInSection>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((review, i) => (
                <FadeInSection key={review.id} delay={i * 0.08}>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                    <div className="flex items-center gap-1 mb-3">
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 italic flex-1 mb-4">"{review.comment}"</p>
                    <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{review.profiles?.full_name ?? 'Student'}</p>
                      {review.courses?.title && (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">{review.courses.title}</p>
                      )}
                    </div>
                  </div>
                </FadeInSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white dark:bg-slate-900 overflow-hidden transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12">
          <FadeInSection className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">{t('faqTitle')}</h2>
            <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t('faqSub')}</p>
          </FadeInSection>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <FadeInSection key={i} delay={i * 0.07}>
                <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white pr-4">{item.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-gray-600 dark:text-gray-300 leading-relaxed">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeInSection>
            ))}
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
                 <Link to="/courses" className="inline-flex items-center justify-center gap-3 text-indigo-900 bg-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:scale-105 active:scale-95">
                    {t('browseCourses')} <ArrowRight className="h-5 w-5" />
                 </Link>
               </div>
             </FadeInSection>
          </div>
       </section>
    </div>
  );
};
