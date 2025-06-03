import { Globe2 } from 'lucide-react';

export default function SplashScreen() {
  console.log('🎬 SplashScreen component rendering');
  
  // Set background temporarily without useEffect to avoid React hook errors
  if (typeof document !== 'undefined') {
    document.body.style.backgroundColor = 'rgb(224, 122, 95)';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.backgroundColor = 'rgb(224, 122, 95)';
    
    // IMPORTANT: Clean up when component unmounts by setting a cleanup timer
    setTimeout(() => {
      // Reset backgrounds after splash screen duration
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
      document.body.style.overflow = '';
    }, 2500); // Slightly longer than splash duration to ensure cleanup
  }
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgb(224, 122, 95)',
        zIndex: 999999,
        margin: 0,
        padding: 0,
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        maxWidth: 'none',
        maxHeight: 'none',
        overflow: 'hidden',
        display: 'block'
      }}
    >
      {/* Content */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          color: 'white',
          textAlign: 'center',
          padding: '20px',
          boxSizing: 'border-box'
        }}
      >
        {/* Main globe with pulse animation */}
        <div style={{ position: 'relative', marginBottom: '40px' }}>
          {/* Globe icon */}
          <Globe2 
            style={{
              width: '80px',
              height: '80px',
              color: 'white',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
              animation: 'pulse 2s ease-in-out infinite'
            }}
          />
        </div>
        
        {/* MAPBREAK title */}
        <h1 
          style={{
            fontSize: 'clamp(3rem, 8vw, 5rem)',
           // fontWeight: 'bold',
           // letterSpacing: '0.05em',
            marginBottom: '16px',
            color: 'white',
            fontFamily: '"Sherman", "Cal Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
           // textShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}
        >
          MAPBREAK
        </h1>
        
        {/* Subtitle */}
        <p 
          style={{
            fontSize: 'clamp(1rem, 4vw, 1.5rem)',
            opacity: 0.9,
            fontWeight: '300',
            letterSpacing: '0.025em',
            color: 'white',
            marginBottom: '60px',
           // textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            fontFamily: '"Sherman", "Cal Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          }}
        >
          Your daily detour
        </p>
        
        {/* Loading dots */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: 'white',
                borderRadius: '50%',
                animation: `bounce 1.4s infinite`,
                animationDelay: `${i * 0.2}s`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            />
          ))}
        </div>

        {/* Bottom loading message */}
        <div 
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '12px',
            background: 'rgba(0,0,0,0.5)',
            padding: '8px 12px',
            borderRadius: '15px',
            color: 'white',
            fontFamily: '"Sherman", "Cal Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          }}
        >
          🚀 Loading your daily map...
        </div>
      </div>

      {/* Inline CSS for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
          40%, 43% { transform: translateY(-8px); }
          70% { transform: translateY(-4px); }
          90% { transform: translateY(-2px); }
        }
      `}} />
    </div>
  );
}