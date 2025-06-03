import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';
import { useSubscription } from '../hooks/useSubscription';

interface AuthGuardProps {
  children: React.ReactNode;
  onShowLogin: () => void;
}

export default function AuthGuard({ children, onShowLogin }: AuthGuardProps) {
  const { user, loading } = useSupabase();
  const { subscription } = useSubscription();

  useEffect(() => {
    // Only show login modal if user is subscribed
    if (!loading && !user && subscription?.subscription_status === 'active') {
      onShowLogin();
    }
  }, [user, loading, onShowLogin, subscription]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Only block access if user is subscribed
  if (!user && subscription?.subscription_status === 'active') {
    return null;
  }

  return <>{children}</>;
}