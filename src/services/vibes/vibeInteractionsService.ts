
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
      // Define the parameters with the correct type
      const params: Record<string, any> = { report_id: id };
      
      // Call the RPC function with the parameters and type assertion
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
