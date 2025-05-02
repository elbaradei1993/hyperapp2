
import { supabase } from '@/integrations/supabase/client';

export interface EventData {
  title: string;
  description?: string;
  location: string;
  latitude?: string;
  longitude?: string;
  start_date: Date;
  end_date: Date;
  image_url?: string;
  organization_id?: string;
  vibe_type_id?: number;
  max_attendees?: number;
  is_public?: boolean;
}

export interface EventResponse {
  id: string;
  title: string;
  description: string | null;
  location: string;
  latitude: string | null;
  longitude: string | null;
  start_date: string;
  end_date: string;
  image_url: string | null;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
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
    const { data, error } = await supabase
      .from('events')
      .insert({
        ...eventData,
        start_date: eventData.start_date.toISOString(),
        end_date: eventData.end_date.toISOString()
      })
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
      .order('start_date')
      .limit(limit);
      
    if (error) throw error;
    return data || [];
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
    return data;
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
    return data || [];
  },
  
  /**
   * Register user for event
   */
  registerForEvent: async (eventId: string, userId: string) => {
    const { data, error } = await supabase
      .from('event_attendees')
      .insert({
        event_id: eventId,
        user_id: userId
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  /**
   * Unregister user from event
   */
  unregisterFromEvent: async (eventId: string, userId: string) => {
    const { error } = await supabase
      .from('event_attendees')
      .delete()
      .match({
        event_id: eventId,
        user_id: userId
      });
      
    if (error) throw error;
    return true;
  },
  
  /**
   * Check if user is registered for event
   */
  isUserRegistered: async (eventId: string, userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('event_attendees')
      .select('id')
      .match({
        event_id: eventId,
        user_id: userId
      })
      .maybeSingle();
      
    if (error) throw error;
    return data !== null;
  }
};
