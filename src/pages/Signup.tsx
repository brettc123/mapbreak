// src/pages/Signup.tsx - Improved version of your current signup

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';
import { Mail, Lock, AlertCircle, X, Apple, CheckCircle } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { supabase, user } = useSupabase();
  const navigate = useNavigate();
  const location = useLocation();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Auto-redirect if user becomes authenticated
  useEffect(() => {
  if (user && location.pathname === '/signup') {
    console.log('User is now authenticated, redirecting to settings...');
    navigate('/settings');
  }
}, [user, navigate, location.pathname]);

  // Listen for auth state changes
  /*useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, !!session);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed up successfully, redirecting...');
        navigate('/settings');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, navigate]);
*/
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Enhanced validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.hostname === 'localhost' 
            ? `${window.location.origin}/success`
            : 'https://dailymapbreak.com/success'
        }
      });

      if (signUpError) {
        if (signUpError.message === 'User already registered') {
          setError('An account with this email already exists. Try signing in instead.');
        } else if (signUpError.message.includes('email')) {
          setError('Please enter a valid email address.');
        } else {
          setError(signUpError.message);
        }
        return;
      }

      // Show success message instead of immediate redirect
      setSuccess(true);
      console.log('Email signup successful - check email for confirmation');

    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Determine the correct redirect URL
      let redirectTo;
      if (window.location.hostname === 'localhost') {
        redirectTo = `${window.location.origin}/success`;
      } else {
        redirectTo = 'https://dailymapbreak.com/success';
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });
      
      if (error) throw error;
      
      // For mobile, show instructions
      if (window.Capacitor?.isNative) {
        setError('✅ Google signup opened! After signing up, switch back to MapBreak.');
        setLoading(false);
      }
      
    } catch (err: any) {
      console.error('Google signup error:', err);
      setError('Failed to sign up with Google. Please try again.');
      setLoading(false);
    }
  };

  const handleFacebookSignup = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let redirectTo;
      if (window.location.hostname === 'localhost') {
        redirectTo = `${window.location.origin}/success`;
      } else {
        redirectTo = 'https://dailymapbreak.com/success';
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: { 
          redirectTo: redirectTo,
        },
      });
      
      if (error) throw error;
      
      if (window.Capacitor?.isNative) {
        setError('✅ Facebook signup opened! After signing up, switch back to MapBreak.');
        setLoading(false);
      }
      
    } catch (err: any) {
      console.error('Facebook signup error:', err);
      setError('Failed to sign up with Facebook. Please try again.');
      setLoading(false);
    }
  };

  const handleAppleSignup = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let redirectTo;
      if (window.location.hostname === 'localhost') {
        redirectTo = `${window.location.origin}/success`;
      } else {
        redirectTo = 'https://dailymapbreak.com/success';
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { 
          redirectTo: redirectTo,
        },
      });
      
      if (error) throw error;
      
      if (window.Capacitor?.isNative) {
        setError('✅ Apple signup opened! After signing up, switch back to MapBreak.');
        setLoading(false);
      }
      
    } catch (err: any) {
      console.error('Apple signup error:', err);
      setError('Failed to sign up with Apple. Please try again.');
      setLoading(false);
    }
  };

  // Show success screen if email signup was successful
  if (success) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[60] pt-safe pl-safe pr-safe pb-safe">
        <div className="h-full flex flex-col px-4 justify-center items-center">
          <div className="max-w-md w-full mx-auto text-center">
            <div className="bg-green-100 dark:bg-green-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Check your email!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We've sent you a confirmation link at <strong>{email}</strong>
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mb-8">
              Click the link in your email to complete your registration.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              Join MapBreak to save your favorite locations
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Signing up...' : 'Continue with Google'}
            </button>

            <button
              onClick={handleFacebookSignup}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <svg className="h-5 w-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              {loading ? 'Signing up...' : 'Continue with Facebook'}
            </button>

            {isIOS && (
              <button
                onClick={handleAppleSignup}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <Apple className="h-5 w-5 mr-2" />
                {loading ? 'Signing up...' : 'Continue with Apple'}
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
                    className="appearance-none relative block w-full px-10 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <label htmlFor="confirm-password" className="sr-only">
                    Confirm Password
                  </label>
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none rounded-b-md relative block w-full px-10 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {loading ? 'Creating account...' : 'Create account'}
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

            {/* Terms Notice */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                By creating an account, you agree to our{' '}
                <button 
                  onClick={() => navigate('/settings/legal')}
                  className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 underline"
                >
                  Terms of Service and Privacy Policy
                </button>
              </p>
            </div>

            {/* Mobile Instructions */}
            {window.Capacitor?.isNative && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    📱 <strong>Mobile Signup:</strong><br />
                    After OAuth completes, switch back to MapBreak and you'll be automatically signed in!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}