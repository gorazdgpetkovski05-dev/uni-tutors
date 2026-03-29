import React from 'react';
import { X, Phone, Mail, ArrowRight, Calendar, Wallet, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle?: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, courseTitle }) => {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  const phoneNumber = "+38970356541";
  const displayPhoneNumber = "+389 70 356 541";
  const email = "uni.tutors.mk@gmail.com";

  const whatsappMessage = courseTitle
    ? `${t('waBookSession')} ${courseTitle}.`
    : t('waMoreInfo');

  const emailSubject = courseTitle ? `${t('waEmailSubjectBook')} ${courseTitle}` : t('waEmailSubjectInfo');
  const emailBody = courseTitle
    ? `${t('waBookSession')} ${courseTitle}.`
    : t('waMoreInfo');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-slate-800 shadow-2xl rounded-2xl border border-gray-200 dark:border-slate-700 relative z-10">
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                 {courseTitle ? t('bookingModalTitle') : t('contactModalTitle')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {courseTitle ? t('bookingModalDesc') : t('contactModalDesc')}
              </p>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <X className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            </button>
          </div>

          {courseTitle && (
            <div className="mb-6 space-y-3">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl border border-indigo-200 dark:border-indigo-500/30 flex items-start gap-3">
                <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
                  {t('flexibleSessionsInfo')}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-xl border border-green-200 dark:border-green-500/30 flex items-start gap-3">
                <Wallet className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-green-900 dark:text-green-200 text-sm">{t('cashOnly')}</h4>
                  <p className="text-xs text-green-800 dark:text-green-300 mt-1 leading-relaxed">
                    {t('paymentInfo')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8 space-y-3">
            <a 
              href={`https://wa.me/38970356541?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl transition-all duration-300 group active:scale-[0.98] shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white fill-current"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                <span className="text-lg font-bold tracking-wide">WhatsApp</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-white/90 group-hover:text-white transition-colors">
                 <span>{t('message')}</span>
                 <ArrowRight className="h-4 w-4" />
              </div>
            </a>

            <a 
              href={`tel:${phoneNumber}`}
              className="w-full flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 group active:scale-[0.98] shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3">
                <Phone className="h-6 w-6 text-white" />
                <span className="text-lg font-bold tracking-wide">{displayPhoneNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-white/90 group-hover:text-white transition-colors">
                 <span>{t('call')}</span>
                 <ArrowRight className="h-4 w-4" />
              </div>
            </a>

            <a 
              href={`mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
              className="w-full flex items-center justify-between p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-300 group active:scale-[0.98] shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-white" />
                <span className="text-lg font-bold tracking-wide">{email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-white/90 group-hover:text-white transition-colors">
                 <span>{t('email')}</span>
                 <ArrowRight className="h-4 w-4" />
              </div>
            </a>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-300 hover:-translate-y-1.5 hover:scale-105 hover:shadow-md active:scale-95"
           >
            {t('close')}
           </button>

        </div>
      </div>
    </div>
  );
};
