// Create this as TestLogin.tsx in your pages folder
import { useNavigate } from 'react-router-dom';

export default function TestLogin() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'lightblue', 
      minHeight: '100vh',
      color: 'black'
    }}>
      <h1>TEST LOGIN PAGE WORKS!</h1>
      <p>If you can see this, the routing is working fine.</p>
      
      <button 
        onClick={() => navigate('/settings')}
        style={{ 
          padding: '10px 20px', 
          marginTop: '20px',
          backgroundColor: 'white',
          border: '1px solid black',
          cursor: 'pointer'
        }}
      >
        Go Back to Settings
      </button>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        backgroundColor: 'white',
        border: '1px solid black'
      }}>
        <h3>Debug Info:</h3>
        <p><strong>Current URL:</strong> {window.location.href}</p>
        <p><strong>Current pathname:</strong> {window.location.pathname}</p>
        <p><strong>React Router working:</strong> ✅ YES</p>
      </div>
    </div>
  );
}