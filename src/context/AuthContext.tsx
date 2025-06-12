'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { User as AppUser } from '@/types';

interface AuthState {
  user: User | null;
  profile: AppUser | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  isAuthenticated: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, userData: { name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AppUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setAuthState({ user: session.user, profile: profile || null, loading: false, error: null });
        } else if (isMounted) {
          setAuthState({ user: null, profile: null, loading: false, error: null });
        }
      } catch (e) {
        console.error("Error initializing auth:", e);
        if (isMounted) {
          setAuthState({ user: null, profile: null, loading: false, error: '인증 초기화에 실패했습니다.' });
        }
      }
    };
    initAuth();

    const loadingTimeout = setTimeout(() => {
      if (isMounted) {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    }, 3000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setAuthState({ user: session.user, profile: profile || null, loading: false, error: null });
        } else {
          setAuthState({ user: null, profile: null, loading: false, error: null });
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    console.log('AuthContext: Attempting login for', email);
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error('AuthContext: Login error:', error.message);
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        throw error;
      }

      if (data.user) {
        console.log('AuthContext: Login successful for', data.user.email);
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        console.log('AuthContext: Profile fetched:', profile);
        setAuthState({ user: data.user, profile: profile || null, loading: false, error: null });
      } else {
          // This case should ideally not happen if error is null
          console.warn("AuthContext: signInWithPassword returned no error but no user.");
          setAuthState(prev => ({ ...prev, loading: false, error: "로그인에 성공했지만 사용자 정보를 가져오지 못했습니다."}));
      }
    } catch (error: any) {
        console.error('AuthContext: Cought exception during signInWithEmail', error);
        setAuthState(prev => ({ ...prev, loading: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }));
        throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, userData: { name: string }) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData },
    });
    if (error) {
      setAuthState(prev => ({...prev, loading: false, error: error.message}));
      throw error;
    }
    if(data.user) {
        const { error: profileError } = await supabase.from('users').insert({
            id: data.user.id,
            email: data.user.email!,
            name: userData.name
        });
        if (profileError) {
             console.error('Profile creation error:', profileError);
        }
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<AppUser>) => {
    if (!authState.user) return;
    const { error } = await supabase.from('users').update(updates).eq('id', authState.user.id);
    if (error) throw error;
    const { data: profile } = await supabase.from('users').select('*').eq('id', authState.user.id).single();
    setAuthState(prev => ({ ...prev, profile: profile || null }));
  };

  const value: AuthContextType = {
    ...authState,
    isAuthenticated: !!authState.user,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 