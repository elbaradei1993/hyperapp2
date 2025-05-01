
import { supabase } from '@/integrations/supabase/client';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
}

export const AuthService = {
  /**
   * Sign in with email and password
   */
  signIn: async (credentials: AuthCredentials) => {
    return supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
  },

  /**
   * Sign up with email and password
   */
  signUp: async (credentials: AuthCredentials, profile?: UserProfile) => {
    return supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: profile,
      },
    });
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    return supabase.auth.signOut();
  },

  /**
   * Get the current session
   */
  getSession: async () => {
    return supabase.auth.getSession();
  },

  /**
   * Reset password
   */
  resetPassword: async (email: string) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  },

  /**
   * Update user password
   */
  updatePassword: async (password: string) => {
    return supabase.auth.updateUser({
      password,
    });
  },
};
