
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../supabaseClient';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  signup: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  logout: async () => {},
  isAuthenticated: false,
  loading: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    userIdRef.current = user?.id || null;
  }, [user]);

  const getUserProfile = async (authId: string, authEmail?: string, authMeta?: any): Promise<User | null> => {
      try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authId)
            .single();

        if (profile) {
            return {
                id: authId,
                name: profile.full_name || authMeta?.full_name || authEmail?.split('@')[0] || 'Student',
                email: profile.email || authEmail || '',
                role: profile.role as UserRole || 'student',
                xp: profile.xp || 0,
                level: profile.level || 1,
                credits: profile.credits || 0,
                subscriptionTier: 'free',
                bookedLectures: [],
                purchasedCourses: [],
                achievements: []
            };
        }

        // Self-Healing
        console.warn("Profile missing for existing auth user. Attempting to create...");
        const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
                id: authId,
                email: authEmail || '',
                full_name: authMeta?.full_name || authEmail?.split('@')[0],
                role: 'student'
            })
            .select()
            .single();

        if (newProfile) {
             return {
                id: authId,
                name: newProfile.full_name,
                email: newProfile.email,
                role: newProfile.role as UserRole,
                xp: 0, 
                level: 1, 
                credits: 0, 
                subscriptionTier: 'free', 
                bookedLectures: [], 
                purchasedCourses: [], 
                achievements: []
             };
        } else {
             console.error("Self-healing failed:", createError?.message);
             return null;
        }
      } catch (e) {
          console.error("Critical Error fetching profile:", e);
          return null;
      }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const u = await getUserProfile(session.user.id, session.user.email, session.user.user_metadata);
          if (u) setUser(u);
        }
        
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
             if (userIdRef.current !== session.user.id) {
                 const u = await getUserProfile(session.user.id, session.user.email, session.user.user_metadata);
                 setUser(u);
             }
          } else if (event === 'SIGNED_OUT') {
             setUser(null);
             userIdRef.current = null;
          }
        });
      } catch (err) {
          console.error("Supabase auth check failed", err);
      } finally {
          setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    
    try {
        await supabase.auth.signOut().catch(() => {});
        
        const { data, error } = await supabase.auth.signInWithPassword({ 
            email: cleanEmail, 
            password: password || 'password' 
        });

        if (error) throw error;

        if (data.user) {
           const u = await getUserProfile(data.user.id, data.user.email, data.user.user_metadata);
           if (u) {
               setUser(u);
               return;
           } 
           throw new Error("Could not load user profile.");
        }
    } catch (err) {
        throw err;
    } finally {
        setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    const cleanEmail = email.trim();
    const cleanName = name.trim();

    try {
        const { error } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
                data: { full_name: cleanName }
            }
        });
        
        if (error) throw error;
    } catch(err) {
        throw err;
    } finally {
        setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: window.location.origin + '/dashboard', 
        });
        if (error) throw error;
    } catch(err) {
        throw err;
    } finally {
        setLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    setLoading(true);
    try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
    } catch (e) {
        throw e;
    } finally {
        setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    userIdRef.current = null;
    try {
        await Promise.race([
            supabase.auth.signOut(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
        ]);
    } catch (error) {
        console.warn("Logout: Sign-out skipped or failed", error);
    } finally {
        if (typeof window !== 'undefined') {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
                    localStorage.removeItem(key);
                }
            });
        }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, resetPassword, updatePassword, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
