import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useSupabase();
  const navigate = useNavigate();

  const handleOAuthLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setLoading(true);
    setError(null);
    
    try {
      // Determine the correct redirect URL
      let redirectTo;
      
      // If we're on mobile or in production, use production URL
      if (window.Capacitor?.isNative || window.location.hostname !== 'localhost') {
        redirectTo = 'https://map-break-kjrrhr4o0-bretts-projects-d2e84c79.vercel.app/';
      } else {
        // Only use localhost for web development
        redirectTo = `${window.location.origin}/success`;
      }
      
      console.log('OAuth redirect URL:', redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { 
          redirectTo: redirectTo
        },
      });
      
      if (error) throw error;
      
      // For mobile, show instructions
      if (window.Capacitor?.isNative) {
        setError(`Opening ${provider} login... After completing login, please return to the MapBreak app.`);
        setLoading(false);
      }
      
    } catch (err: any) {
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
            opacity: loading ? 0.6 : 1
          }}
        >
          🔍 Continue with Google
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
            opacity: loading ? 0.6 : 1
          }}
        >
          📘 Continue with Facebook
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

      {/* Mobile Instructions */}
      {window.Capacitor?.isNative && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#1976d2',
          textAlign: 'center'
        }}>
          📱 <strong>Mobile Tip:</strong> After completing Google/Facebook login in the browser, return to this app and you'll be automatically signed in!
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
        <br />Email: {email || 'Empty'}
        <br />User: {user ? 'Authenticated' : 'Not authenticated'}
        <br />Current URL: {window.location.href}
      </div>
    </div>
  );
}