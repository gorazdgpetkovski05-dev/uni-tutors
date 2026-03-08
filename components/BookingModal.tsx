
import React, { useState } from 'react';
import { Course, BookingType, Midterm } from '../types';
import { X, Copy, Phone, Wallet, Info, Check, ArrowRight } from 'lucide-react';
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

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl border border-gray-100 relative">
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                 {t('completeBooking')}
              </h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${bookingType === 'full' ? 'bg-indigo-100 text-indigo-700' : bookingType === 'midterm' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {bookingType === 'full' ? t('fullCourseBundle') : bookingType === 'midterm' ? 'Midterm Bundle' : t('singleLecture')}
              </span>
              {bookingType === 'single' && selectedLecture && (
                <span className="truncate max-w-[200px]">- {selectedLecture.title}</span>
              )}
              {bookingType === 'midterm' && selectedMidterm && (
                <span className="truncate max-w-[200px]">- {selectedMidterm.title}</span>
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
            <a 
              href={`https://wa.me/38970356541?text=${encodeURIComponent(`Hello, I would like to book: ${course.title} (${bookingType === 'full' ? 'Full Course' : bookingType === 'midterm' ? `Midterm: ${selectedMidterm?.title}` : 'Single Session'}).`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl transition-all group active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white fill-current"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                <span className="text-lg font-bold tracking-wide">Message on WhatsApp</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-white/90 group-hover:text-white transition-colors">
                 <span>Open App</span>
                 <ArrowRight className="h-4 w-4" />
              </div>
            </a>
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
