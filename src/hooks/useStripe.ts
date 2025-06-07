import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from './useSupabase';

// Enhanced config getter for mobile
const getStripeConfig = () => {
  // Try to get from import.meta.env first (web)
  let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  let stripePriceId = import.meta.env.VITE_STRIPE_PRICE_ID;
  let stripePriceIdMonthly = import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY;
  let stripePriceIdYearly = import.meta.env.VITE_STRIPE_PRICE_ID_YEARLY;
  
  // Your actual values as fallback for mobile
  if (!supabaseUrl) {
    console.warn('Supabase URL not found in env, using fallback');
    supabaseUrl = 'https://lsejipfazdixicnfkubm.supabase.co';
  }
  
  if (!stripePriceId) {
    console.warn('Stripe price ID not found in env, using fallback');
    stripePriceId = 'price_1RMAnbKj65mpBHZmbnBIBu1N';
  }
  
  if (!stripePriceIdMonthly) {
    stripePriceIdMonthly = 'price_1RMAnbKj65mpBHZmbnBIBu1N';
  }
  
  if (!stripePriceIdYearly) {
    stripePriceIdYearly = 'prod_SRcj6KwfVkOVHS';
  }
  
  return {
    supabaseUrl,
    stripePriceId,
    stripePriceIdMonthly,
    stripePriceIdYearly
  };
};

export function useStripe() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useSupabase();
  const navigate = useNavigate();

  const createCheckoutSession = useCallback(
    async ({
      priceId,
      mode,
      successUrl,
      cancelUrl,
    }: {
      priceId: string;
      mode: 'payment' | 'subscription';
      successUrl?: string;
      cancelUrl?: string;
    }) => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🔄 Creating checkout session...');

        // Get session with better error handling
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          throw new Error('Authentication error. Please try logging in again.');
        }

        if (!session?.access_token) {
          console.log('❌ No access token, redirecting to login');
          navigate('/login');
          throw new Error('Please log in to continue.');
        }

        // Enhanced URL handling for mobile vs web
        const { supabaseUrl } = getStripeConfig();
        
        if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL_HERE') {
          throw new Error('Supabase URL not configured properly.');
        }

        // Determine base URL for success/cancel URLs
        const baseUrl = window.Capacitor?.isNative 
          ? 'https://dailymapbreak.com' // Your actual web domain
          : window.location.origin;

        const finalSuccessUrl = successUrl || `${baseUrl}/success`;
        const finalCancelUrl = cancelUrl || `${baseUrl}/cancel`;

        console.log('🔄 Making request to Stripe function...');
        console.log('URLs:', { finalSuccessUrl, finalCancelUrl });

        const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            price_id: priceId,
            success_url: finalSuccessUrl,
            cancel_url: finalCancelUrl,
            mode,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ HTTP Error:', response.status, errorText);
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Stripe response:', data);

        if (!data.url) {
          throw new Error('No checkout URL received from the server');
        }

        // Handle URL opening for mobile vs web
        if (window.Capacitor?.isNative) {
          // For mobile, open in external browser
          console.log('📱 Opening checkout in external browser...');
          window.open(data.url, '_system');
        } else {
          // For web, redirect normally
          console.log('🌐 Redirecting to checkout...');
          window.location.href = data.url;
        }

      } catch (err: any) {
        console.error('❌ Checkout error:', err);
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, navigate],
  );

  // Helper function for the subscription flow
  const createSubscription = useCallback(async () => {
    const { stripePriceId } = getStripeConfig();
    
    if (!stripePriceId || stripePriceId === 'YOUR_STRIPE_PRICE_ID_HERE') {
      throw new Error('Stripe price ID not configured. Please check your configuration.');
    }

    return createCheckoutSession({
      priceId: stripePriceId,
      mode: 'subscription',
    });
  }, [createCheckoutSession]);

  return {
    createCheckoutSession,
    createSubscription,
    isLoading,
    error,
  };
}