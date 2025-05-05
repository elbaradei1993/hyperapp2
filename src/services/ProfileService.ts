
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  profile_picture: string | null;
  bio: string | null;
  location: string | null;
  role: string | null;
  interests: string[] | null;
  language: string | null;
  notification_preferences: UserNotificationPreferences | null;
  created_at: string | null;
  // Add these to match Supabase database schema
  birthdate?: string | null;
  gender?: string | null;
  phone_number?: string | null;
  points?: number | null;
  reputation?: number | null;
  settings?: any | null;
  updated_at?: string | null;
}

export interface UserNotificationPreferences {
  email: boolean;
  push: boolean;
  vibes: boolean;
  events: boolean;
  alerts: boolean;
}

export interface SavedVibe {
  id: number;
  user_id: string;
  vibe_id: number;
  saved_at: string;
  vibe?: {
    id: number;
    title: string;
    description: string;
    latitude: string;
    longitude: string;
    created_at: string;
    vibe_type: {
      name: string;
      color: string;
    };
  };
}

export interface UserEvent {
  id: number;
  title: string;
  description: string | null;
  start_date_time: string;
  end_date_time: string;
  latitude: string;
  longitude: string;
  address: string | null;
  created_at: string | null;
  organizer_id: number;
  vibe_type?: {
    name: string;
    color: string;
  };
}

export interface UserReportedVibe {
  id: number;
  title: string | null;
  description: string | null;
  latitude: string;
  longitude: string;
  created_at: string | null;
  confirmed_count: number;
  vibe_type: {
    name: string;
    color: string;
  };
}

// Add an interface for saved_vibes to fix TypeScript errors
export interface SavedVibeRow {
  id: number;
  user_id: string;
  vibe_id: number;
  saved_at: string;
}

export const ProfileService = {
  /**
   * Get the current user's profile
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (error) throw error;
      
      return data as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
      return null;
    }
  },

  /**
   * Update a user's profile information
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Profile updated successfully');
      return data as UserProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast.error('Failed to update profile');
      return null;
    }
  },

  /**
   * Upload a profile picture and update the profile
   */
  async uploadProfilePicture(userId: string, file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: urlData } = await supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      const publicUrl = urlData.publicUrl;
      
      // Update the profile with the new picture URL
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture: publicUrl })
        .eq('id', userId)
        .select('profile_picture')
        .single();
        
      if (updateError) throw updateError;
      
      toast.success('Profile picture uploaded successfully');
      return data.profile_picture;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
      return null;
    }
  },

  /**
   * Get user's reported vibes
   */
  async getUserReportedVibes(userId: string): Promise<UserReportedVibe[]> {
    try {
      const { data, error } = await supabase
        .from('vibe_reports')
        .select(`
          id,
          title,
          description,
          latitude,
          longitude,
          created_at,
          confirmed_count,
          vibe_type:vibe_type_id (
            name,
            color
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data as UserReportedVibe[];
    } catch (error) {
      console.error('Error fetching user reported vibes:', error);
      toast.error('Failed to load your reported vibes');
      return [];
    }
  },

  /**
   * Get user's created events
   */
  async getUserCreatedEvents(userId: string): Promise<UserEvent[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          start_date_time,
          end_date_time,
          latitude,
          longitude,
          address,
          created_at,
          organizer_id,
          vibe_type:vibe_type_id (
            name,
            color
          )
        `)
        .eq('organizer_id', userId)
        .order('start_date_time', { ascending: true });
        
      if (error) throw error;
      
      return data as UserEvent[];
    } catch (error) {
      console.error('Error fetching user created events:', error);
      toast.error('Failed to load your events');
      return [];
    }
  },
  
  /**
   * Save a vibe for the user
   */
  async saveVibe(userId: string, vibeId: number): Promise<boolean> {
    try {
      // Use explicit typing for the insert object
      const insertData: SavedVibeRow = {
        id: 0, // This will be auto-generated by Supabase
        user_id: userId,
        vibe_id: vibeId,
        saved_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('saved_vibes')
        .insert(insertData);
        
      if (error) throw error;
      
      toast.success('Vibe saved to your collection');
      return true;
    } catch (error) {
      console.error('Error saving vibe:', error);
      toast.error('Failed to save vibe');
      return false;
    }
  },
  
  /**
   * Unsave a vibe for the user
   */
  async unsaveVibe(userId: string, vibeId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('saved_vibes')
        .delete()
        .eq('user_id', userId)
        .eq('vibe_id', vibeId);
        
      if (error) throw error;
      
      toast.success('Vibe removed from your collection');
      return true;
    } catch (error) {
      console.error('Error removing saved vibe:', error);
      toast.error('Failed to remove vibe from saved collection');
      return false;
    }
  },
  
  /**
   * Get user's saved vibes
   */
  async getUserSavedVibes(userId: string): Promise<SavedVibe[]> {
    try {
      // Use explicit typing instead of relying on type inference
      type SavedVibeWithRelations = SavedVibe & {
        vibe: {
          id: number;
          title: string | null;
          description: string | null;
          latitude: string;
          longitude: string;
          created_at: string | null;
          vibe_type: {
            name: string;
            color: string;
          };
        };
      };
      
      // Create the table first if it doesn't exist
      const { data, error } = await supabase
        .from('saved_vibes')
        .select(`
          id,
          user_id,
          vibe_id,
          saved_at,
          vibe:vibe_id (
            id,
            title,
            description,
            latitude,
            longitude,
            created_at,
            vibe_type:vibe_type_id (
              name,
              color
            )
          )
        `)
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });
        
      if (error) throw error;
      
      return data as SavedVibe[];
    } catch (error) {
      console.error('Error fetching saved vibes:', error);
      toast.error('Failed to load your saved vibes');
      return [];
    }
  },
  
  /**
   * Check if a vibe is saved by the user
   */
  async isVibeSaved(userId: string, vibeId: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('saved_vibes')
        .select('id')
        .eq('user_id', userId)
        .eq('vibe_id', vibeId)
        .maybeSingle();
        
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error checking if vibe is saved:', error);
      return false;
    }
  }
};
