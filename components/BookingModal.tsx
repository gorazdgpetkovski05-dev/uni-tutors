
import React, { useState } from 'react';
import { Course, BookingType } from '../types';
import { X, Check, Copy, Phone, Wallet, Info, LogIn, UserPlus, Loader, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useNotification } from '../contexts/NotificationContext';
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
  const { isAuthenticated, user } = useAuth();
  const { addBooking } = useData();
  const { notify } = useNotification();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  if (!isOpen || !course) return null;

  if (user?.role === 'teacher') return null;

  const phoneNumber = "+389 71 555 999";

  const handleCopy = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmBooking = async () => {
    if (!user) return;
    setError('');
    
    // 1. Validate Selection
    if (bookingType === 'single' && !selectedLectureId) {
        setError("Please select a specific lecture date.");
        return;
    }

    setLoading(true);
    
    try {
        const selectedLecture = course.lectures.find(l => l.id === selectedLectureId);
        
        const dateToBook = bookingType === 'single' && selectedLecture 
            ? selectedLecture.date 
            : course.lectures[0]?.date || new Date().toISOString();

        if (!dateToBook) {
            throw new Error("Invalid date selected. Please try again.");
        }

        await addBooking({
            id: `b-${Date.now()}`, // Temporary ID, DB assigns real one
            userId: user.id,
            userEmail: user.email,
            courseId: course.id,
            courseTitle: course.title,
            type: bookingType,
            status: 'pending',
            date: dateToBook
        });

        notify('Success', t('requestSent'), 'success');
        setRequestSent(true); // This switches the UI to success state
    } catch (e: any) {
        console.error("Booking Error Catch:", e);
        setError(e.message || 'Failed to send booking request.');
        notify('Error', 'Failed to send booking request.', 'info');
    } finally {
        setLoading(false);
    }
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
                 {isAuthenticated ? t('completeBooking') : t('contactLogin')}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                 {isAuthenticated ? t('confirmSpot') : t('loginRequired')}
              </p>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>

          {!requestSent ? (
            <>
              {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                      <AlertTriangle className="h-4 w-4" /> {error}
                  </div>
              )}

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
                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-gray-600 font-medium">{t('totalAmount')}</span>
                  <span className="text-2xl font-bold text-gray-900">{price} MKD</span>
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

              {isAuthenticated ? (
                <button 
                  onClick={handleConfirmBooking}
                  disabled={loading || (bookingType === 'single' && !selectedLectureId)}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 flex justify-center items-center"
                >
                  {loading ? <Loader className="animate-spin h-5 w-5" /> : t('confirmBooking')}
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                   <Link to="/login" className="w-full">
                      <button className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        <LogIn className="h-4 w-4" /> {t('login')}
                      </button>
                   </Link>
                   <Link to="/signup" className="w-full">
                      <button className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                        <UserPlus className="h-4 w-4" /> {t('signup')}
                      </button>
                   </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
               <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-600" />
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-2">{t('requestSent')}</h3>
               <p className="text-gray-500 mb-6">
                  {t('requestSentDesc')}
               </p>
               <button 
                onClick={onClose}
                className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
               >
                {t('close')}
               </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
