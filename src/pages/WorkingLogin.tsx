import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';
import { Mail, Lock, AlertCircle, X, Apple, Info, ExternalLink } from 'lucide-react';

export default function WorkingLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleOAuthRequest = (provider: 'google' | 'facebook' | 'apple') => {
    setSelectedProvider(provider);
    setShowOAuthConfirm(true);
    setError(null);
  };

  const handleOAuthConfirmed = async () => {
    if (!selectedProvider) return;
    
    setShowOAuthConfirm(false);
    setLoading(true);
    setError(null);
    
    try {
      let redirectTo;
      if (window.location.hostname === 'localhost') {
        redirectTo = `${window.location.origin}/login`;
      } else {
        redirectTo = 'https://dailymapbreak.com/login';
      }
      
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
        console.error('OAuth error:', error);
        setError(`Failed to sign in with ${selectedProvider}. Please try again.`);
        setLoading(false);
        return;
      }
      
      if (window.Capacitor?.isNative) {
        setError(`✅ ${selectedProvider} sign-in opened! After completing, switch back to MapBreak.`);
        setLoading(false);
      }
      
    } catch (err: any) {
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
    <div 
      className="fixed inset-0 bg-white dark:bg-gray-900 z-[60] pt-safe pl-safe pr-safe pb-safe"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        zIndex: 60,
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 16px)',
        paddingRight: 'env(safe-area-inset-right, 16px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div 
        className="h-full flex flex-col px-4"
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '0 16px',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute top-safe right-safe p-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          style={{
            position: 'absolute',
            top: 'env(safe-area-inset-top, 16px)',
            right: 'env(safe-area-inset-right, 16px)',
            padding: '16px',
            color: '#6b7280',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <X className="h-6 w-6" />
        </button>

        <div 
          className="max-w-md w-full mx-auto mt-16"
          style={{
            maxWidth: '28rem',
            width: '100%',
            margin: '64px auto 0',
          }}
        >
          <div>
            <h2 
              className="text-center text-3xl font-extrabold text-gray-900 dark:text-white"
              style={{
                textAlign: 'center',
                fontSize: '30px',
                fontWeight: '800',
                color: '#111827',
                marginBottom: '8px',
              }}
            >
              Sign in to MapBreak
            </h2>
            <p 
              className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
              style={{
                marginTop: '8px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '24px',
              }}
            >
              Access your existing account
            </p>
          </div>

          {/* Info banner */}
          <div 
            className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg"
            style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              marginBottom: '24px',
            }}
          >
            <div className="flex" style={{ display: 'flex' }}>
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300" style={{ fontSize: '14px', color: '#1e40af' }}>
                <strong>New to MapBreak?</strong> You'll need to{' '}
                <button
                  onClick={() => navigate('/signup')}
                  className="underline font-semibold hover:text-blue-600 dark:hover:text-blue-200"
                  style={{ textDecoration: 'underline', fontWeight: '600' }}
                >
                  create an account
                </button>{' '}
                first before you can sign in.
              </div>
            </div>
          </div>

          <div 
            className="mt-6 space-y-4"
            style={{
              marginTop: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <button
              onClick={() => handleOAuthRequest('google')}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
              }}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" style={{ width: '20px', height: '20px', marginRight: '8px' }}>
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
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
              }}
            >
              <svg className="h-5 w-5 mr-2" fill="#1877F2" viewBox="0 0 24 24" style={{ width: '20px', height: '20px', marginRight: '8px' }}>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Sign in with Facebook
            </button>

            {isIOS && (
              <button
                onClick={() => handleOAuthRequest('apple')}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  backgroundColor: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                }}
              >
                <Apple className="h-5 w-5 mr-2" />
                Sign in with Apple
              </button>
            )}

            <div className="relative" style={{ position: 'relative', margin: '24px 0' }}>
              <div className="absolute inset-0 flex items-center" style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: '#d1d5db' }}>
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm" style={{ position: 'relative', textAlign: 'center', backgroundColor: 'white', padding: '0 8px', fontSize: '14px', color: '#6b7280' }}>
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Or sign in with email
                </span>
              </div>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleEmailLogin} style={{ marginTop: '32px' }}>
              <div className="rounded-md shadow-sm -space-y-px" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="relative" style={{ position: 'relative' }}>
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} />
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-t-md relative block w-full px-10 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    style={{
                      width: '100%',
                      paddingLeft: '40px',
                      paddingRight: '16px',
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      border: '1px solid #d1d5db',
                      borderTopLeftRadius: '6px',
                      borderTopRightRadius: '6px',
                      borderBottomWidth: '0',
                      fontSize: '14px',
                      color: '#111827',
                      backgroundColor: 'white',
                      boxSizing: 'border-box',
                    }}
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="relative" style={{ position: 'relative' }}>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-b-md relative block w-full px-10 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    style={{
                      width: '100%',
                      paddingLeft: '40px',
                      paddingRight: '16px',
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      border: '1px solid #d1d5db',
                      borderBottomLeftRadius: '6px',
                      borderBottomRightRadius: '6px',
                      fontSize: '14px',
                      color: '#111827',
                      backgroundColor: 'white',
                      boxSizing: 'border-box',
                    }}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div 
                  className="flex items-start text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/50 p-3 rounded-md"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    color: '#dc2626',
                    fontSize: '14px',
                    backgroundColor: '#fef2f2',
                    padding: '12px',
                    borderRadius: '6px',
                    marginTop: '16px',
                  }}
                >
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" style={{ width: '20px', height: '20px', marginRight: '8px', flexShrink: 0, marginTop: '2px' }} />
                  <div>{error}</div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '12px 16px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '6px',
                    color: 'white',
                    backgroundColor: '#4f46e5',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1,
                    marginTop: '16px',
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>

            <div className="text-center" style={{ textAlign: 'center', marginTop: '24px' }}>
              <p className="text-sm text-gray-600 dark:text-gray-400" style={{ fontSize: '14px', color: '#6b7280' }}>
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/signup')}
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  style={{ fontWeight: '500', color: '#4f46e5', textDecoration: 'none' }}
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
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6" style={{ backgroundColor: 'white', borderRadius: '8px', maxWidth: '28rem', width: '100%', padding: '24px' }}>
            <div className="text-center" style={{ textAlign: 'center' }}>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-4" style={{ margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fed7aa' }}>
                <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" style={{ width: '24px', height: '24px', color: '#ea580c' }} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2" style={{ fontSize: '18px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>
                Existing Account Required
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6" style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                You can only sign in with {selectedProvider} if you already have a MapBreak account linked to that {selectedProvider} account.
                <br /><br />
                <strong>If this is your first time:</strong> Please create an account first using the Sign Up page.
              </p>
              <div className="flex gap-3" style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    setShowOAuthConfirm(false);
                    setSelectedProvider(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  style={{ flex: '1 1 0%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', color: '#374151', backgroundColor: 'white' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  style={{ flex: '1 1 0%', padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', borderRadius: '6px', border: 'none' }}
                >
                  Sign Up Instead
                </button>
                <button
                  onClick={handleOAuthConfirmed}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center justify-center"
                  style={{ flex: '1 1 0%', padding: '8px 16px', backgroundColor: '#ea580c', color: 'white', borderRadius: '6px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ExternalLink className="h-4 w-4 mr-1" style={{ width: '16px', height: '16px', marginRight: '4px' }} />
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