import { useState, useEffect } from 'react';

interface DebugInfoProps {
  showInProduction?: boolean;
}

export default function DebugInfo({ showInProduction = false }: DebugInfoProps) {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const collectDebugInfo = async () => {
      try {
        const info = {
          // Platform info
          isNative: window.Capacitor?.isNative || false,
          platform: window.Capacitor?.getPlatform() || 'web',
          
          // Environment variables
          envVars: {
            supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING',
            supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
            stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ID ? 'SET' : 'MISSING',
          },
          
          // Capacitor info
          capacitorAvailable: !!window.Capacitor,
          capacitorVersion: window.Capacitor?.version || 'Unknown',
          
          // Device info
          userAgent: navigator.userAgent,
          localStorage: typeof localStorage !== 'undefined',
          sessionStorage: typeof sessionStorage !== 'undefined',
          
          // URL info
          currentUrl: window.location.href,
          origin: window.location.origin,
          
          // Build info
          buildMode: process.env.NODE_ENV || 'unknown',
          timestamp: new Date().toISOString(),
        };

        // Try to get Capacitor device info if available
        if (window.Capacitor?.isNative) {
          try {
            const { Device } = await import('@capacitor/device');
            const deviceInfo = await Device.getInfo();
            info.deviceInfo = deviceInfo;
          } catch (e) {
            info.deviceError = e.message;
          }
        }

        setDebugInfo(info);
      } catch (err: any) {
        setError(err.message);
      }
    };

    collectDebugInfo();
  }, []);

  // Only show in development or if explicitly enabled
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-black/90 text-white text-xs p-3 rounded-lg max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-bold text-yellow-300">Debug Info</h4>
          <button
            onClick={() => setDebugInfo({})}
            className="text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
        
        {error && (
          <div className="text-red-400 mb-2">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div className="space-y-2">
          <div>
            <strong className="text-blue-300">Platform:</strong> {debugInfo.platform} 
            {debugInfo.isNative && <span className="text-green-400"> (Native)</span>}
          </div>
          
          <div>
            <strong className="text-blue-300">Environment Variables:</strong>
            <div className="ml-2">
              {debugInfo.envVars && Object.entries(debugInfo.envVars).map(([key, value]: [string, any]) => (
                <div key={key}>
                  {key}: <span className={value === 'SET' ? 'text-green-400' : 'text-red-400'}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <strong className="text-blue-300">Capacitor:</strong> {debugInfo.capacitorAvailable ? 'Available' : 'Not Available'}
          </div>
          
          <div>
            <strong className="text-blue-300">URL:</strong> {debugInfo.currentUrl}
          </div>
          
          {debugInfo.deviceInfo && (
            <div>
              <strong className="text-blue-300">Device:</strong>
              <div className="ml-2">
                <div>Platform: {debugInfo.deviceInfo.platform}</div>
                <div>Model: {debugInfo.deviceInfo.model}</div>
                <div>OS Version: {debugInfo.deviceInfo.osVersion}</div>
              </div>
            </div>
          )}
          
          {debugInfo.deviceError && (
            <div className="text-orange-400">
              <strong>Device Error:</strong> {debugInfo.deviceError}
            </div>
          )}
        </div>
        
        <button
          onClick={() => console.log('Full Debug Info:', debugInfo)}
          className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs"
        >
          Log Full Info
        </button>
      </div>
    </div>
  );
}