
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
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (user) {
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
      } else {
        const { data, error } = await supabase.rpc('get_public_vibe_reports', { _limit: limit });
        if (error) throw error as any;
        return (data || []).map((r: any) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          latitude: r.latitude,
          longitude: r.longitude,
          created_at: r.created_at,
          confirmed_count: r.confirmed_count,
          vibe_type_id: r.vibe_type_id,
          vibe_type: { name: r.vibe_type_name, color: r.vibe_type_color },
        })) as any;
      }
    } catch (error) {
      console.error('Error fetching trending vibes:', error);
      toast.error('Failed to load trending vibes');
      return [];
    }
  }
};

// Export for backward compatibility
export const fetchTrendingVibes = TrendingVibesService.getTrendingVibes;
