import { STRIPE_PRODUCTS } from '../stripe-config';
import { useStripe } from '../hooks/useStripe';
import { useSubscription } from '../hooks/useSubscription';

export default function SubscriptionButton() {
  const { createCheckoutSession, isLoading, error } = useStripe();
  const { subscription } = useSubscription();

  const handleSubscribe = async () => {
    await createCheckoutSession({
      priceId: STRIPE_PRODUCTS.MAPBREAK_SUBSCRIPTION.priceId,
      mode: 'subscription',
    });
  };

  if (subscription?.subscription_status === 'active') {
    return (
      <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600">
        Active Subscription
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleSubscribe}
        disabled={isLoading}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Subscribe Now'}
      </button>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </>
  );
}