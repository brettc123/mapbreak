import React, { useState, useEffect, createContext, useContext } from 'react';
import { createClient, User, Session } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Enhanced logout function that SettingsPage.tsx expects
  const logout = async () => {
    try {
      console.log('🔄 Logging out user...');

      // Clear any local state first
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
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}