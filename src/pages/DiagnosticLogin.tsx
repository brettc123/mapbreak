import { useEffect, useState } from 'react';

export default function DiagnosticLogin() {
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('🔍 DiagnosticLogin component mounted');
    
    // Test all the hooks/imports that might be causing issues
    try {
      addLog('✅ useEffect is working');
      
      // Test if we can access window/navigator
      addLog(`✅ Platform: ${window.Capacitor?.isNative ? 'Mobile' : 'Web'}`);
      addLog(`✅ User Agent: ${navigator.userAgent.substring(0, 30)}...`);
      addLog(`✅ URL: ${window.location.href}`);
      
      // Test React state
      setTimeout(() => {
        addLog('✅ setTimeout works');
      }, 1000);
      
    } catch (error) {
      addLog(`❌ Error in useEffect: ${error.message}`);
    }
  }, []);

  // Force re-render every 2 seconds to show component is alive
  useEffect(() => {
    const interval = setInterval(() => {
      addLog(`💓 Component heartbeat - still alive`);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#ffffff',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#000000',
      zIndex: 9999,
      overflow: 'auto',
    }}>
      <div style={{
        backgroundColor: '#007acc',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        marginBottom: '20px',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: 'bold',
      }}>
        🔍 DIAGNOSTIC LOGIN - DEBUGGING MODE
      </div>
      
      <div style={{
        backgroundColor: '#f0f0f0',
        padding: '20px',
        marginBottom: '20px',
        borderRadius: '8px',
        border: '2px solid #ccc',
      }}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>
          🎯 Purpose: Find why Login component won't render
        </h2>
        <p style={{ margin: '0', lineHeight: '1.5' }}>
          If you can see this content, React is working. 
          We need to identify what's breaking the real Login component.
        </p>
      </div>

      <div style={{
        backgroundColor: '#fff3cd',
        padding: '20px',
        marginBottom: '20px',
        borderRadius: '8px',
        border: '2px solid #ffeaa7',
        maxHeight: '300px',
        overflow: 'auto',
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>
          📋 Diagnostic Logs:
        </h3>
        {logs.length === 0 ? (
          <p style={{ color: '#e74c3c', fontWeight: 'bold' }}>
            ❌ No logs yet - this means JavaScript might not be running
          </p>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ 
              marginBottom: '5px', 
              fontFamily: 'monospace',
              fontSize: '12px',
              backgroundColor: log.includes('❌') ? '#ffebee' : log.includes('✅') ? '#e8f5e8' : 'transparent',
              padding: '2px 4px',
              borderRadius: '3px'
            }}>
              {log}
            </div>
          ))
        )}
      </div>

      <div style={{
        backgroundColor: '#e8f4fd',
        padding: '20px',
        marginBottom: '20px',
        borderRadius: '8px',
        border: '2px solid #74b9ff',
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>
          🧪 Interactive Tests:
        </h3>
        
        <button 
          onClick={() => addLog('✅ Button onClick works')}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '14px',
            cursor: 'pointer',
            marginRight: '10px',
            marginBottom: '10px',
          }}
        >
          Test Button Click
        </button>
        
        <button 
          onClick={() => {
            try {
              // Test if useNavigate would work
              addLog('🔍 Testing navigation...');
              if (window.history) {
                addLog('✅ window.history is available');
              } else {
                addLog('❌ window.history is not available');
              }
            } catch (error) {
              addLog(`❌ Navigation test failed: ${error.message}`);
            }
          }}
          style={{
            backgroundColor: '#17a2b8',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '10px',
          }}
        >
          Test Navigation
        </button>
        
        <button 
          onClick={() => {
            try {
              // Test if we can import/use hooks
              addLog('🔍 Testing React hooks availability...');
              addLog('✅ useState is working (you can see this log)');
              addLog('✅ useEffect is working (component mounted)');
            } catch (error) {
              addLog(`❌ Hooks test failed: ${error.message}`);
            }
          }}
          style={{
            backgroundColor: '#6f42c1',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '10px',
          }}
        >
          Test React Hooks
        </button>
      </div>

      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        border: '2px solid #ddd',
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>
          📝 Next Steps Based on Results:
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
          <li><strong>If you see logs:</strong> React is working, something in Login component is broken</li>
          <li><strong>If no logs appear:</strong> JavaScript execution is blocked</li>
          <li><strong>If heartbeat stops:</strong> Component is crashing after mount</li>
          <li><strong>If buttons don't work:</strong> Event handling is broken</li>
        </ul>
        
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '5px',
          border: '1px solid #dee2e6'
        }}>
          <strong>Current Status:</strong>
          <br />
          Logs Count: {logs.length}
          <br />
          Last Update: {logs.length > 0 ? logs[logs.length - 1] : 'None'}
        </div>
      </div>
    </div>
  );
}