
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
}

export interface VibeType {
  id: number;
  name: string;
  color: string;
}

interface CreateVibeReport {
  title: string;
  description: string;
  latitude: string;
  longitude: string;
  vibe_type_id: number;
  user_id?: string | null;
}

interface IncrementVibeCountParams {
  vibe_id: number;
}

/**
 * Fetch all vibe types from Supabase
 */
export const fetchVibeTypes = async (): Promise<VibeType[]> => {
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
};

/**
 * Fetch recent vibes with pagination
 */
export const fetchVibes = async (page = 0, limit = 20): Promise<Vibe[]> => {
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
};

/**
 * Fetch trending (most confirmed) vibes
 */
export const fetchTrendingVibes = async (limit = 20): Promise<Vibe[]> => {
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
};

/**
 * Create a new vibe report
 */
export const createVibeReport = async (vibeData: CreateVibeReport): Promise<{ success: boolean; data?: any; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('vibe_reports')
      .insert([vibeData])
      .select();
    
    if (error) {
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error creating vibe report:', error);
    toast.error('Failed to create vibe report');
    return { success: false, error };
  }
};

/**
 * Increment the confirmed count for a vibe
 */
export const incrementVibeCount = async (params: IncrementVibeCountParams): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc(
      'increment_vibe_confirmed_count',
      { vibe_id: params.vibe_id.toString() } as any
    );
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error incrementing vibe count:', error);
    toast.error('Failed to confirm vibe');
    return false;
  }
};
