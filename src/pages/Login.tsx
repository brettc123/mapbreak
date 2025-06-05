import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { supabase, user } = useSupabase();
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-redirect if user becomes authenticated
  useEffect(() => {
  if (user && location.pathname === '/login') {
    console.log('User is now authenticated, redirecting to settings...');
    navigate('/settings');
  }
}, [user, navigate, location.pathname]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, !!session);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in successfully, redirecting...');
        navigate('/settings');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, navigate]);

  const handleOAuthLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setLoading(true);
    setError(null);
    
    try {
      // Determine the correct redirect URL
      let redirectTo;
      
      // Check if we're in development (localhost) or production
      if (window.location.hostname === 'localhost') {
        // For local development, use localhost
        redirectTo = `${window.location.origin}/success`;
      } else {
        // For production (mobile or web), use the custom domain
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

      // Success - will be handled by the useEffect above
      console.log('Email login successful');
      
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'white',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '10px',
          border: 'none',
          background: 'transparent',
          fontSize: '24px',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        ✕
      </button>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          margin: '0 0 10px 0',
          color: '#1f2937'
        }}>
          Sign in to MapBreak
        </h1>
        <p style={{ color: '#666', margin: 0, fontSize: '16px' }}>
          Access your dashboard and settings
        </p>
      </div>

      {/* Social Login Buttons */}
      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={() => handleOAuthLogin('google')}
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            marginBottom: '15px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: 'white',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
            }
          }}
        >
          <svg style={{ width: '20px', height: '20px', marginRight: '12px' }} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span style={{ fontWeight: '500' }}>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </span>
        </button>

        <button
          onClick={() => handleOAuthLogin('facebook')}
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            marginBottom: '15px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: 'white',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
            }
          }}
        >
          <svg style={{ width: '20px', height: '20px', marginRight: '12px' }} fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span style={{ fontWeight: '500' }}>
            {loading ? 'Signing in...' : 'Continue with Facebook'}
          </span>
        </button>
      </div>

      {/* Divider */}
      <div style={{ 
        textAlign: 'center', 
        margin: '30px 0',
        position: 'relative'
      }}>
        <div style={{
          height: '1px',
          backgroundColor: '#e5e7eb',
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0
        }}></div>
        <span style={{
          backgroundColor: 'white',
          padding: '0 20px',
          color: '#6b7280',
          fontSize: '14px',
          position: 'relative'
        }}>
          Or continue with
        </span>
      </div>

      {/* Email Form */}
      <form onSubmit={handleEmailLogin}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '15px',
            marginBottom: '15px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '16px',
            boxSizing: 'border-box',
            backgroundColor: 'white',
            transition: 'border-color 0.2s ease',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#4f46e5';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '15px',
            marginBottom: '20px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '16px',
            boxSizing: 'border-box',
            backgroundColor: 'white',
            transition: 'border-color 0.2s ease',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#4f46e5';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />

        {error && (
          <div style={{
            padding: '15px',
            marginBottom: '20px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'flex-start'
          }}>
            <span style={{ marginRight: '8px', flexShrink: 0 }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: loading ? '#9ca3af' : '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s ease',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#4338ca';
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#4f46e5';
            }
          }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {/* Sign Up Link */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <p style={{ color: '#6b7280', margin: '0 0 10px 0', fontSize: '14px' }}>
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            style={{
              background: 'none',
              border: 'none',
              color: '#4f46e5',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: 'inherit',
              fontWeight: '500'
            }}
          >
            Sign up
          </button>
        </p>
      </div>

      {/* Mobile Instructions */}
      {window.Capacitor?.isNative && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '12px',
          fontSize: '14px',
          color: '#0369a1',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>📱</div>
          <strong>Mobile Login:</strong>
          <br />
          After OAuth completes, switch back to MapBreak and you'll be automatically signed in!
        </div>
      )}

      {/* Debug Info */}
      <div style={{
        marginTop: '40px',
        padding: '15px',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <strong>Debug Info:</strong>
        <br />Loading: {loading ? 'Yes' : 'No'}
        <br />Error: {error || 'None'}
        <br />User: {user ? 'Authenticated ✅' : 'Not authenticated'}
        <br />Platform: {window.Capacitor?.isNative ? 'Mobile App' : 'Web Browser'}
        <br />Domain: {window.location.hostname}
      </div>
    </div>
  );
}