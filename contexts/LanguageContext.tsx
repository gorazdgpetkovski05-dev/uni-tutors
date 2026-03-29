
import React, { createContext, useContext, useState } from 'react';
import { translations, Language } from '../translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'mk',
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('lang') as Language) ?? 'mk');

  const handleSetLanguage = (lang: Language) => {
    localStorage.setItem('lang', lang);
    setLanguage(lang);
  };

  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] ?? translations['en'][key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
