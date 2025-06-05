import { X, Check, Star, Map, Globe } from 'lucide-react';
import { useStripe } from '../hooks/useStripe';
import { useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { useNavigate } from 'react-router-dom';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'favorites' | 'search' | 'general';
}

// Add your actual Stripe price IDs here
const SUBSCRIPTION_PLANS = {
  pro: {
    id: 'pro',
    name: 'Explorer Pro',
    price: 4.99,
    interval: 'month',
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ID_PRO || 'price_pro_monthly',
    features: [
      'Unlimited favorite maps',
      'Sync across all devices',
      'Priority customer support',
      'Early access to new features',
      'Ad-free experience'
    ],
    popular: true
  },
  premium: {
    id: 'premium', 
    name: 'Explorer Premium',
    price: 9.99,
    interval: 'month',
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ID_PREMIUM || 'price_premium_monthly',
    features: [
      'Everything in Pro',
      'Offline map downloads',
      'Custom map collections',
      'Advanced search filters',
      'Export map data',
      'Premium map themes'
    ]
  }
};

export default function PaywallModal({ isOpen, onClose, trigger = 'general' }: PaywallModalProps) {
  const { createCheckoutSession, isLoading } = useStripe();
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'premium'>('pro');
  const { supabase } = useSupabase();
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Contextual messaging based on what triggered the paywall
  const getTriggerContent = () => {
    switch (trigger) {
      case 'favorites':
        return {
          title: 'Unlock Unlimited Favorites',
          description: 'Save as many maps as you want and access them anywhere!',
          urgency: "You've reached your free favorite limit"
        };
      case 'search':
        return {
          title: 'Search Without Limits',
          description: 'Get unlimited searches and discover amazing places!',
          urgency: "You've reached your daily search limit"
        };
      default:
        return {
          title: 'Unlock All Premium Features',
          description: 'Take your map exploration to the next level!',
          urgency: 'Upgrade to access premium features'
        };
    }
  };

  const triggerContent = getTriggerContent();

  const handleSubscribe = async (planId: 'pro' | 'premium') => {
    try {
      setError(null);
      
      // Check session before proceeding
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        onClose();
        navigate('/login', { 
          state: { returnTo: window.location.pathname } 
        });
        return;
      }

      const plan = SUBSCRIPTION_PLANS[planId];
      
      if (!plan.stripePriceId) {
        setError('Subscription not configured. Please contact support.');
        console.error(`Stripe price ID not found for plan: ${planId}`);
        return;
      }

      await createCheckoutSession({
        priceId: plan.stripePriceId,
        mode: 'subscription',
      });
      
    } catch (err: any) {
      setError(err.message);
      console.error('Subscription error:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate dark:text-white">
              {triggerContent.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {triggerContent.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Urgency Banner */}
        <div className="px-6 py-3 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-700">
          <p className="text-orange-800 dark:text-orange-300 text-sm font-medium text-center">
            ⚡ {triggerContent.urgency}
          </p>
        </div>

        {/* Plan Selection */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
              <div
                key={key}
                className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  selectedPlan === key
                    ? 'border-terra bg-terra/5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-terra/50'
                } ${plan.popular ? 'ring-2 ring-terra ring-opacity-50' : ''}`}
                onClick={() => setSelectedPlan(key as 'pro' | 'premium')}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-terra text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-terra/10 rounded-lg mb-3">
                    {key === 'pro' ? (
                      <Map className="w-6 h-6 text-terra" />
                    ) : (
                      <Globe className="w-6 h-6 text-terra" />
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h4>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      /{plan.interval}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Selection Indicator */}
                <div className="flex items-center justify-center">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedPlan === key
                      ? 'bg-terra border-terra'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedPlan === key && (
                      <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-start">
                <span className="text-red-500 mr-2 flex-shrink-0">⚠️</span>
                <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={() => handleSubscribe(selectedPlan)}
              disabled={isLoading}
              className="flex-2 py-3 px-6 bg-terra text-white rounded-lg hover:bg-terra/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Subscribe to ${SUBSCRIPTION_PLANS[selectedPlan].name}`
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Cancel anytime. No commitment required.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              By subscribing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}