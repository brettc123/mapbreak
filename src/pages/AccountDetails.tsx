import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';
import { ArrowLeft } from 'lucide-react';

export default function AccountDetails() {
  const { supabase, user } = useSupabase();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      navigate('/settings');
    } catch (err) {
      setError('Failed to log out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        setLoading(true);
        // Add your delete account API call here
        await handleLogout();
      } catch (err) {
        setError('Failed to delete account. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/settings')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-slate dark:text-white ml-2">Account Details</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
            <p className="mt-1 text-lg text-slate dark:text-white">{user.email}</p>
          </div>

          <div className="pt-6 space-y-4">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-slate dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {loading ? 'Signing out...' : 'Log Out'}
            </button>

            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="w-full px-4 py-3 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition-colors"
            >
              Delete Account
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}