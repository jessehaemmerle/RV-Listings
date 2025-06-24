import React, { createContext, useContext, useState } from 'react';
import germanTranslations from './de';

// Default English translations (fallback)
const englishTranslations = {
  nav: {
    brand: "RV Classifieds",
    browseLisings: "Browse Listings",
    postListing: "Post Listing",
    myListings: "My Listings",
    login: "Login",
    register: "Register",
    logout: "Logout"
  },
  // Add more English translations as needed
};

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState('de'); // Default to German
  
  const translations = {
    de: germanTranslations,
    en: englishTranslations
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if German translation not found
        value = translations.en;
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            return key; // Return key if no translation found
          }
        }
        break;
      }
    }
    
    return value || key;
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // Load language from localStorage on mount
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  return (
    <TranslationContext.Provider value={{ 
      language, 
      changeLanguage, 
      t,
      availableLanguages: [
        { code: 'de', name: 'Deutsch' },
        { code: 'en', name: 'English' }
      ]
    }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export default TranslationContext;