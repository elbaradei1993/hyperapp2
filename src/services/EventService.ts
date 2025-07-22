import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface EventData {
  title: string;
  description?: string;
  location: string;
  latitude: string; // Changed to required
  longitude: string; // Changed to required
  start_date_time: string;
  end_date_time: string;
  image_url?: string;
  organization_id?: string;
  organizer_id?: string; // Add organizer_id field
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
  start_date_time: string;
  end_date_time: string;
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
    // Get current user to map UUID to integer organizer_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to create events');
    }

    // Create or get user ID mapping (we'll use a hash of the UUID for now)
    const userIdHash = user.id.split('-').join('').substring(0, 8);
    const organizer_id = parseInt(userIdHash, 16) % 2147483647; // Convert to valid integer

    // Ensure the data structure matches the database schema
    const eventRecord = {
      title: eventData.title,
      description: eventData.description,
      latitude: eventData.latitude,
      longitude: eventData.longitude,
      start_date_time: eventData.start_date_time,
      end_date_time: eventData.end_date_time,
      organizer_id: organizer_id, // Use the hashed integer ID
      poster_url: eventData.image_url, // Map image_url to poster_url
      vibe_type_id: eventData.vibe_type_id,
      max_attendees: eventData.max_attendees,
      is_paid: eventData.is_public === false, // Invert is_public to is_paid
      address: eventData.address || eventData.location // Use address or location
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
      .eq('is_featured', false) // Assuming we only want non-featured events
      .order('start_date_time')
      .limit(limit);
      
    if (error) throw error;
    
    // Convert database response to EventResponse type
    return (data || []).map(item => ({
      id: item.id.toString(), // Convert to string
      title: item.title,
      description: item.description,
      location: item.address || '', // Use address as location
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
      start_date_time: item.start_date_time,
      end_date_time: item.end_date_time,
      image_url: item.poster_url, // Map poster_url to image_url
      organization_id: item.organizer_id ? item.organizer_id.toString() : null, // Map organizer_id to organization_id
      created_at: item.created_at,
      updated_at: null, // Our DB doesn't have updated_at
      is_public: !item.is_paid, // Assuming paid events are not public
      vibe_type_id: item.vibe_type_id,
      max_attendees: item.max_attendees,
      current_attendees: 0, // Default value
      status: 'active' // Default value
    }));
  },
  
  /**
   * Get event by ID
   */
  getEventById: async (id: string): Promise<EventResponse | null> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', parseInt(id, 10))
      .maybeSingle();
      
    if (error) throw error;
    
    if (!data) return null;
    
    // Convert database response to EventResponse type
    return {
      id: data.id.toString(),
      title: data.title,
      description: data.description,
      location: data.address || '',
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      start_date_time: data.start_date_time,
      end_date_time: data.end_date_time,
      image_url: data.poster_url, // Map poster_url to image_url
      organization_id: data.organizer_id ? data.organizer_id.toString() : null,
      created_at: data.created_at,
      updated_at: null, // Our DB doesn't have updated_at
      is_public: !data.is_paid,
      vibe_type_id: data.vibe_type_id,
      max_attendees: data.max_attendees,
      current_attendees: 0, // Default value
      status: 'active' // Default value
    };
  },
  
  /**
   * Get events created by an organization
   */
  getOrganizationEvents: async (organizationId: string): Promise<EventResponse[]> => {
    // Convert UUID to the same hash format we use for creation
    const userIdHash = organizationId.split('-').join('').substring(0, 8);
    const organizer_id = parseInt(userIdHash, 16) % 2147483647;
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', organizer_id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Convert database response to EventResponse type
    return (data || []).map(item => ({
      id: item.id.toString(),
      title: item.title,
      description: item.description,
      location: item.address || '',
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
      start_date_time: item.start_date_time,
      end_date_time: item.end_date_time,
      image_url: item.poster_url, // Map poster_url to image_url
      organization_id: item.organizer_id ? item.organizer_id.toString() : null,
      created_at: item.created_at,
      updated_at: null, // Our DB doesn't have updated_at
      is_public: !item.is_paid,
      vibe_type_id: item.vibe_type_id,
      max_attendees: item.max_attendees,
      current_attendees: 0, // Default value
      status: 'active' // Default value
    }));
  },
  
  /**
   * Register user for event
   */
  registerForEvent: async (eventId: string, userId: string) => {
    try {
      // Since there's no event_attendees table, we'll need to implement this
      // differently or create the table first in a SQL migration
      console.log('Registering user', userId, 'for event', eventId);
      
      // For now, let's just return a mock success response
      return {
        eventId: parseInt(eventId, 10),
        userId: parseInt(userId, 10),
        createdAt: new Date().toISOString()
      };
      
      /* Uncomment and modify if event_attendees table exists
      const { data, error } = await supabase
        .from('event_attendees')
        .insert({
          event_id: parseInt(eventId, 10),
          user_id: parseInt(userId, 10)
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
      */
    } catch (error) {
      console.error("Error registering for event:", error);
      throw error;
    }
  },
  
  /**
   * Unregister user from event
   */
  unregisterFromEvent: async (eventId: string, userId: string) => {
    try {
      // Since there's no event_attendees table, we'll need to implement this
      // differently or create the table first in a SQL migration
      console.log('Unregistering user', userId, 'from event', eventId);
      
      // For now, let's just return a mock success response
      return true;
      
      /* Uncomment and modify if event_attendees table exists
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .match({
          event_id: parseInt(eventId, 10),
          user_id: parseInt(userId, 10)
        });
      
      if (error) throw error;
      return true;
      */
    } catch (error) {
      console.error("Error unregistering from event:", error);
      throw error;
    }
  },
  
  /**
   * Check if user is registered for event
   */
  isUserRegistered: async (eventId: string, userId: string): Promise<boolean> => {
    try {
      // Since there's no event_attendees table, we'll need to implement this
      // differently or create the table first in a SQL migration
      console.log('Checking if user', userId, 'is registered for event', eventId);
      
      // For now, let's just return a mock response
      return false;
      
      /* Uncomment and modify if event_attendees table exists
      const { data, error } = await supabase
        .from('event_attendees')
        .select('id')
        .match({
          event_id: parseInt(eventId, 10),
          user_id: parseInt(userId, 10)
        })
        .maybeSingle();
      
      if (error) throw error;
      return data !== null;
      */
    } catch (error) {
      console.error("Error checking registration:", error);
      throw error;
    }
  }
};
