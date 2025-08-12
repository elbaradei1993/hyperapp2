import { supabase } from "@/integrations/supabase/client";

export type Community = {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  owner_id: string;
  created_at: string;
};

export const CommunitiesService = {
  getMyCommunities: async (): Promise<Community[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('community_members')
      .select('community_id, communities:community_id ( id, name, description, is_public, owner_id, created_at )')
      .eq('user_id', user.id);

    if (error) throw error;
    return (data || []).map((r: any) => r.communities) as Community[];
  },

  getPublicCommunities: async (limit = 20): Promise<Community[]> => {
    const { data, error } = await supabase
      .from('communities')
      .select('id, name, description, is_public, owner_id, created_at')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as Community[];
  },

  createCommunity: async (name: string, description: string, isPublic: boolean): Promise<Community> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be signed in');

    const { data, error } = await supabase
      .from('communities')
      .insert({ name, description, is_public: isPublic, owner_id: user.id })
      .select('*')
      .single();

    if (error) throw error;

    // Ensure owner is a member
    await supabase
      .from('community_members')
      .insert({ community_id: data.id, user_id: user.id, role: 'owner' });

    return data as Community;
  },

  joinCommunity: async (communityId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be signed in');

    const { error } = await supabase
      .from('community_members')
      .insert({ community_id: communityId, user_id: user.id, role: 'member' });

    if (error) throw error;
  },

  leaveCommunity: async (communityId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be signed in');

    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  getMyMemberships: async (): Promise<Array<{ role: string; community: Community }>> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('community_members')
      .select('role, community_id, communities:community_id ( id, name, description, is_public, owner_id, created_at )')
      .eq('user_id', user.id);

    if (error) throw error;
    return (data || []).map((r: any) => ({ role: r.role as string, community: r.communities as Community }));
  }
};
