import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';
import { useSubscription } from '../hooks/useSubscription';
import { useTheme } from '../contexts/ThemeContext';
import { useTextSize } from '../contexts/TextSizeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Bell, 
  ChevronRight, 
  Globe2, 
  Star,
  UserCircle,
  ScrollText,
  Moon,
  Sun,
  HelpCircle
} from 'lucide-react';
import PaywallModal from './PaywallModal';

export default function SettingsPage() {
  const { supabase, user } = useSupabase();
  const { subscription } = useSubscription();
  const { darkMode, toggleDarkMode } = useTheme();
  const { textSize, setTextSize } = useTextSize();
  const { currentLanguage } = useLanguage();
  
  const [showPaywall, setShowPaywall] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to log out. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRateApp = () => {
    if (window.location.href.includes('ios')) {
      window.location.href = 'itms-apps://itunes.apple.com/app/id123456789?action=write-review';
    } else {
      window.location.href = 'market://details?id=com.mapbreak.app&showAllReviews=true';
    }
  };

  const isSubscribed = subscription?.subscription_status === 'active';

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Premium Banner */}
      <div className="relative h-48 mb-6 md:rounded-lg overflow-hidden">
        <img
          src="https://images.pexels.com/photos/2859169/pexels-photo-2859169.jpeg"
          alt="Premium banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            Take your daily detour with no limits!
          </h2>
          <button
            onClick={() => setShowPaywall(true)}
            className="px-6 py-3 bg-terra text-white rounded-full font-semibold hover:bg-terra/90 transition-colors"
          >
            Become Premium
          </button>
        </div>
      </div>

      {/* Settings List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
       
{/* Auth Section - FIXED VERSION */}
<div className="p-4">
  <button
    onClick={() => user ? navigate('/account') : navigate('/login')}
    className="w-full flex items-center justify-between text-left"
  >
    <div className="flex items-center">
      <UserCircle className="h-5 w-5 text-terra mr-3" />
      <span className="text-slate dark:text-white font-medium">
        {user ? 'Account Details' : 'Sign In'}
      </span>
    </div>
    <ChevronRight className="h-5 w-5 text-gray-400" />
  </button>
</div>

        {/* Language */}
        <div className="p-4">
          <button
            onClick={() => navigate('/settings/language')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center">
              <Globe2 className="h-5 w-5 text-terra mr-3" />
              <span className="text-slate dark:text-white font-medium">Language</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2 flex items-center">
                <span className="mr-2">{currentLanguage.flag}</span>
                {currentLanguage.name}
              </span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </button>
        </div>

        {/* Notifications */}
        <div className="p-4">
          <button
            onClick={() => navigate('/settings/notifications')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-terra mr-3" />
              <span className="text-slate dark:text-white font-medium">Notification Settings</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Legal */}
        <div className="p-4">
          <button
            onClick={() => navigate('/settings/legal')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center">
              <ScrollText className="h-5 w-5 text-terra mr-3" />
              <span className="text-slate dark:text-white font-medium">Legal</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Preferences */}
        <div className="p-4 space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Text Size</label>
            <div className="mt-2 flex rounded-lg shadow-sm">
              <button
                onClick={() => setTextSize('default')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-lg ${
                  textSize === 'default'
                    ? 'bg-terra text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Default
              </button>
              <button
                onClick={() => setTextSize('large')}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  textSize === 'large'
                    ? 'bg-terra text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                } rounded-r-lg`}
              >
                Large
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Theme</label>
            <div className="mt-2 flex rounded-lg shadow-sm">
              <button
                onClick={() => {
                  if (darkMode) toggleDarkMode();
                }}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  !darkMode
                    ? 'bg-terra text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                } rounded-l-lg`}
              >
                <div className="flex items-center justify-center">
                  <Sun className="h-4 w-4 mr-1" />
                  Light
                </div>
              </button>
              <button
                onClick={() => {
                  if (!darkMode) toggleDarkMode();
                }}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  darkMode
                    ? 'bg-terra text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                } rounded-r-lg`}
              >
                <div className="flex items-center justify-center">
                  <Moon className="h-4 w-4 mr-1" />
                  Dark
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Rate App */}
        <div className="p-4">
          <button
            onClick={handleRateApp}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center">
              <Star className="h-5 w-5 text-terra mr-3" />
              <span className="text-slate dark:text-white font-medium">Rate App</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Contact / Support */}
        <div className="p-4">
          <a
            href="mailto:bmc239@gmail.com"
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center">
              <HelpCircle className="h-5 w-5 text-terra mr-3" />
              <span className="text-slate dark:text-white font-medium">Contact / Support</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </a>
        </div>
      </div>

      {message && (
        <div className={`mt-6 p-4 rounded-md ${
          message.type === 'success'
            ? 'bg-sage/20 text-sage dark:bg-sage/20 dark:text-sage'
            : 'bg-terra/20 text-terra dark:bg-terra/20 dark:text-terra'
        }`}>
          {message.text}
        </div>
      )}

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
}