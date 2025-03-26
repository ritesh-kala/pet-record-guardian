import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: { full_name?: string; avatar_url?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  async function signUp(email: string, password: string, name: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;
      
      toast({
        title: "Account created successfully",
        description: "Check your email for a confirmation link.",
      });
      
      // If auto-confirm is enabled in Supabase
      if (data.user) {
        setCurrentUser(data.user);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
      throw error;
    }
  }

  async function login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      setCurrentUser(data.user);
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  }

  async function logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setCurrentUser(null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to log out.",
        variant: "destructive"
      });
      throw error;
    }
  }

  async function resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for further instructions.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  }

  async function updateUserProfile(data: { full_name?: string; avatar_url?: string }) {
    try {
      const { error } = await supabase.auth.updateUser({
        data
      });
      
      if (error) throw error;
      
      // Refresh user data
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        setCurrentUser(userData.user);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive"
      });
      throw error;
    }
  }

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setCurrentUser(session?.user || null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    loading,
    signUp,
    login,
    logout,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
