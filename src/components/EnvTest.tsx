import { useState, useEffect } from 'react';

export default function EnvTest() {
  const [envStatus, setEnvStatus] = useState<any>({});

  useEffect(() => {
    const checkEnv = () => {
      const status = {
        platform: window.Capacitor?.isNative ? 'Mobile' : 'Web',
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING',
        supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
        stripeMonthly: import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY ? 'SET' : 'MISSING',
        stripeYearly: import.meta.env.VITE_STRIPE_PRICE_ID_YEARLY ? 'SET' : 'MISSING',
        capacitorAvailable: !!window.Capacitor,
        currentUrl: window.location.href,
        userAgent: navigator.userAgent.substring(0, 50) + '...',
      };
      
      console.log('Environment Check:', status);
      setEnvStatus(status);
    };

    checkEnv();
  }, []);

  return (
    <div className="fixed top-4 left-4 bg-black/90 text-white p-4 rounded text-xs max-w-sm z-50">
      <h4 className="font-bold text-yellow-300 mb-2">Environment Test</h4>
      <div className="space-y-1">
        <div>Platform: <span className="text-blue-300">{envStatus.platform}</span></div>
        <div>Supabase URL: <span className={envStatus.supabaseUrl === 'SET' ? 'text-green-400' : 'text-red-400'}>{envStatus.supabaseUrl}</span></div>
        <div>Supabase Key: <span className={envStatus.supabaseKey === 'SET' ? 'text-green-400' : 'text-red-400'}>{envStatus.supabaseKey}</span></div>
        <div>Stripe Monthly: <span className={envStatus.stripeMonthly === 'SET' ? 'text-green-400' : 'text-red-400'}>{envStatus.stripeMonthly}</span></div>
        <div>Stripe Yearly: <span className={envStatus.stripeYearly === 'SET' ? 'text-green-400' : 'text-red-400'}>{envStatus.stripeYearly}</span></div>
        <div>Capacitor: <span className={envStatus.capacitorAvailable ? 'text-green-400' : 'text-red-400'}>{envStatus.capacitorAvailable ? 'Available' : 'Not Available'}</span></div>
        <div>URL: <span className="text-gray-300">{envStatus.currentUrl}</span></div>
      </div>
      
      <button 
        onClick={() => console.log('Full env check:', envStatus)}
        className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs"
      >
        Log to Console
      </button>
    </div>
  );
}