
import { supabase } from "@/integrations/supabase/client";
import { CreateVibeReportInput, VibeReport } from "./types";
import { toast } from "sonner";

/**
 * Service for managing vibe reports
 */
export const VibeReportsService = {
  /**
   * Fetch recent vibe reports with pagination
   */
  async getVibeReports(page = 0, limit = 20): Promise<VibeReport[]> {
    try {
      const from = page * limit;
      const to = from + limit - 1;
      
      // Decide between precise vs anonymized public data based on auth state
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
          .order('created_at', { ascending: false })
          .range(from, to);
        
        if (error) {
          throw error;
        }
        
        return data || [];
      } else {
        const { data, error } = await supabase.rpc('get_public_vibe_reports', { _limit: limit });
        if (error) {
          throw error as any;
        }
        return (data || []).map((r: any) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          latitude: r.latitude,
          longitude: r.longitude,
          created_at: r.created_at,
          confirmed_count: r.confirmed_count,
          vibe_type_id: r.vibe_type_id,
          vibe_type: {
            name: r.vibe_type_name,
            color: r.vibe_type_color,
          },
        })) as VibeReport[];
      }
    } catch (error) {
      console.error('Error fetching vibes:', error);
      toast.error('Failed to load vibes');
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
  }
};

// Export for backward compatibility
export const fetchVibes = VibeReportsService.getVibeReports;
export const createVibeReport = VibeReportsService.createVibeReport;
