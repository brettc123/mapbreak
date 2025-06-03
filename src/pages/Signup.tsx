// src/pages/Signup.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';
import { Mail, Lock, AlertCircle, X, Apple } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        throw signUpError;
      }

      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
  try {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/auth/success`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      },
    });
    if (error) throw error;
  } catch {
    setError('Failed to sign up with Google. Please try again.');
    setLoading(false);
  }
};

  const handleFacebookSignup = async () => {
  try {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { 
        redirectTo: `${window.location.origin}/auth/success`,
      },
    });
    if (error) throw error;
  } catch {
    setError('Failed to sign up with Facebook. Please try again.');
    setLoading(false);
  }
};


 const handleAppleSignup = async () => {
  try {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { 
        redirectTo: `${window.location.origin}/auth/success`,
      },
    });
    if (error) throw error;
  } catch {
    setError('Failed to sign up with Apple. Please try again.');
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[60] pt-safe pl-safe pr-safe pb-safe">
      <div className="h-full flex flex-col px-4">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-safe right-safe p-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="max-w-md w-full mx-auto mt-16">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Join Map Break to save your favorite locations
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {/* Google SVG icon */}
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                {/* paths omitted for brevity */}
              </svg>
              Continue with Google
            </button>

            <button
              onClick={handleFacebookSignup}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {/* Facebook SVG icon */}
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                {/* path omitted */}
              </svg>
              Continue with Facebook
            </button>

            {isIOS && (
              <button
                onClick={handleAppleSignup}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Apple className="h-5 w-5 mr-2" />
                Continue with Apple
              </button>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSignup}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div className="relative">
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-t-md relative block w-full px-10 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none rounded-b-md relative block w-full px-10 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/50 p-3 rounded-md">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  {loading ? 'Creating account...' : 'Sign up'}
                </button>
              </div>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
