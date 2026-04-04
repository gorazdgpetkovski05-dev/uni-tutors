import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { X } from 'lucide-react';

interface CertificateGeneratorProps {
  studentName: string;
  courseName: string;
  professorName: string;
  completionDate: string;
  onClose: () => void;
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  studentName, courseName, professorName, completionDate, onClose,
}) => {
  const { t } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #certificate-print, #certificate-print * { visibility: visible !important; }
          #certificate-print {
            position: fixed !important; left: 0 !important; top: 0 !important;
            width: 100vw !important; height: 100vh !important; margin: 0 !important;
            display: flex !important; align-items: center !important; justify-content: center !important;
          }
        }
      `}</style>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('certificateOfCompletion')}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div id="certificate-print" className="bg-white mx-auto" style={{ aspectRatio: '1.414', maxWidth: '800px', padding: '40px' }}>
            <div style={{
              border: '6px double #4f46e5', borderRadius: '12px', padding: '40px',
              height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', textAlign: 'center',
              background: 'linear-gradient(135deg, #fafafa 0%, #f0f0ff 100%)',
            }}>
              <p style={{ fontSize: '14px', letterSpacing: '4px', color: '#4f46e5', fontWeight: 600, marginBottom: '4px' }}>
                UNITUTORS MK
              </p>
              <div style={{ width: '60px', height: '2px', background: '#4f46e5', margin: '8px auto 20px' }} />
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1e1b4b', margin: '0 0 6px' }}>
                {t('certificateOfCompletion')}
              </h1>
              <p style={{ fontSize: '24px', color: '#d4a017', margin: '0 0 24px' }}>&#9733;</p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px' }}>{t('certifiesCompletion')}</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#312e81', margin: '0 0 16px', borderBottom: '2px solid #4f46e5', paddingBottom: '6px' }}>
                {studentName}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px' }}>{t('hasCompleted')}</p>
              <p style={{ fontSize: '20px', fontWeight: 600, color: '#1e1b4b', margin: '0 0 20px' }}>
                {courseName}
              </p>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>{t('underGuidance')}</p>
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#312e81', margin: '0 0 24px' }}>
                {professorName}
              </p>
              <p style={{ fontSize: '13px', color: '#9ca3af' }}>
                {new Date(completionDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-6">
            <button onClick={handlePrint}
              className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all">
              {t('printCertificate')}
            </button>
            <button onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
