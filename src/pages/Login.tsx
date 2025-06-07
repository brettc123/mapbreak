import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';
import { Mail, Lock, AlertCircle, X, Apple, Info, ExternalLink } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthAttempted, setOauthAttempted] = useState(false);
  const [showOAuthConfirm, setShowOAuthConfirm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'google' | 'facebook' | 'apple' | null>(null);
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

  // Check for failed OAuth attempts when component loads
  useEffect(() => {
    const checkOAuthAttempt = () => {
      const oauthAttempt = localStorage.getItem('oauth_attempt');
      
      if (oauthAttempt && !user) {
        try {
          const attempt = JSON.parse(oauthAttempt);
          
          // Only show message if OAuth attempt was recent (within 30 seconds)
          const timeDiff = Date.now() - attempt.timestamp;
          if (timeDiff < 30000 && attempt.page === 'login') {
            setError(
              `No MapBreak account found for your ${attempt.provider} account. You'll need to sign up first to create a MapBreak account.`
            );
            setOauthAttempted(true);
          }
          
          // Clean up the attempt record
          localStorage.removeItem('oauth_attempt');
        } catch (e) {
          // Invalid JSON, just remove it
          localStorage.removeItem('oauth_attempt');
        }
      }
    };
    
    // Check immediately
    checkOAuthAttempt();
    
    // Also check after a short delay in case user data loads slowly
    const timer = setTimeout(checkOAuthAttempt, 1000);
    
    return () => clearTimeout(timer);
  }, [user]);

  // Clean up OAuth attempt tracking on successful login
  useEffect(() => {
    if (user) {
      localStorage.removeItem('oauth_attempt');
    }
  }, [user]);

  // STEP 1: Show confirmation modal instead of immediately starting OAuth
  const handleOAuthRequest = (provider: 'google' | 'facebook' | 'apple') => {
    setSelectedProvider(provider);
    setShowOAuthConfirm(true);
    setError(null);
  };

  // STEP 2: Actually perform OAuth after confirmation
  const handleOAuthConfirmed = async () => {
    if (!selectedProvider) return;
    
    setShowOAuthConfirm(false);
    setLoading(true);
    setError(null);
    
    // Track that we're attempting OAuth login
    localStorage.setItem('oauth_attempt', JSON.stringify({
      provider: selectedProvider,
      timestamp: Date.now(),
      page: 'login'
    }));
    
    try {
      let redirectTo;
      if (window.location.hostname === 'localhost') {
        redirectTo = `${window.location.origin}/login`;
      } else {
        redirectTo = 'https://dailymapbreak.com/login';
      }
      
      console.log('OAuth redirect URL:', redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: selectedProvider,
        options: { 
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });
      
      if (error) {
        localStorage.removeItem('oauth_attempt'); // Clean up on error
        console.error('OAuth error:', error);
        setError(`Failed to sign in with ${selectedProvider}. Please try again.`);
        setLoading(false);
        return;
      }
      
      // For mobile, show instructions
      if (window.Capacitor?.isNative) {
        setError(`✅ ${selectedProvider} sign-in opened! After completing, switch back to MapBreak.`);
        setLoading(false);
      }
      
    } catch (err: any) {
      localStorage.removeItem('oauth_attempt'); // Clean up on error
      console.error('OAuth error:', err);
      setError(`Failed to sign in with ${selectedProvider}. Please try again.`);
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password');
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
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message === 'Email not confirmed') {
          setError('Please confirm your email address before signing in. Check your inbox for a confirmation link.');
        } else if (error.message.includes('not found') || error.message.includes('User not found')) {
          setError('No account found with this email address. Please sign up first.');
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
              Access your existing account
            </p>
          </div>

          {/* Info banner for new users */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <strong>New to MapBreak?</strong> You'll need to{' '}
                <button
                  onClick={() => navigate('/signup')}
                  className="underline font-semibold hover:text-blue-600 dark:hover:text-blue-200"
                >
                  create an account
                </button>{' '}
                first before you can sign in.
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <button
              onClick={() => handleOAuthRequest('google')}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>

            <button
              onClick={() => handleOAuthRequest('facebook')}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <svg className="h-5 w-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Sign in with Facebook
            </button>

            {isIOS && (
              <button
                onClick={() => handleOAuthRequest('apple')}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <Apple className="h-5 w-5 mr-2" />
                Sign in with Apple
              </button>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Or sign in with email
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

              {/* Enhanced error display with OAuth feedback */}
              {error && (
                <div className="flex items-start text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/50 p-3 rounded-md">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    {error}
                    {(error.includes('No account found') || error.includes('No MapBreak account found')) && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/50 rounded border border-blue-200 dark:border-blue-700">
                        <p className="text-blue-800 dark:text-blue-300 text-sm font-medium mb-2">
                          Ready to join MapBreak?
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate('/signup')}
                          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
                        >
                          Create your MapBreak account →
                        </button>
                      </div>
                    )}
                  </div>
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
                  Sign up here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* OAuth Confirmation Modal */}
      {showOAuthConfirm && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-4">
                <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Existing Account Required
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                You can only sign in with {selectedProvider} if you already have a MapBreak account linked to that {selectedProvider} account.
                <br /><br />
                <strong>If this is your first time:</strong> Please create an account first using the Sign Up page.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowOAuthConfirm(false);
                    setSelectedProvider(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Sign Up Instead
                </button>
                <button
                  onClick={handleOAuthConfirmed}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center justify-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}