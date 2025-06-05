// components/SubscriptionPlans.jsx
import React, { useState } from 'react';
import { Heart, Check, Star, Map, Globe } from 'lucide-react';

const SubscriptionPlans = ({ user, onSubscribe }) => {
  const [loading, setLoading] = useState(null);

  const plans = [
    {
      id: 'free',
      name: 'Explorer',
      price: 0,
      interval: 'forever',
      features: [
        '5 map searches per day',
        'Basic location info',
        'Save up to 10 favorites',
        'Standard support'
      ],
      current: user?.subscription?.tier === 'free' || !user?.subscription
    },
    {
      id: 'pro',
      name: 'Adventurer',
      price: 9.99,
      interval: 'month',
      stripePriceId: 'price_pro_monthly', // Replace with your actual Stripe price ID
      features: [
        'Unlimited map searches',
        'Detailed location insights',
        'Unlimited favorites',
        'Offline map downloads',
        'Priority support',
        'Custom map themes'
      ],
      popular: true,
      current: user?.subscription?.tier === 'pro'
    },
    {
      id: 'premium',
      name: 'Navigator',
      price: 19.99,
      interval: 'month',
      stripePriceId: 'price_premium_monthly', // Replace with your actual Stripe price ID
      features: [
        'Everything in Adventurer',
        'Advanced analytics',
        'Team collaboration',
        'API access',
        'White-label options',
        'Dedicated support'
      ],
      current: user?.subscription?.tier === 'premium'
    }
  ];

  const handleSubscribe = async (plan) => {
    if (plan.id === 'free' || plan.current) return;
    
    setLoading(plan.id);
    try {
      await onSubscribe(plan);
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Adventure
        </h2>
        <p className="text-lg text-gray-600">
          Unlock the full potential of MapBreak with our flexible plans
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
              plan.popular
                ? 'border-blue-500 scale-105'
                : plan.current
                ? 'border-green-500'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  {plan.id === 'free' && <Map className="w-6 h-6 text-blue-600" />}
                  {plan.id === 'pro' && <Star className="w-6 h-6 text-blue-600" />}
                  {plan.id === 'premium' && <Globe className="w-6 h-6 text-blue-600" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600">/{plan.interval}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading === plan.id || plan.current}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  plan.current
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                } ${loading === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading === plan.id ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Processing...
                  </div>
                ) : plan.current ? (
                  'Current Plan'
                ) : plan.id === 'free' ? (
                  'Get Started'
                ) : (
                  `Subscribe to ${plan.name}`
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};