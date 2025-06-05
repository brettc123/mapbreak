import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';
import { useSubscription } from '../hooks/useSubscription';
import { ChevronLeft, User, Mail, Calendar, Star, CreditCard } from 'lucide-react';

export default function AccountDetails() {
  const { user, supabase } = useSupabase();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terra"></div>
      </div>
    );
  }

  const isSubscribed = subscription?.subscription_status === 'active';
  
  // Format dates nicely
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'google': return 'Google';
      case 'facebook': return 'Facebook';
      case 'apple': return 'Apple';
      case 'email': return 'Email';
      default: return provider;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Account Details
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="h-16 w-16 bg-terra/10 rounded-full flex items-center justify-center mr-4">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  className="h-16 w-16 rounded-full"
                />
              ) : (
                <User className="h-8 w-8 text-terra" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {isSubscribed ? 'Premium Member' : 'Free Account'}
              </p>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-gray-900 dark:text-white">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                <p className="text-gray-900 dark:text-white">
                  {formatDate(user.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sign-in Method</p>
                <p className="text-gray-900 dark:text-white">
                  {getProviderName(user.app_metadata?.provider || 'email')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Subscription Status
            </h3>
            {isSubscribed && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <Star className="h-4 w-4 mr-1" />
                Active
              </span>
            )}
          </div>

          {isSubscribed ? (
            <div className="space-y-3">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
                  <p className="text-gray-900 dark:text-white">MapBreak Premium</p>
                </div>
              </div>
              
              {subscription?.current_period_end && (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Next Billing Date</p>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">
                  Premium Benefits Active
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>✓ Unlimited favorite maps</li>
                  <li>✓ Sync across devices</li>
                  <li>✓ Premium support</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You're currently on the free plan.
              </p>
              <button
                onClick={() => navigate('/settings')}
                className="px-6 py-2 bg-terra text-white rounded-lg hover:bg-terra/90 transition-colors"
              >
                Upgrade to Premium
              </button>
            </div>
          )}
        </div>

        {/* Account Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Account Activity
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-terra">
                {user.user_metadata?.favorite_count || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Favorite Maps
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-terra">
                {Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Days Active
              </p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className={`mt-6 p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700'
              : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700'
          }`}>
            <div className="flex items-center">
              <span className="mr-2">
                {message.type === 'success' ? '✅' : '❌'}
              </span>
              {message.text}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}