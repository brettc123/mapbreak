import { X, Check, Star, Map, Zap, Heart } from 'lucide-react';
import { useStripe } from '../hooks/useStripe';
import { useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { useNavigate } from 'react-router-dom';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'favorites' | 'search' | 'general';
}

// Simplified pricing with monthly/yearly options
const PRICING_CONFIG = {
  monthly: {
    price: 4.99,
    interval: 'month',
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY || 'price_monthly',
    popular: false,
  },
  yearly: {
    price: 49.99, // $4.16/month = 16% savings
    interval: 'year',
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ID_YEARLY || 'price_yearly',
    popular: true,
    savings: 'Save 16%',
    monthlyEquivalent: 4.16,
  }
};

const FEATURES = [
  'Unlimited favorite maps',
  'Unlimited daily searches', 
  'Sync across all devices',
  'Ad-free experience',
  'Priority customer support',
  'Early access to new features'
];

export default function PaywallModal({ isOpen, onClose, trigger = 'general' }: PaywallModalProps) {
  const { createCheckoutSession, isLoading } = useStripe();
  const [error, setError] = useState<string | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<'monthly' | 'yearly'>('yearly'); // Default to yearly
  const { supabase } = useSupabase();
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Contextual messaging based on what triggered the paywall
  const getTriggerContent = () => {
    switch (trigger) {
      case 'favorites':
        return {
          icon: <Heart className="h-8 w-8 text-red-500" />,
          title: 'Unlock Unlimited Favorites',
          description: 'Save as many maps as you want and access them anywhere!',
          urgency: "You've reached your free favorite limit (10 maps)"
        };
      case 'search':
        return {
          icon: <Zap className="h-8 w-8 text-blue-500" />,
          title: 'Search Without Limits',
          description: 'Get unlimited searches and discover amazing places!',
          urgency: "You've reached your daily search limit (5 searches)"
        };
      default:
        return {
          icon: <Star className="h-8 w-8 text-yellow-500" />,
          title: 'Unlock MapBreak Pro',
          description: 'Get unlimited access to all premium features!',
          urgency: 'Upgrade to access premium features'
        };
    }
  };

  const triggerContent = getTriggerContent();
  const selectedPricing = PRICING_CONFIG[selectedInterval];

  const handleSubscribe = async () => {
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

      if (!selectedPricing.stripePriceId) {
        setError('Subscription not configured. Please contact support.');
        console.error(`Stripe price ID not found for: ${selectedInterval}`);
        return;
      }

      await createCheckoutSession({
        priceId: selectedPricing.stripePriceId,
        mode: 'subscription',
      });
      
    } catch (err: any) {
      setError(err.message);
      console.error('Subscription error:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {triggerContent.icon}
              <div className="ml-3">
                <h3 className="text-xl font-bold text-slate dark:text-white">
                  {triggerContent.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {triggerContent.description}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Urgency Banner */}
        <div className="px-6 py-3 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-700">
          <p className="text-orange-800 dark:text-orange-300 text-sm font-medium text-center">
            ⚡ {triggerContent.urgency}
          </p>
        </div>

        <div className="p-6">
          {/* Pricing Toggle */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
              Choose Your Plan
            </h4>
            
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
              <button
                onClick={() => setSelectedInterval('monthly')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                  selectedInterval === 'monthly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedInterval('yearly')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all relative ${
                  selectedInterval === 'yearly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Yearly
                {PRICING_CONFIG.yearly.savings && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                    {PRICING_CONFIG.yearly.savings}
                  </span>
                )}
              </button>
            </div>

            {/* Pricing Display */}
            <div className="text-center mb-6 p-6 bg-gradient-to-br from-terra/5 to-compass-100/5 dark:from-terra/10 dark:to-compass-700/10 rounded-xl border border-terra/20">
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                ${selectedPricing.price}
                <span className="text-xl font-normal text-gray-600 dark:text-gray-400">
                  /{selectedPricing.interval}
                </span>
              </div>
              
              {selectedInterval === 'yearly' && (
                <div className="mt-2 space-y-1">
                  <div className="text-green-600 dark:text-green-400 font-medium">
                    {PRICING_CONFIG.yearly.savings} • Only ${PRICING_CONFIG.yearly.monthlyEquivalent}/month
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    vs ${PRICING_CONFIG.monthly.price}/month if paid monthly
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Features List */}
          <div className="mb-8">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-4">
              Everything included:
            </h5>
            <div className="space-y-3">
              {FEATURES.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-start">
                <span className="text-red-500 mr-2 flex-shrink-0">⚠️</span>
                <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="flex-2 py-3 px-6 bg-terra text-white rounded-lg hover:bg-terra/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Start Pro ${selectedInterval === 'yearly' ? 'Yearly' : 'Monthly'}`
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Cancel anytime. No commitment required.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By subscribing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}