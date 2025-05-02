
import { supabase } from '@/integrations/supabase/client';
import { safeParseInt } from '@/utils/typeConverters';

export interface VibeReport {
  title: string;
  description?: string | null;
  latitude: string;
  longitude: string;
  vibe_type_id: number;
  is_anonymous?: boolean;
}

export interface VibeType {
  id: number;
  name: string;
  color: string;
}

export interface VibeData {
  id: number;
  title: string | null;
  description: string | null;
  latitude: string;
  longitude: string;
  created_at: string;
  confirmed_count: number;
  vibe_type: {
    name: string;
    color: string;
  };
}

export const VibeService = {
  /**
   * Get all vibe types
   */
  getVibeTypes: async (): Promise<VibeType[]> => {
    const { data, error } = await supabase
      .from('vibe_types')
      .select('id, name, color')
      .order('name');
      
    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new vibe report
   */
  createVibeReport: async (vibeReport: VibeReport) => {
    const { data, error } = await supabase
      .from('vibe_reports')
      .insert(vibeReport)
      .select('id')
      .single();
      
    if (error) throw error;
    return data;
  },

  /**
   * Get trending vibes
   */
  getTrendingVibes: async (limit: number = 10): Promise<VibeData[]> => {
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
        vibe_type: vibe_type_id (
          name,
          color
        )
      `)
      .order('confirmed_count', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data || [];
  },

  /**
   * Upvote a vibe report
   */
  upvoteVibe: async (vibeId: number | string) => {
    // Convert string ID to number if necessary
    const id = typeof vibeId === 'string' ? safeParseInt(vibeId) : vibeId;
    
    try {
      // Define a proper type for the RPC parameters
      interface IncrementVibeCountParams {
        report_id: number;
      }
      
      const params: IncrementVibeCountParams = { report_id: id };
      
      // Call the RPC function with proper typing - fixing the type parameter issue
      const { error } = await supabase.rpc(
        'increment_vibe_count',
        params
      );
      
      if (error) {
        // Fallback to direct update
        const { data: currentVibe } = await supabase
          .from('vibe_reports')
          .select('confirmed_count')
          .eq('id', id)
          .single();
          
        if (currentVibe) {
          await supabase
            .from('vibe_reports')
            .update({ 
              confirmed_count: (currentVibe.confirmed_count || 0) + 1 
            })
            .eq('id', id);
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error upvoting vibe:", error);
      throw error;
    }
  }
};
