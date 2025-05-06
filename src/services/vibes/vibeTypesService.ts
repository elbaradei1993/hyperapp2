
import { supabase } from "@/integrations/supabase/client";
import { VibeType } from "./types";
import { toast } from "sonner";

/**
 * Service for managing vibe types
 */
export const VibeTypesService = {
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
  }
};

// Export for backward compatibility
export const fetchVibeTypes = VibeTypesService.getVibeTypes;
