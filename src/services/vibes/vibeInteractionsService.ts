
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
      // Use explicit typing for the RPC parameters
      interface IncrementParams {
        report_id: number;
      }
      
      // Call the RPC function with properly typed parameters - provide both return type and params type
      const { error } = await supabase.rpc<void, IncrementParams>('increment_vibe_count', {
        report_id: id
      });
      
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
