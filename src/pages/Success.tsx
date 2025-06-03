// src/pages/Success.tsx (modified version)
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';

export default function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useSupabase();
  const [successType, setSuccessType] = useState<'payment' | 'auth'>('payment');

  useEffect(() => {
    // Determine if this is auth success or payment success
    // Check URL params or other indicators
    const isAuthSuccess = searchParams.has('access_token') || 
                         searchParams.has('refresh_token') ||
                         window.location.hash.includes('access_token');
    
    if (isAuthSuccess) {
      setSuccessType('auth');
      
      // For auth success, redirect faster and to settings
      const timer = setTimeout(() => {
        if (user) {
          navigate('/settings', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    } else {
      // For payment success, use original behavior
      const timer = setTimeout(() => {
        navigate('/');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [navigate, searchParams, user]);

  if (successType === 'auth') {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Sign in successful!
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Welcome to MapBreak! You will be redirected to your settings shortly.
            </p>
            
            {/* Loading spinner */}
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 dark:border-green-400"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original payment success UI
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">Payment successful!</h2>
          <p className="mt-2 text-gray-600">Thank you for your purchase. You will be redirected shortly.</p>
        </div>
      </div>
    </div>
  );
}