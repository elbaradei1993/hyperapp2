
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Vibe {
  id: number;
  title: string;
  description: string;
  latitude: string;
  longitude: string;
  created_at: string;
  confirmed_count: number;
  vibe_type: {
    name: string;
    color: string;
  };
  vibe_type_id: number;
}

export interface VibeType {
  id: number;
  name: string;
  color: string;
}

export interface VibeReport {
  id: number;
  title: string;
  description: string;
  latitude: string;
  longitude: string;
  created_at: string;
  confirmed_count: number;
  vibe_type_id: number;
  vibe_type?: {
    name: string;
    color: string;
  };
  user_id?: number;
}

interface CreateVibeReport {
  title: string;
  description: string;
  latitude: string;
  longitude: string;
  vibe_type_id: number;
  user_id?: number | null;
}

// Define the type for the increment vibe count params to match the RPC expectation
interface IncrementVibeCountParams {
  vibe_id: number;
}

// Export a single VibeService object with all the functions as methods
export const VibeService = {
  /**
   * Fetch all vibe types from Supabase
   */
  async getVibeTypes(): Promise<VibeType[]> {
    try {
      const { data, error } = await supabase
        .from('vibe_types')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching vibe types:', error);
      toast.error('Failed to load vibe types');
      return [];
    }
  },

  /**
   * Fetch recent vibe reports with pagination
   */
  async getVibeReports(page = 0, limit = 20): Promise<VibeReport[]> {
    try {
      const from = page * limit;
      const to = from + limit - 1;
      
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
          vibe_type_id,
          vibe_type:vibe_type_id (
            name,
            color
          )
        `)
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching vibes:', error);
      toast.error('Failed to load vibes');
      return [];
    }
  },

  /**
   * Fetch trending (most confirmed) vibes
   */
  async getTrendingVibes(limit = 20): Promise<Vibe[]> {
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
          vibe_type_id,
          vibe_type:vibe_type_id (
            name,
            color
          )
        `)
        .order('confirmed_count', { ascending: false })
        .limit(limit);
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching trending vibes:', error);
      toast.error('Failed to load trending vibes');
      return [];
    }
  },

  /**
   * Create a new vibe report
   */
  async createVibeReport(vibeData: CreateVibeReport): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      // Convert user_id to number if it's a string, or null if it's null/undefined
      const formattedData = {
        ...vibeData,
        user_id: vibeData.user_id ? Number(vibeData.user_id) : null,
      };

      const { data, error } = await supabase
        .from('vibe_reports')
        .insert(formattedData)
        .select();
      
      if (error) {
        throw error;
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Error creating vibe report:', error);
      toast.error('Failed to create vibe report');
      return { success: false, error };
    }
  },

  /**
   * Increment the confirmed count for a vibe
   */
  async upvoteVibe(vibe_id: number): Promise<boolean> {
    try {
      // Explicitly specify the parameter object type to match the expected server-side parameter
      const params: IncrementVibeCountParams = { vibe_id };
      
      const { data, error } = await supabase.rpc(
        'increment_vibe_confirmed_count',
        params
      );
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error incrementing vibe count:', error);
      toast.error('Failed to confirm vibe');
      return false;
    }
  }
};

// Re-export for backward compatibility
export const fetchVibeTypes = VibeService.getVibeTypes;
export const fetchVibes = VibeService.getVibeReports;
export const fetchTrendingVibes = VibeService.getTrendingVibes;
export const createVibeReport = VibeService.createVibeReport;
export const incrementVibeCount = VibeService.upvoteVibe;
