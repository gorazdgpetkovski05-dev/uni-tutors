import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WHATSAPP_URL } from '../constants';
import { MessageCircle, X, Gift, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const DiscountPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Show popup after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000); // Increased delay to be less intrusive

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleButtonClick = () => {
    setIsVisible(false);
    const message = encodeURIComponent("Hello, I saw the special offer and I'm interested in a discount!");
    window.open(`${WHATSAPP_URL}?text=${message}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-4 right-4 z-[100] max-w-sm w-full mx-auto md:right-8 md:bottom-8"
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-indigo-100 relative">
            <button 
              onClick={handleClose}
              className="absolute top-2 right-2 p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
            
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-50 transform -skew-x-12"></div>
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-yellow-300 animate-pulse" />
              <h3 className="text-xl font-bold relative z-10">{t('discountTitle')}</h3>
            </div>
            
            <div className="p-5 text-center">
              <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Gift className="h-8 w-8 text-indigo-600" />
              </div>
              <p className="text-gray-600 mb-4 font-medium">
                {t('discountDesc')}
              </p>
              <button 
                onClick={handleButtonClick}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-1 active:scale-95"
              >
                <MessageCircle className="h-5 w-5" />
                {t('discountButton')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
