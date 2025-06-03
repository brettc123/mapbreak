import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useHaptics } from '../hooks/useHaptics';
import { useSupabase } from '../hooks/useSupabase';

export default function NotificationSettings() {
  const navigate = useNavigate();
  const { user } = useSupabase();
  const { 
    permissionStatus, 
    isEnabled,
    isDisabled,
    token,
    error,
    enableNotifications,
    disableNotifications,
    notifications,
    isNative 
  } = usePushNotifications();
  
  const { selectionImpact } = useHaptics();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleTogglePush = async () => {
    if (!isNative) {
      showMessage('error', 'Push notifications are only available on mobile devices.');
      return;
    }

    setLoading(true);
    
    try {
      await selectionImpact();
    } catch (hapticError) {
      console.warn('Haptic feedback failed:', hapticError);
    }
    
    try {
      if (isEnabled) {
        // Disable notifications
        console.log('Attempting to disable notifications...');
        const success = await disableNotifications();
        if (success) {
          showMessage('success', 'Push notifications disabled successfully.');
        } else {
          showMessage('error', 'Failed to disable push notifications.');
        }
      } else {
        // Enable notifications
        console.log('Attempting to enable notifications...');
        const success = await enableNotifications();
        if (success) {
          showMessage('success', 'Push notifications enabled successfully!');
        } else {
          showMessage('error', 'Failed to enable push notifications. Please check your device settings.');
        }
      }
    } catch (error) {
      console.error('Error toggling push notifications:', error);
      const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';
      showMessage('error', `Error managing push notifications: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto p-6 pt-12">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-slate dark:text-white ml-2">Notifications</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
          
          {/* Push Notifications Section */}
          {isNative && (
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <Bell className="h-5 w-5 text-terra" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate dark:text-white">
                      Push Notifications
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get notified about new locations and updates
                      {!user && (
                        <span className="block text-xs text-gray-400 mt-1">
                          • Works without signing in
                        </span>
                      )}
                    </p>
                    
                    {/* Status indicator */}
                    <div className="flex items-center mt-2">
                      {isEnabled ? (
                        <>
                          <Check className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-600 dark:text-green-400">Enabled</span>
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-sm text-red-600 dark:text-red-400">Not enabled</span>
                        </>
                      )}
                      
                      {token && isEnabled && (
                        <span className="text-xs text-gray-500 ml-2">
                          Token: {token.substring(0, 8)}...
                        </span>
                      )}
                    </div>
                    
                    {error && (
                      <div className="text-xs text-red-500 mt-1">{error}</div>
                    )}
                  </div>
                </div>
                
                {/* Toggle */}
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isEnabled}
                      onChange={handleTogglePush}
                      disabled={loading}
                    />
                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-terra/20 dark:peer-focus:ring-terra/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-terra ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                  </label>
                </div>
              </div>
              
              {/* Additional help text for permissions */}
              {!permissionStatus && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    To enable push notifications, you'll need to grant permission when prompted. 
                    If you previously denied permission, you can enable it in your device settings.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Recent Notifications Section */}
          {notifications.length > 0 && (
            <div className="p-4">
              <h2 className="text-lg font-semibold text-slate dark:text-white mb-4">
                Recent Notifications
              </h2>
              <div className="space-y-4">
                {notifications.slice(0, 5).map((notification, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-sm font-medium text-slate dark:text-white">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {notification.body}
                    </p>
                    {notification.data && Object.keys(notification.data).length > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        Data: {JSON.stringify(notification.data)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mt-6 p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200'
              : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}