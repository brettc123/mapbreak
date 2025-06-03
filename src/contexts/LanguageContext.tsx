import React, { createContext, useContext, useEffect, useState } from 'react';
import { Preferences } from '@capacitor/preferences';

export type Language = {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
};

export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' }
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLanguage() {
      try {
        const { value } = await Preferences.get({ key: 'language' });
        if (value) {
          setCurrentLanguage(JSON.parse(value));
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadLanguage();
  }, []);

  const setLanguage = async (language: Language) => {
    try {
      await Preferences.set({
        key: 'language',
        value: JSON.stringify(language),
      });
      setCurrentLanguage(language);
      document.documentElement.lang = language.code;
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}