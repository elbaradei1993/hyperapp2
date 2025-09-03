import { supabase } from "@/integrations/supabase/client";

export interface CommunityPost {
  id: string;
  community_id: string;
  author_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: {
    name?: string;
    username?: string;
    email?: string;
  };
  comments_count?: number;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: {
    name?: string;
    username?: string;
    email?: string;
  };
}

export const CommunityPostsService = {
  async getCommunityPosts(communityId: string): Promise<CommunityPost[]> {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .eq('community_id', communityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createPost(communityId: string, title: string, content: string): Promise<CommunityPost> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be authenticated');

    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        community_id: communityId,
        author_id: user.id,
        title: title.trim(),
        content: content.trim()
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async getPostComments(postId: string): Promise<CommunityComment[]> {
    const { data, error } = await supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createComment(postId: string, content: string): Promise<CommunityComment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be authenticated');

    const { data, error } = await supabase
      .from('community_comments')
      .insert({
        post_id: postId,
        author_id: user.id,
        content: content.trim()
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async deletePost(postId: string): Promise<void> {
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
  },

  async deleteComment(commentId: string): Promise<void> {
    const { error } = await supabase
      .from('community_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  }
};