// hooks/useSubscription.ts
// Fixed version to prevent multiple subscription errors

import { useState, useEffect, useRef } from 'react';
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
  
  // Use refs to track subscription state and prevent multiple subscriptions
  const subscriptionChannelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

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

        const { data, error } = await supabase
          .from('stripe_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .in('subscription_status', ['active', 'trialing'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription:', error);
          setError(error.message);
        } else if (mounted) {
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

    // Set up real-time subscription only if not already subscribed
    const setupRealtimeSubscription = () => {
      // Cleanup existing subscription first
      if (subscriptionChannelRef.current) {
        console.log('🧹 Cleaning up existing subscription channel');
        subscriptionChannelRef.current.unsubscribe();
        subscriptionChannelRef.current = null;
        isSubscribedRef.current = false;
      }

      // Only create new subscription if user exists and we haven't already subscribed
      if (user && !isSubscribedRef.current) {
        console.log('🔄 Setting up subscription channel for user:', user.id);
        
        try {
          // Create a unique channel name to avoid conflicts
          const channelName = `subscription-changes-${user.id}-${Date.now()}`;
          
          subscriptionChannelRef.current = supabase
            .channel(channelName)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'stripe_subscriptions',
                filter: `user_id=eq.${user.id}`,
              },
              (payload) => {
                console.log('📡 Subscription changed:', payload);
                
                if (!mounted) return;
                
                if (payload.eventType === 'DELETE') {
                  setSubscription({
                    id: 'free',
                    user_id: user.id,
                    customer_id: '',
                    subscription_status: 'free',
                  });
                } else if (payload.new) {
                  const newSubscription = payload.new as Subscription;
                  if (['active', 'trialing'].includes(newSubscription.subscription_status)) {
                    setSubscription(newSubscription);
                  }
                }
              }
            )
            .subscribe((status) => {
              console.log('📡 Subscription status:', status);
              if (status === 'SUBSCRIBED') {
                isSubscribedRef.current = true;
                console.log('✅ Successfully subscribed to subscription changes');
              } else if (status === 'CHANNEL_ERROR') {
                console.error('❌ Error subscribing to subscription changes');
                isSubscribedRef.current = false;
              }
            });
            
        } catch (error) {
          console.error('❌ Error setting up realtime subscription:', error);
        }
      }
    };

    // Fetch initial subscription data
    fetchSubscription().then(() => {
      if (mounted) {
        setupRealtimeSubscription();
      }
    });

    return () => {
      mounted = false;
      
      // Cleanup subscription
      if (subscriptionChannelRef.current) {
        console.log('🧹 Cleaning up subscription channel on unmount');
        subscriptionChannelRef.current.unsubscribe();
        subscriptionChannelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [user?.id, supabase]); // Only depend on user ID to prevent unnecessary re-subscriptions

  // Helper computed values
  const isSubscribed = subscription?.subscription_status === 'active';
  const isTrialing = subscription?.subscription_status === 'trialing';
  const isPastDue = subscription?.subscription_status === 'past_due';
  const isCanceled = subscription?.subscription_status === 'canceled';
  const isFree = subscription?.subscription_status === 'free' || !subscription;

  // Determine if it's yearly or monthly (for display purposes)
  const getSubscriptionInterval = () => {
    if (!subscription?.stripe_price_id) return null;
    
    const monthlyPriceId = import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY;
    const yearlyPriceId = import.meta.env.VITE_STRIPE_PRICE_ID_YEARLY;
    
    if (subscription.stripe_price_id === yearlyPriceId) return 'yearly';
    if (subscription.stripe_price_id === monthlyPriceId) return 'monthly';
    
    return 'monthly'; // Default fallback
  };

  // Simplified: only two tiers - free vs pro (both monthly and yearly are "pro")
  const getSubscriptionTier = () => {
    return (isSubscribed || isTrialing) ? 'pro' : 'free';
  };

  // Get subscription limits - same for both monthly and yearly
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
    };

    return limits[tier];
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
    getSubscriptionInterval,
    
    // Convenience boolean
    hasActiveSubscription: isSubscribed || isTrialing,
  };
}