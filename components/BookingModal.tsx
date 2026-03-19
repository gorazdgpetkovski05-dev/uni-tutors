
import React, { useState } from 'react';
import { Course, BookingType, Midterm } from '../types';
import { X, Copy, Phone, Wallet, Info, Check, ArrowRight, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface BookingModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  bookingType: BookingType;
  selectedLectureId?: string;
  selectedMidterm?: Midterm;
  price: number;
}

export const BookingModal: React.FC<BookingModalProps> = ({ 
  course, 
  isOpen, 
  onClose, 
  bookingType, 
  selectedLectureId, 
  selectedMidterm,
  price 
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  
  if (!isOpen || !course) return null;

  const phoneNumber = "+389 70 356 541";

  const handleCopy = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedLecture = course.lectures.find(l => l.id === selectedLectureId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-slate-800 shadow-2xl rounded-2xl border border-gray-100 dark:border-slate-700 relative">
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                 {t('completeBooking')}
              </h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <X className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-4 mb-6 border border-gray-100 dark:border-slate-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{course.title}</h4>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${bookingType === 'full' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : bookingType === 'midterm' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'}`}>
                {bookingType === 'full' ? t('fullCourseBundle') : bookingType === 'midterm' ? t('midtermBundle') : t('singleLecture')}
              </span>
              {bookingType === 'single' && selectedLecture && (
                <span className="truncate max-w-[200px]">- {selectedLecture.title}</span>
              )}
              {bookingType === 'midterm' && selectedMidterm && (
                <span className="truncate max-w-[200px]">- {selectedMidterm.title}</span>
              )}
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">{t('totalAmount')}</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{price} MKD</span>
                </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white">{t('cashOnly')}</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-100 dark:border-yellow-500/30 text-yellow-800 dark:text-yellow-200">
              <Info className="h-4 w-4 inline mr-1 mb-0.5" />
              {t('paymentInfo')}
            </p>
          </div>

          <div className="mb-8 space-y-3">
            <a 
              href={`https://wa.me/38970356541?text=${encodeURIComponent(`Здраво, би сакал/а да резервирам: ${course.title} (${bookingType === 'full' ? 'Цел курс' : bookingType === 'midterm' ? `Колоквиум: ${selectedMidterm?.title}` : 'Една сесија'}).`)}`}
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
              href={`tel:+38970356541`}
              className="w-full flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 group active:scale-[0.98] shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3">
                <Phone className="h-6 w-6 text-white" />
                <span className="text-lg font-bold tracking-wide">+389 70 356 541</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-white/90 group-hover:text-white transition-colors">
                 <span>{t('call')}</span>
                 <ArrowRight className="h-4 w-4" />
              </div>
            </a>

            <a 
              href={`mailto:uni.tutors.mk@gmail.com?subject=${encodeURIComponent(`Резервација: ${course.title}`)}&body=${encodeURIComponent(`Здраво, би сакал/а да резервирам: ${course.title} (${bookingType === 'full' ? 'Цел курс' : bookingType === 'midterm' ? `Колоквиум: ${selectedMidterm?.title}` : 'Една сесија'}).`)}`}
              className="w-full flex items-center justify-between p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-300 group active:scale-[0.98] shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-white" />
                <span className="text-lg font-bold tracking-wide">uni.tutors.mk@gmail.com</span>
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
