import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from './useSupabase';

export function useStripe() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useSupabase();
  const navigate = useNavigate();

  const createCheckoutSession = useCallback(
    async ({
      priceId,
      mode,
      successUrl = window.location.origin + '/success',
      cancelUrl = window.location.origin + '/cancel',
    }: {
      priceId: string;
      mode: 'payment' | 'subscription';
      successUrl?: string;
      cancelUrl?: string;
    }) => {
      try {
        setIsLoading(true);
        setError(null);

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
          navigate('/login');
          throw new Error('Please log in to continue.');
        }

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            price_id: priceId,
            success_url: successUrl,
            cancel_url: cancelUrl,
            mode,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.error || 'Failed to create checkout session';
          console.error('Checkout error details:', data);
          throw new Error(errorMessage);
        }

        if (!data.url) {
          throw new Error('No checkout URL received from the server');
        }

        window.location.href = data.url;
      } catch (err: any) {
        console.error('Checkout error:', err);
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, navigate],
  );

  // Add a helper function for the subscription flow
  const createSubscription = useCallback(async () => {
    const priceId = import.meta.env.VITE_STRIPE_PRICE_ID;
    
    if (!priceId) {
      throw new Error('Stripe price ID not configured. Please add VITE_STRIPE_PRICE_ID to your environment variables.');
    }

    return createCheckoutSession({
      priceId,
      mode: 'subscription',
    });
  }, [createCheckoutSession]);

  return {
    createCheckoutSession,
    createSubscription, // Easy helper for your paywall
    isLoading,
    error,
  };
}