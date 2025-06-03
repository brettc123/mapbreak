import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation, TranslationKey } from '../translations';

export function useTranslation() {
  const { currentLanguage } = useLanguage();

  const t = (key: TranslationKey): string => {
    return getTranslation(currentLanguage, key);
  };

  return { t };
}