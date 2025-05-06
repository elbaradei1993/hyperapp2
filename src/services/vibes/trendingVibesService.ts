
import { supabase } from "@/integrations/supabase/client";
import { Vibe } from "./types";
import { toast } from "sonner";

/**
 * Service for managing trending vibes
 */
export const TrendingVibesService = {
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
  }
};

// Export for backward compatibility
export const fetchTrendingVibes = TrendingVibesService.getTrendingVibes;
