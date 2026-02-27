
import React, { useState } from 'react';
import { Course, BookingType } from '../types';
import { X, Copy, Phone, Wallet, Info, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface BookingModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  bookingType: BookingType;
  selectedLectureId?: string;
  price: number;
}

export const BookingModal: React.FC<BookingModalProps> = ({ 
  course, 
  isOpen, 
  onClose, 
  bookingType, 
  selectedLectureId, 
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

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl border border-gray-100 relative">
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                 {t('contactToBook')}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                 {t('contactDesc')}
              </p>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${bookingType === 'full' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                {bookingType === 'full' ? t('fullCourseBundle') : t('singleLecture')}
              </span>
              {bookingType === 'single' && selectedLecture && (
                <span className="truncate max-w-[200px]">- {selectedLecture.title}</span>
              )}
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">{t('totalAmount')}</span>
                  <span className="text-2xl font-bold text-gray-900">{price} MKD</span>
                </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900">{t('cashOnly')}</h4>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-yellow-800">
              <Info className="h-4 w-4 inline mr-1 mb-0.5" />
              {t('paymentInfo')}
            </p>
          </div>

          <div className="mb-8">
            <button 
              onClick={handleCopy}
              className="w-full flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-indigo-400" />
                <span className="text-lg font-mono font-medium tracking-wide">{phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 group-hover:text-white transition-colors">
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-green-400">{t('copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>{t('copy')}</span>
                  </>
                )}
              </div>
            </button>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
           >
            {t('close')}
           </button>

        </div>
      </div>
    </div>
  );
};
