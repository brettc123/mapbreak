import React, { useState, useEffect, createContext, useContext } from 'react';
import { createClient, User, Session } from '@supabase/supabase-js';

// Enhanced environment variable handling for mobile
const getSupabaseConfig = () => {
  // Try to get from import.meta.env first (web)
  let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Fallback for mobile builds - you'll need to replace these with your actual values
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Environment variables not found, using fallback values');
    
    // Your actual values as fallback for mobile
    supabaseUrl = 'https://lsejipfazdixicnfkubm.supabase.co';
    supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZWppcGZhemRpeGljbmZrdWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MzQ4MjUsImV4cCI6MjA2MjIxMDgyNX0.fNSxCLRAhHmgkm4jF3OGpOyaxflrAXxd-0_OBctFlLo';
  }
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing. Please check your environment variables.');
  }
  
  return { supabaseUrl, supabaseAnonKey };
};

const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enhanced config for mobile
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable for mobile to prevent issues
  },
});

type SupabaseContextType = {
  supabase: typeof supabase;
  user: User | null;
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');
        
        // Get initial session with error handling
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          console.log('✅ Auth initialized. User:', session?.user?.email || 'None');
        }
      } catch (error) {
        console.error('❌ Auth initialization failed:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'No user');
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Enhanced logout function
  const logout = async () => {
    try {
      console.log('🔄 Logging out user...');
      
      // Clear local state first
      setUser(null);
      setSession(null);
      
      // Call Supabase signOut
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Logout error:', error);
        throw error;
      }
      
      // Clear localStorage as backup
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('favoriteMapIds');
          localStorage.removeItem('viewedMapIds');
          localStorage.removeItem('dailySearchCount');
          localStorage.removeItem('lastSearchDate');
        }
      } catch (e) {
        console.warn('Could not clear localStorage');
      }
      
      console.log('✅ Logout successful');
      
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw error;
    }
  };

  const value = {
    supabase,
    user,
    session,
    loading,
    logout,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}