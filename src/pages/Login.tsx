import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';
import { Browser } from '@capacitor/browser';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { supabase, user } = useSupabase();
  const navigate = useNavigate();

  // Auto-redirect if user becomes authenticated
  useEffect(() => {
    if (user) {
      console.log('User is now authenticated, redirecting to settings...');
      navigate('/settings');
    }
  }, [user, navigate]);

  const handleOAuthLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setLoading(true);
    setError(null);
    
    try {
      const isMobile = window.Capacitor?.isNative;
      
      if (isMobile) {
        // For mobile: Use in-app browser for seamless experience
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: 'https://map-break-kjrrhr4o0-bretts-projects-d2e84c79.vercel.app/',
            skipBrowserRedirect: true,
            queryParams: {
              // Force consent screen to show app branding
              prompt: 'consent',
              access_type: 'offline'
            }
          }
        });
        
        if (error) throw error;
        
        if (data?.url) {
          // Open OAuth in in-app browser (like DailyArt)
          const browserResult = await Browser.open({
            url: data.url,
            presentationStyle: 'popover', // iOS style
            showTitle: false,
            toolbarColor: '#4F46E5', // Match your app colors
          });
          
          // Set up listeners for when browser closes
          const finishedListener = Browser.addListener('browserFinished', async () => {
            console.log('OAuth browser closed, checking auth status...');
            
            // Small delay to allow auth state to update
            setTimeout(async () => {
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                console.log('✅ Authentication successful!');
                setLoading(false);
                navigate('/settings');
              } else {
                console.log('❌ No session found after OAuth');
                setLoading(false);
                setError('Login was cancelled or failed. Please try again.');
              }
            }, 1000);
            
            // Clean up listener
            finishedListener.remove();
          });
          
          // Handle page load events to detect success
          const pageLoadedListener = Browser.addListener('browserPageLoaded', async () => {
            console.log('OAuth page loaded');
            
            // Check if we've reached the success page
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              console.log('✅ OAuth successful, closing browser...');
              await Browser.close();
              pageLoadedListener.remove();
            }
          });
          
        }
      } else {
        // For web: standard OAuth flow
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: { 
            redirectTo: `${window.location.origin}/success`,
            queryParams: {
              prompt: 'consent',
              access_type: 'offline'
            }
          },
        });
        
        if (error) throw error;
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

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/settings');
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
          cursor: 'pointer'
        }}
      >
        ✕
      </button>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
          Sign in to MapBreak
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
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
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: 'white',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg style={{ width: '20px', height: '20px', marginRight: '10px' }} viewBox="0 0 24 24">
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
          style={{
            width: '100%',
            padding: '15px',
            marginBottom: '15px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: 'white',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg style={{ width: '20px', height: '20px', marginRight: '10px' }} fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          {loading ? 'Signing in...' : 'Continue with Facebook'}
        </button>
      </div>

      {/* Divider */}
      <div style={{ 
        textAlign: 'center', 
        margin: '20px 0',
        position: 'relative'
      }}>
        <div style={{
          height: '1px',
          backgroundColor: '#ccc',
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0
        }}></div>
        <span style={{
          backgroundColor: 'white',
          padding: '0 15px',
          color: '#666',
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
            border: '1px solid #ccc',
            borderRadius: '8px',
            fontSize: '16px',
            boxSizing: 'border-box'
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
            border: '1px solid #ccc',
            borderRadius: '8px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />

        {error && (
          <div style={{
            padding: '15px',
            marginBottom: '20px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            color: '#c33',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {/* Sign Up Link */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p style={{ color: '#666', margin: '0 0 10px 0' }}>
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            style={{
              background: 'none',
              border: 'none',
              color: '#4F46E5',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: 'inherit'
            }}
          >
            Sign up
          </button>
        </p>
      </div>

      {/* Status indicator */}
      {loading && window.Capacitor?.isNative && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#1976d2',
          textAlign: 'center'
        }}>
          🔐 Signing in securely... The OAuth window will close automatically when complete.
        </div>
      )}

      {/* Debug Info */}
      <div style={{
        marginTop: '40px',
        padding: '15px',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#666'
      }}>
        <strong>Debug Info:</strong>
        <br />Loading: {loading ? 'Yes' : 'No'}
        <br />Error: {error || 'None'}
        <br />User: {user ? 'Authenticated ✅' : 'Not authenticated'}
        <br />Platform: {window.Capacitor?.isNative ? 'Mobile App' : 'Web'}
      </div>
    </div>
  );
}