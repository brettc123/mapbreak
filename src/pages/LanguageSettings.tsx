import { ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage, languages } from '../contexts/LanguageContext';

export default function LanguageSettings() {
  const navigate = useNavigate();
  const { currentLanguage, setLanguage, isLoading } = useLanguage();

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terra"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-slate dark:text-white ml-2">Language</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => setLanguage(language)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{language.flag}</span>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate dark:text-white">
                    {language.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language.nativeName}
                  </p>
                </div>
              </div>
              {currentLanguage.code === language.code && (
                <Check className="h-5 w-5 text-terra" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}