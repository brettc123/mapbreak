import { useState, useEffect } from 'react';

export default function SimpleTestLogin() {
  const [testInfo, setTestInfo] = useState('');

  useEffect(() => {
    console.log('🔍 SimpleTestLogin mounted');
    setTestInfo('Component mounted successfully!');
  }, []);

  const styles = {
    container: {
      // Fixed for iOS - use viewport units and proper safe area
      minHeight: '100vh',
      minWidth: '100vw',
      backgroundColor: '#f0f0f0',
      paddingTop: 'env(safe-area-inset-top, 20px)',
      paddingBottom: 'env(safe-area-inset-bottom, 20px)',
      paddingLeft: 'env(safe-area-inset-left, 20px)',
      paddingRight: 'env(safe-area-inset-right, 20px)',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#333',
      overflow: 'auto',
      boxSizing: 'border-box' as const,
    },
    header: {
      backgroundColor: '#007acc',
      color: 'white',
      padding: '20px',
      textAlign: 'center' as const,
      marginBottom: '20px',
      borderRadius: '8px',
      fontSize: '18px',
      fontWeight: 'bold',
    },
    content: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #ddd',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    button: {
      backgroundColor: '#007acc',
      color: 'white',
      padding: '15px 25px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      cursor: 'pointer',
      marginRight: '10px',
      marginBottom: '15px',
      display: 'inline-block',
      minWidth: '120px',
      fontWeight: 'bold',
    },
    input: {
      width: '100%',
      padding: '15px',
      marginBottom: '15px',
      border: '2px solid #ddd',
      borderRadius: '8px',
      fontSize: '16px',
      boxSizing: 'border-box' as const,
    },
    debug: {
      backgroundColor: '#fffacd',
      padding: '15px',
      borderRadius: '8px',
      border: '2px solid #ffd700',
      marginBottom: '20px',
      fontSize: '14px',
      fontFamily: 'monospace',
      lineHeight: '1.5',
    }
  };

  const debugInfo = {
    platform: window.Capacitor?.isNative ? 'Mobile' : 'Web',
    capacitor: !!window.Capacitor,
    userAgent: navigator.userAgent.substring(0, 60) + '...',
    url: window.location.href,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height
    },
    safeArea: {
      top: getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)') || 'unknown',
      bottom: getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)') || 'unknown'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>🚀 Simple Test Login</div>
        <div style={{fontSize: '14px', marginTop: '8px'}}>Testing iOS Layout Fix</div>
      </div>

      <div style={styles.debug}>
        <h3 style={{margin: '0 0 10px 0', fontSize: '16px'}}>🔍 Debug Info:</h3>
        <div style={{marginBottom: '5px'}}><strong>Platform:</strong> {debugInfo.platform}</div>
        <div style={{marginBottom: '5px'}}><strong>Capacitor:</strong> {debugInfo.capacitor ? 'Available' : 'Not Available'}</div>
        <div style={{marginBottom: '5px'}}><strong>Viewport:</strong> {debugInfo.viewport.width} x {debugInfo.viewport.height}</div>
        <div style={{marginBottom: '5px'}}><strong>Screen:</strong> {debugInfo.screen.width} x {debugInfo.screen.height}</div>
        <div style={{marginBottom: '5px'}}><strong>Test Info:</strong> {testInfo}</div>
        <div style={{marginBottom: '5px'}}><strong>URL:</strong> {debugInfo.url.substring(0, 40)}...</div>
      </div>

      <div style={styles.content}>
        <h2 style={{margin: '0 0 15px 0', fontSize: '18px'}}>📧 Email Login Test</h2>
        <input 
          style={styles.input}
          type="email" 
          placeholder="Email address"
        />
        <input 
          style={styles.input}
          type="password" 
          placeholder="Password"
        />
        <button 
          style={styles.button}
          onClick={() => {
            console.log('🔍 Email button clicked!');
            alert('Email button works! UI is rendering correctly.');
          }}
        >
          Test Email Sign In
        </button>
      </div>

      <div style={styles.content}>
        <h2 style={{margin: '0 0 15px 0', fontSize: '18px'}}>🔗 OAuth Test Buttons</h2>
        <div style={{marginBottom: '10px'}}>
          <button 
            style={{...styles.button, backgroundColor: '#db4437'}}
            onClick={() => {
              console.log('🔍 Google button clicked');
              alert('Google button clicked!');
            }}
          >
            Google Test
          </button>
        </div>
        <div style={{marginBottom: '10px'}}>
          <button 
            style={{...styles.button, backgroundColor: '#4267B2'}}
            onClick={() => {
              console.log('🔍 Facebook button clicked');
              alert('Facebook button clicked!');
            }}
          >
            Facebook Test
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <h2 style={{margin: '0 0 15px 0', fontSize: '18px'}}>📱 iOS Layout Test</h2>
        <div style={{lineHeight: '1.6', marginBottom: '15px'}}>
          <div>✅ You can see this = React works</div>
          <div>✅ Blue header = Inline styles work</div>
          <div>✅ This content = Layout is fixed</div>
        </div>
        
        <button 
          style={{...styles.button, backgroundColor: '#28a745'}}
          onClick={() => {
            console.log('🔍 Full debug info:', debugInfo);
            const message = `Platform: ${debugInfo.platform}\nViewport: ${debugInfo.viewport.width}x${debugInfo.viewport.height}\nCapacitor: ${debugInfo.capacitor}`;
            alert(message);
          }}
        >
          Show Debug Alert
        </button>
      </div>

      <div style={styles.content}>
        <h2 style={{margin: '0 0 15px 0', fontSize: '18px'}}>🎯 Next Steps</h2>
        <div style={{lineHeight: '1.6'}}>
          <div style={{marginBottom: '10px'}}>If you can see all this content:</div>
          <div style={{marginBottom: '8px'}}>1. ✅ React rendering works fine</div>
          <div style={{marginBottom: '8px'}}>2. ✅ iOS layout issues resolved</div>
          <div style={{marginBottom: '8px'}}>3. ❌ Original issue = Tailwind CSS</div>
          <div style={{marginBottom: '15px'}}>4. 🔧 Need to fix Tailwind for mobile</div>
        </div>
      </div>

      {/* Extra padding for safe scrolling */}
      <div style={{height: '50px'}}></div>
    </div>
  );
}