import { X } from 'lucide-react';
import { useStripe } from '../hooks/useStripe';
import { useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { useNavigate } from 'react-router-dom';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const { createCheckoutSession, isLoading } = useStripe();
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useSupabase();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    try {
      setError(null);
      
      // Check session before proceeding
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        onClose(); // Close the modal before navigation
        navigate('/login', { 
          state: { returnTo: window.location.pathname } 
        });
        return;
      }

      // Get price ID from environment variable
      const priceId = import.meta.env.VITE_STRIPE_PRICE_ID;
      
      if (!priceId) {
        setError('Subscription not configured. Please contact support.');
        console.error('VITE_STRIPE_PRICE_ID not found in environment variables');
        return;
      }

      // Use your existing createCheckoutSession function
      await createCheckoutSession({
        priceId: priceId,
        mode: 'subscription',
      });
      
    } catch (err: any) {
      setError(err.message);
      console.error('Subscription error:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[60] pt-safe pl-safe pr-safe pb-safe">
      <div className="h-full flex flex-col px-4">
        <button
          onClick={onClose}
          className="absolute top-safe right-safe p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="max-w-md w-full mx-auto mt-16">
          <h3 className="text-3xl font-bold text-slate dark:text-white mb-4">
            Unlock All Features
          </h3>
          <p className="text-slate/80 dark:text-gray-300 mb-8">
            Subscribe to access favorites and save your preferred locations.
          </p>
          
          <div className="space-y-6">
            <div className="border border-slate/20 dark:border-gray-600 rounded-lg p-6">
              <h4 className="font-semibold text-xl mb-4 text-slate dark:text-white">What you'll get:</h4>
              <ul className="text-left space-y-4">
                <li className="flex items-center text-slate/80 dark:text-gray-300">
                  <span className="text-sage mr-3 text-xl">✓</span>
                  Save unlimited favorite locations
                </li>
                <li className="flex items-center text-slate/80 dark:text-gray-300">
                  <span className="text-sage mr-3 text-xl">✓</span>
                  Sync across devices
                </li>
                <li className="flex items-center text-slate/80 dark:text-gray-300">
                  <span className="text-sage mr-3 text-xl">✓</span>
                  Premium support
                </li>
                <li className="flex items-center text-slate/80 dark:text-gray-300">
                  <span className="text-sage mr-3 text-xl">✓</span>
                  Early access to new features
                </li>
              </ul>
            </div>
            
            {error && (
              <div className="text-red-600 bg-red-50 dark:bg-red-900/50 dark:text-red-400 p-4 rounded-lg text-sm border border-red-200 dark:border-red-700">
                <div className="flex items-start">
                  <span className="mr-2 flex-shrink-0">⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}
            
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-terra text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-terra/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terra disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Processing...' : 'Subscribe Now'}
            </button>
            
            {/* Optional: Add pricing info */}
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cancel anytime. No commitment required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}