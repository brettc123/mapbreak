import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';
import { Mail, Lock, AlertCircle, X, Apple } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { supabase, user } = useSupabase();
  const navigate = useNavigate();
  const location = useLocation();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Auto-redirect if user becomes authenticated
  useEffect(() => {
    if (user && location.pathname === '/login') {
      console.log('User is now authenticated, redirecting to settings...');
      navigate('/settings');
    }
  }, [user, navigate, location.pathname]);

  const handleOAuthLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setLoading(true);
    setError(null);
    
    try {
      // Determine the correct redirect URL
      let redirectTo;
      
      if (window.location.hostname === 'localhost') {
        redirectTo = `${window.location.origin}/success`;
      } else {
        redirectTo = 'https://dailymapbreak.com/success';
      }
      
      console.log('OAuth redirect URL:', redirectTo);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
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
        setError(`✅ ${provider} login opened! After signing in, switch back to MapBreak.`);
        setLoading(false);
      }
      
    } catch (err: any) {
      console.error('OAuth error:', err);
      setError(`Failed to sign in with ${provider}. Please try again.`);
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          setError('Invalid email or password. Please try again.');
        } else if (error.message === 'Email not confirmed') {
          setError('Please confirm your email address before logging in.');
        } else {
          setError(error.message);
        }
        return;
      }

      console.log('Email login successful');
      
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
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
              Sign in to MapBreak
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Access your dashboard and settings
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <button
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>

            <button
              onClick={() => handleOAuthLogin('facebook')}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <svg className="h-5 w-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              {loading ? 'Signing in...' : 'Continue with Facebook'}
            </button>

            {isIOS && (
              <button
                onClick={() => handleOAuthLogin('apple')}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <Apple className="h-5 w-5 mr-2" />
                {loading ? 'Signing in...' : 'Continue with Apple'}
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

            <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
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
                    autoComplete="current-password"
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
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/signup')}
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Sign up
                </button>
              </p>
            </div>

            {/* Mobile Instructions */}
            {window.Capacitor?.isNative && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    📱 <strong>Mobile Login:</strong><br />
                    After OAuth completes, switch back to MapBreak and you'll be automatically signed in!
                  </p>
                </div>
              </div>
            )}

            {/* Debug Info */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <strong>Debug Info:</strong>
                <br />Loading: {loading ? 'Yes' : 'No'}
                <br />Error: {error || 'None'}
                <br />User: {user ? 'Authenticated ✅' : 'Not authenticated'}
                <br />Platform: {window.Capacitor?.isNative ? 'Mobile App' : 'Web Browser'}
                <br />Domain: {window.location.hostname}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}