
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface EventData {
  title: string;
  description?: string;
  location: string;
  latitude?: string;
  longitude?: string;
  start_date_time: string; // Changed from start_date to match DB schema
  end_date_time: string; // Changed from end_date to match DB schema
  image_url?: string;
  organization_id?: string;
  vibe_type_id?: number;
  max_attendees?: number;
  is_public?: boolean;
  address?: string;
}

export interface EventResponse {
  id: string;
  title: string;
  description: string | null;
  location: string;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  start_date_time: string; // Changed to match DB schema
  end_date_time: string; // Changed to match DB schema
  image_url: string | null;
  organization_id: string | null;
  created_at: string;
  updated_at: string | null;
  is_public: boolean;
  vibe_type_id: number | null;
  max_attendees: number | null;
  current_attendees: number;
  status: string;
}

export const EventService = {
  /**
   * Create a new event
   */
  createEvent: async (eventData: EventData) => {
    // Ensure the data structure matches the database schema
    const eventRecord = {
      ...eventData,
      // No need to convert dates as they're already expected as strings
    };
    
    const { data, error } = await supabase
      .from('events')
      .insert(eventRecord)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  /**
   * Get all events
   */
  getEvents: async (limit: number = 20): Promise<EventResponse[]> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'active')
      .order('start_date_time')
      .limit(limit);
      
    if (error) throw error;
    
    // Convert database response to EventResponse type
    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      location: item.address || '', // Use address as location if needed
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
      start_date_time: item.start_date_time,
      end_date_time: item.end_date_time,
      image_url: item.image_url,
      organization_id: item.organization_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      is_public: item.is_public || false,
      vibe_type_id: item.vibe_type_id,
      max_attendees: item.max_attendees,
      current_attendees: item.current_attendees || 0,
      status: item.status || 'active'
    }));
  },
  
  /**
   * Get event by ID
   */
  getEventById: async (id: string): Promise<EventResponse | null> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error) throw error;
    
    if (!data) return null;
    
    // Convert database response to EventResponse type
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      location: data.address || '',
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      start_date_time: data.start_date_time,
      end_date_time: data.end_date_time,
      image_url: data.image_url,
      organization_id: data.organization_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_public: data.is_public || false,
      vibe_type_id: data.vibe_type_id,
      max_attendees: data.max_attendees,
      current_attendees: data.current_attendees || 0,
      status: data.status || 'active'
    };
  },
  
  /**
   * Get events created by an organization
   */
  getOrganizationEvents: async (organizationId: string): Promise<EventResponse[]> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Convert database response to EventResponse type
    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      location: item.address || '',
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
      start_date_time: item.start_date_time,
      end_date_time: item.end_date_time,
      image_url: item.image_url,
      organization_id: item.organization_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      is_public: item.is_public || false,
      vibe_type_id: item.vibe_type_id,
      max_attendees: item.max_attendees,
      current_attendees: item.current_attendees || 0,
      status: item.status || 'active'
    }));
  },
  
  /**
   * Register user for event
   */
  registerForEvent: async (eventId: string, userId: string) => {
    // Using raw SQL through rpc since event_attendees may not be in the types
    const { data, error } = await supabase
      .rpc('register_for_event', {
        p_event_id: eventId,
        p_user_id: userId
      }) as any;
      
    if (error) {
      // Fallback if the RPC function doesn't exist
      try {
        const { data: insertData, error: insertError } = await supabase
          .from('event_attendees')
          .insert({
            event_id: eventId,
            user_id: userId
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return insertData;
      } catch (fallbackError) {
        console.error("Error registering for event:", fallbackError);
        throw fallbackError;
      }
    }
    
    return data;
  },
  
  /**
   * Unregister user from event
   */
  unregisterFromEvent: async (eventId: string, userId: string) => {
    // Using raw SQL through rpc since event_attendees may not be in the types
    const { data, error } = await supabase
      .rpc('unregister_from_event', {
        p_event_id: eventId,
        p_user_id: userId
      }) as any;
      
    if (error) {
      // Fallback if the RPC function doesn't exist
      try {
        const { error: deleteError } = await supabase
          .from('event_attendees')
          .delete()
          .match({
            event_id: eventId,
            user_id: userId
          });
        
        if (deleteError) throw deleteError;
        return true;
      } catch (fallbackError) {
        console.error("Error unregistering from event:", fallbackError);
        throw fallbackError;
      }
    }
    
    return true;
  },
  
  /**
   * Check if user is registered for event
   */
  isUserRegistered: async (eventId: string, userId: string): Promise<boolean> => {
    // Using raw SQL through rpc since event_attendees may not be in the types
    const { data, error } = await supabase
      .rpc('is_user_registered_for_event', {
        p_event_id: eventId,
        p_user_id: userId
      }) as any;
      
    if (error) {
      // Fallback if the RPC function doesn't exist
      try {
        const { data: attendeeData, error: attendeeError } = await supabase
          .from('event_attendees')
          .select('id')
          .match({
            event_id: eventId,
            user_id: userId
          })
          .maybeSingle();
        
        if (attendeeError) throw attendeeError;
        return attendeeData !== null;
      } catch (fallbackError) {
        console.error("Error checking registration:", fallbackError);
        throw fallbackError;
      }
    }
    
    return Boolean(data);
  }
};
