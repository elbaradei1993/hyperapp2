
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

interface CreateVibeReportInput {
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

// Define the interface for the VibeService
interface VibeServiceInterface {
  getVibeTypes(): Promise<VibeType[]>;
  getVibeReports(page?: number, limit?: number): Promise<VibeReport[]>;
  getTrendingVibes(limit?: number): Promise<Vibe[]>;
  createVibeReport(data: CreateVibeReportInput): Promise<VibeReport | null>;
  upvoteVibe(id: number): Promise<void>;
}

// Export a single VibeService object with all the functions as methods
export const VibeService: VibeServiceInterface = {
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
  async createVibeReport(formData: CreateVibeReportInput): Promise<VibeReport | null> {
    try {
      // Convert user_id to number if it's a string, or null if it's null/undefined
      const formattedData = {
        ...formData,
        user_id: formData.user_id ? Number(formData.user_id) : null,
      };

      const { data: newData, error } = await supabase
        .from('vibe_reports')
        .insert(formattedData)
        .select();
      
      if (error) {
        throw error;
      }
      
      return newData ? newData[0] : null;
    } catch (error) {
      console.error('Error creating vibe report:', error);
      toast.error('Failed to create vibe report');
      return null;
    }
  },

  /**
   * Increment the confirmed count for a vibe
   */
  async upvoteVibe(id: number): Promise<void> {
    try {
      // Fix: Properly type the parameters as an object that matches what the RPC function expects
      const { error } = await supabase.rpc(
        'increment_vibe_confirmed_count',
        { vibe_id: id } as IncrementVibeCountParams
      );
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error incrementing vibe count:', error);
      toast.error('Failed to confirm vibe');
      throw error;
    }
  }
};

// Re-export for backward compatibility
export const fetchVibeTypes = VibeService.getVibeTypes;
export const fetchVibes = VibeService.getVibeReports;
export const fetchTrendingVibes = VibeService.getTrendingVibes;
export const createVibeReport = VibeService.createVibeReport;
export const incrementVibeCount = VibeService.upvoteVibe;
