import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Subscription {
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function getSubscription() {
      try {
        setIsLoading(true);
        setError(null);

        // Check if user is authenticated first
        const { data: authData } = await supabase.auth.getUser();
        
        if (!authData?.user) {
          // No authenticated user, so no subscription
          setSubscription(null);
          setIsLoading(false);
          return;
        }

        const { data, error: subscriptionError } = await supabase
          .from('stripe_subscriptions')
          .select('*')
          .eq('user_id', authData.user.id)
          .maybeSingle();

        if (subscriptionError) {
          // Handle network errors differently
          if (subscriptionError.message?.includes('network') || 
              subscriptionError.message?.includes('Failed to fetch') ||
              !navigator.onLine) {
            
            console.warn('Network error fetching subscription, will retry:', subscriptionError);
            
            // Don't set error for network issues, just leave loading state
            // and retry a few times
            if (retryCount < 3) {
              setTimeout(() => {
                setRetryCount(prev => prev + 1);
              }, 2000); // Wait 2 seconds before retry
              return;
            } else {
              // After retries, just continue with null subscription
              console.warn('Network error persisted after retries, continuing with null subscription');
              setSubscription(null);
            }
          } else {
            // For other errors, log and set the error state
            console.error('Subscription error:', subscriptionError);
            setError(subscriptionError.message);
          }
        } else {
          // Success
          setSubscription(data);
        }
      } catch (err: any) {
        console.error('Error fetching subscription:', err);
        setError(err.message || 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    getSubscription();
  }, [retryCount]);  // Depend on retryCount to trigger retries

  return {
    subscription,
    isLoading,
    error,
  };
}