
import { supabase } from '@/integrations/supabase/client';

export interface VibeType {
  id: number;
  name: string;
  color: string;
}

export interface VibeReport {
  id: number;
  title: string | null;
  description: string | null;
  latitude: string;
  longitude: string;
  media_url: string | null;
  vibe_type_id: number;
  user_id: number | null;
  is_anonymous: boolean;
  created_at: string | null;
  confirmed_count: number;
}

export const VibeService = {
  /**
   * Get all vibe types
   */
  getVibeTypes: async (): Promise<VibeType[]> => {
    const { data, error } = await supabase
      .from('vibe_types')
      .select('*')
      .order('name');

    if (error) {
      console.error("Error fetching vibe types:", error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get vibe type by ID
   */
  getVibeTypeById: async (id: number): Promise<VibeType | null> => {
    const { data, error } = await supabase
      .from('vibe_types')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching vibe type:", error);
      throw error;
    }

    return data || null;
  },

  /**
   * Get all vibe reports
   */
  getVibeReports: async (): Promise<VibeReport[]> => {
    const { data, error } = await supabase
      .from('vibe_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching vibe reports:", error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get vibe reports by vibe type ID
   */
  getVibeReportsByVibeTypeId: async (vibe_type_id: number): Promise<VibeReport[]> => {
    const { data, error } = await supabase
      .from('vibe_reports')
      .select('*')
      .eq('vibe_type_id', vibe_type_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching vibe reports:", error);
      throw error;
    }

    return data || [];
  },

  /**
   * Create a new vibe report
   */
  createVibeReport: async (vibeReport: Omit<VibeReport, 'id' | 'created_at' | 'confirmed_count'>): Promise<VibeReport> => {
    const { data, error } = await supabase
      .from('vibe_reports')
      .insert([vibeReport])
      .select('*')
      .single();

    if (error) {
      console.error("Error creating vibe report:", error);
      throw error;
    }

    return data as VibeReport;
  },

  /**
   * Confirm a vibe report
   */
  confirmVibeReport: async (id: number): Promise<VibeReport | null> => {
    // First call the RPC function to increment the counter
    const { error: incrementError } = await supabase.rpc('increment_vibe_count', {
      report_id: id,
      inc_amount: 1
    } as unknown as Record<string, unknown>);
    
    if (incrementError) {
      console.error("Error incrementing vibe count:", incrementError);
      throw incrementError;
    }

    // Then fetch the updated record
    const { data, error } = await supabase
      .from('vibe_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error confirming vibe report:", error);
      throw error;
    }

    return data as VibeReport;
  },

  /**
   * Upvote a vibe (alias for confirmVibeReport for readability)
   */
  upvoteVibe: async (id: number): Promise<VibeReport | null> => {
    return VibeService.confirmVibeReport(id);
  },

  /**
   * Delete a vibe report
   */
  deleteVibeReport: async (id: number): Promise<boolean> => {
    const { error } = await supabase
      .from('vibe_reports')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting vibe report:", error);
      throw error;
    }

    return true;
  },
  
  /**
   * Get the most recent vibe reports
   */
  getMostRecentVibeReports: async (limit: number = 5): Promise<VibeReport[]> => {
    const { data, error } = await supabase
      .from('vibe_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error("Error fetching vibe reports:", error);
      throw error;
    }
    
    return data || [];
  }
};
