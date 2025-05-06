
import { supabase } from "@/integrations/supabase/client";
import { IncrementVibeCountParams } from "./types";
import { toast } from "sonner";

/**
 * Service for managing vibe interactions like upvoting
 */
export const VibeInteractionsService = {
  /**
   * Increment the confirmed count for a vibe
   */
  async upvoteVibe(id: number): Promise<void> {
    try {
      // Use the interface from the types file for RPC parameters
      const params: { report_id: number } = {
        report_id: id
      };
      
      // Call the RPC function - using proper type syntax for the Supabase client
      const { error } = await supabase.rpc('increment_vibe_count', params);
      
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

// Export for backward compatibility
export const incrementVibeCount = VibeInteractionsService.upvoteVibe;
