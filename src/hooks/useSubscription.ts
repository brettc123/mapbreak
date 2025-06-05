// hooks/useSubscription.ts
// Updated to work with your existing table structure

import { useState, useEffect } from 'react';
import { useSupabase } from './useSupabase';

interface Subscription {
  id: string;
  user_id: string;
  customer_id: string;
  stripe_subscription_id?: string;
  stripe_price_id?: string;
  product_id?: string;
  subscription_status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid' | 'free';
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  created_at?: string;
  updated_at?: string;
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

        // Query your stripe_subscriptions table with user_id
        const { data, error } = await supabase
          .from('stripe_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .in('subscription_status', ['active', 'trialing']) // Only get active subscriptions
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error fetching subscription:', error);
          setError(error.message);
        } else if (mounted) {
          // If no active subscription found, create a "free" subscription object
          if (!data) {
            setSubscription({
              id: 'free',
              user_id: user.id,
              customer_id: '',
              subscription_status: 'free',
            });
          } else {
            setSubscription(data);
          }
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
            // If subscription deleted, set to free
            setSubscription({
              id: 'free',
              user_id: user?.id || '',
              customer_id: '',
              subscription_status: 'free',
            });
          } else if (payload.new) {
            const newSubscription = payload.new as Subscription;
            // Only update if it's an active subscription
            if (['active', 'trialing'].includes(newSubscription.subscription_status)) {
              setSubscription(newSubscription);
            }
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      subscriptionChannel.unsubscribe();
    };
  }, [user, supabase]);

  // Helper computed values
  const isSubscribed = subscription?.subscription_status === 'active';
  const isTrialing = subscription?.subscription_status === 'trialing';
  const isPastDue = subscription?.subscription_status === 'past_due';
  const isCanceled = subscription?.subscription_status === 'canceled';
  const isFree = subscription?.subscription_status === 'free' || !subscription;

  // Determine subscription tier
  const getSubscriptionTier = () => {
    if (!subscription || subscription.subscription_status === 'free') {
      return 'free';
    }
    
    // You can determine tier based on price_id if needed
    if (subscription.stripe_price_id === process.env.VITE_STRIPE_PRICE_ID_PRO) {
      return 'pro';
    }
    
    if (subscription.stripe_price_id === process.env.VITE_STRIPE_PRICE_ID_PREMIUM) {
      return 'premium';
    }
    
    // Default to pro for any paid subscription
    return isSubscribed || isTrialing ? 'pro' : 'free';
  };

  // Get subscription limits based on tier
  const getSubscriptionLimits = () => {
    const tier = getSubscriptionTier();
    
    const limits = {
      free: {
        dailySearches: 5,
        maxFavorites: 10,
        canDownload: false,
        hasAds: true,
      },
      pro: {
        dailySearches: Infinity,
        maxFavorites: Infinity,
        canDownload: true,
        hasAds: false,
      },
      premium: {
        dailySearches: Infinity,
        maxFavorites: Infinity,
        canDownload: true,
        hasAds: false,
        advancedFeatures: true,
      },
    };

    return limits[tier] || limits.free;
  };

  return {
    subscription,
    loading,
    error,
    
    // Status booleans
    isSubscribed,
    isTrialing,
    isPastDue,
    isCanceled,
    isFree,
    
    // Helper functions
    getSubscriptionTier,
    getSubscriptionLimits,
    
    // Convenience boolean
    hasActiveSubscription: isSubscribed || isTrialing,
  };
}