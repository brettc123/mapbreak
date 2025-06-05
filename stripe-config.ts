// stripe-config.ts
export const STRIPE_PRODUCTS = {
  MAPBREAK_SUBSCRIPTION: {
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID || 'price_1234567890', // Replace with your actual Stripe price ID
    productId: import.meta.env.VITE_STRIPE_PRODUCT_ID || 'prod_1234567890', // Replace with your actual Stripe product ID
    name: 'MapBreak Premium',
    description: 'Unlimited favorites and premium features',
    price: '$4.99/month', // Update this to match your actual pricing
    features: [
      'Unlimited favorite maps',
      'Sync across devices', 
      'Premium support',
      'Early access to new features'
    ]
  }
};

// For development/testing, you might want to use test price IDs
export const STRIPE_TEST_PRODUCTS = {
  MAPBREAK_SUBSCRIPTION: {
    priceId: 'price_test_1234567890', // Your test price ID
    productId: 'prod_test_1234567890', // Your test product ID
    name: 'MapBreak Premium (Test)',
    description: 'Unlimited favorites and premium features (Test Mode)',
    price: '$4.99/month',
    features: [
      'Unlimited favorite maps',
      'Sync across devices', 
      'Premium support',
      'Early access to new features'
    ]
  }
};

// Use test products in development
export const CURRENT_PRODUCTS = import.meta.env.DEV 
  ? STRIPE_TEST_PRODUCTS 
  : STRIPE_PRODUCTS;