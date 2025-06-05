// hooks/useSubscription.ts
import { useState, useEffect } from 'react';
import { useSupabase } from './useSupabase';

interface Subscription {
  id: string;
  subscription_status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  customer_id: string;
  price_id: string;
  product_id: string;
}

export function useSubscription() {
  const { user, supabase } = useSupabase();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchSubscription = async () => {
      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Query your stripe_subscriptions table  
        const { data, error } = await supabase
          .from('stripe_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('subscription_status', 'active')
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error fetching subscription:', error);
          setError(error.message);
        } else if (mounted) {
          setSubscription(data);
        }
      } catch (err: any) {
        console.error('Error in fetchSubscription:', err);
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchSubscription();

    // Set up real-time subscription to changes
    const subscriptionChannel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stripe_subscriptions',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          console.log('Subscription changed:', payload);
          
          if (payload.eventType === 'DELETE') {
            setSubscription(null);
          } else if (payload.new) {
            setSubscription(payload.new as Subscription);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      subscriptionChannel.unsubscribe();
    };
  }, [user, supabase]);

  const isSubscribed = subscription?.subscription_status === 'active';
  const isTrialing = subscription?.subscription_status === 'trialing';
  const isPastDue = subscription?.subscription_status === 'past_due';
  const isCanceled = subscription?.subscription_status === 'canceled';

  return {
    subscription,
    loading,
    error,
    isSubscribed,
    isTrialing,
    isPastDue,
    isCanceled,
    hasActiveSubscription: isSubscribed || isTrialing,
  };
}