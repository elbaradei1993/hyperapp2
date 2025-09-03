-- Create posts table for community discussions
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table for post discussions  
CREATE TABLE public.community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on posts
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on comments
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Members can view posts in their communities or public communities"
ON public.community_posts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.communities c 
    WHERE c.id = community_posts.community_id 
    AND (c.is_public = true OR is_community_member(auth.uid(), c.id))
  )
);

CREATE POLICY "Community members can create posts"
ON public.community_posts
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  is_community_member(auth.uid(), community_id)
);

CREATE POLICY "Authors can update their own posts"
ON public.community_posts
FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own posts"
ON public.community_posts
FOR DELETE
USING (auth.uid() = author_id);

-- Comments policies
CREATE POLICY "Members can view comments in their communities or public communities"
ON public.community_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.community_posts p
    JOIN public.communities c ON c.id = p.community_id
    WHERE p.id = community_comments.post_id
    AND (c.is_public = true OR is_community_member(auth.uid(), c.id))
  )
);

CREATE POLICY "Community members can create comments"
ON public.community_comments
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.community_posts p
    WHERE p.id = community_comments.post_id
    AND is_community_member(auth.uid(), p.community_id)
  )
);

CREATE POLICY "Authors can update their own comments"
ON public.community_comments
FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own comments"
ON public.community_comments
FOR DELETE
USING (auth.uid() = author_id);

-- Add triggers for updated_at
CREATE TRIGGER update_community_posts_updated_at
BEFORE UPDATE ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_comments_updated_at
BEFORE UPDATE ON public.community_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();