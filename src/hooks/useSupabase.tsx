//useSupabase.tsx
// Fixed version to prevent multiple subscription errors

import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { createClient, User, Session } from '@supabase/supabase-js';

// Environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lsejipfazdixicnfkubm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZWppcGZhemRpeGljbmZrdWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MzQ4MjUsImV4cCI6MjA2MjIxMDgyNX0.fNSxCLRAhHmgkm4jF3OGpOyaxflrAXxd-0_OBctFlLo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  
  // Use ref to track auth subscription and prevent multiple subscriptions
  const authSubscriptionRef = useRef<any>(null);
  const isAuthListenerSetupRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔍 Initializing Supabase auth...');
        
        // Get initial session
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
      } catch (err: any) {
        console.error('❌ Auth initialization failed:', err);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const setupAuthListener = () => {
      // Cleanup existing auth listener first
      if (authSubscriptionRef.current) {
        console.log('🧹 Cleaning up existing auth subscription');
        authSubscriptionRef.current.unsubscribe();
        authSubscriptionRef.current = null;
        isAuthListenerSetupRef.current = false;
      }

      // Only set up auth listener if not already setup
      if (!isAuthListenerSetupRef.current) {
        try {
          console.log('🔄 Setting up auth listener...');
          
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              console.log('🔍 Auth state changed:', event, session?.user?.email || 'No user');
              
              if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
              }
            }
          );
          
          authSubscriptionRef.current = subscription;
          isAuthListenerSetupRef.current = true;
          console.log('✅ Auth listener set up successfully');
          
        } catch (error) {
          console.error('❌ Error setting up auth listener:', error);
          isAuthListenerSetupRef.current = false;
        }
      } else {
        console.log('⚠️ Auth listener already setup, skipping...');
      }
    };

    // Initialize auth first, then set up listener
    initializeAuth().then(() => {
      if (mounted) {
        setupAuthListener();
      }
    });

    // Cleanup function
    return () => {
      mounted = false;
      if (authSubscriptionRef.current) {
        console.log('🧹 Cleaning up auth subscription on unmount');
        authSubscriptionRef.current.unsubscribe();
        authSubscriptionRef.current = null;
        isAuthListenerSetupRef.current = false;
      }
    };
  }, []); // Empty dependency array - only run once

  const logout = async () => {
    try {
      console.log('🔄 Logging out user...');
      
      // Clean up auth subscription before logout
      if (authSubscriptionRef.current) {
        authSubscriptionRef.current.unsubscribe();
        authSubscriptionRef.current = null;
        isAuthListenerSetupRef.current = false;
      }
      
      setUser(null);
      setSession(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Logout error:', error);
        throw error;
      }
      
      // Clear localStorage
      try {
        localStorage.removeItem('favoriteMapIds');
        localStorage.removeItem('viewedMapIds');
        localStorage.removeItem('dailySearchCount');
        localStorage.removeItem('lastSearchDate');
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
    console.error('❌ useSupabase called outside of SupabaseProvider');
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}