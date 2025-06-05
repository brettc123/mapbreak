// src/config/mobile.ts
// Centralized configuration for mobile environment

export const MOBILE_CONFIG = {
  // Your actual values
  SUPABASE_URL: 'https://lsejipfazdixicnfkubm.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZWppcGZhemRpeGljbmZrdWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MzQ4MjUsImV4cCI6MjA2MjIxMDgyNX0.fNSxCLRAhHmgkm4jF3OGpOyaxflrAXxd-0_OBctFlLo',
  STRIPE_PRICE_ID: 'price_1RMAnbKj65mpBHZmbnBIBu1N',
  STRIPE_PRICE_ID_MONTHLY: 'price_1RMAnbKj65mpBHZmbnBIBu1N',
  STRIPE_PRICE_ID_YEARLY: 'prod_SRcj6KwfVkOVHS',
  APP_DOMAIN: 'https://dailymapbreak.com',
};

// Function to get environment variables with fallback
export const getEnvVar = (key: keyof typeof MOBILE_CONFIG, envKey: string) => {
  // Try to get from import.meta.env first (web)
  const envValue = import.meta.env[envKey];
  
  if (envValue) {
    return envValue;
  }
  
  // Fallback to mobile config
  const mobileValue = MOBILE_CONFIG[key];
  
  if (!mobileValue || mobileValue.startsWith('YOUR_')) {
    console.error(`❌ Missing configuration for ${key}. Please update mobile.ts`);
    return null;
  }
  
  return mobileValue;
};

// Specific getters for each config value
export const getSupabaseUrl = () => getEnvVar('SUPABASE_URL', 'VITE_SUPABASE_URL');
export const getSupabaseAnonKey = () => getEnvVar('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');
export const getStripePriceId = () => getEnvVar('STRIPE_PRICE_ID', 'VITE_STRIPE_PRICE_ID');
export const getStripePriceIdMonthly = () => getEnvVar('STRIPE_PRICE_ID_MONTHLY', 'VITE_STRIPE_PRICE_ID_MONTHLY');
export const getStripePriceIdYearly = () => getEnvVar('STRIPE_PRICE_ID_YEARLY', 'VITE_STRIPE_PRICE_ID_YEARLY');
export const getAppDomain = () => getEnvVar('APP_DOMAIN', 'VITE_APP_DOMAIN');