-- Create enum for community roles
CREATE TYPE public.community_role AS ENUM ('owner', 'admin', 'member');

-- Communities table
CREATE TABLE public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on communities
CREATE TRIGGER trg_update_communities_updated_at
BEFORE UPDATE ON public.communities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Community members table
CREATE TABLE public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.community_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (community_id, user_id)
);

ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Join tables to link existing resources
CREATE TABLE public.event_communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id INTEGER NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  UNIQUE (event_id, community_id)
);

ALTER TABLE public.event_communities ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.vibe_report_communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vibe_report_id INTEGER NOT NULL REFERENCES public.vibe_reports(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  UNIQUE (vibe_report_id, community_id)
);

ALTER TABLE public.vibe_report_communities ENABLE ROW LEVEL SECURITY;

-- Helper function to check membership
CREATE OR REPLACE FUNCTION public.is_community_member(_user_id uuid, _community_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_members m
    WHERE m.user_id = _user_id AND m.community_id = _community_id
  );
$$;

-- Policies for communities
CREATE POLICY "Communities are viewable by members or if public"
ON public.communities FOR SELECT
USING (
  is_public = TRUE OR public.is_community_member(auth.uid(), id)
);

CREATE POLICY "Authenticated users can create communities"
ON public.communities FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND owner_id = auth.uid()
);

CREATE POLICY "Owners can update their community"
ON public.communities FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their community"
ON public.communities FOR DELETE
USING (owner_id = auth.uid());

-- Policies for community_members
CREATE POLICY "Members can view memberships in their communities or public communities"
ON public.community_members FOR SELECT
USING (
  user_id = auth.uid()
  OR public.is_community_member(auth.uid(), community_id)
  OR EXISTS (
    SELECT 1 FROM public.communities c WHERE c.id = community_id AND c.is_public = TRUE
  )
);

CREATE POLICY "Authenticated users can join communities for themselves"
ON public.community_members FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND user_id = auth.uid()
);

CREATE POLICY "Members or owners can remove memberships"
ON public.community_members FOR DELETE
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.communities c WHERE c.id = community_id AND c.owner_id = auth.uid()
  )
);

-- Policies for event_communities
CREATE POLICY "View event-community links if community is public or member"
ON public.event_communities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.communities c 
    WHERE c.id = community_id AND 
      (c.is_public = TRUE OR public.is_community_member(auth.uid(), c.id))
  )
);

CREATE POLICY "Members can link events to their communities"
ON public.event_communities FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND 
  EXISTS (
    SELECT 1 FROM public.communities c 
    WHERE c.id = community_id AND 
      (c.owner_id = auth.uid() OR public.is_community_member(auth.uid(), c.id))
  )
);

-- Policies for vibe_report_communities
CREATE POLICY "View vibe-community links if community is public or member"
ON public.vibe_report_communities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.communities c 
    WHERE c.id = community_id AND 
      (c.is_public = TRUE OR public.is_community_member(auth.uid(), c.id))
  )
);

CREATE POLICY "Members can link vibe reports to their communities"
ON public.vibe_report_communities FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND 
  EXISTS (
    SELECT 1 FROM public.communities c 
    WHERE c.id = community_id AND 
      (c.owner_id = auth.uid() OR public.is_community_member(auth.uid(), c.id))
  )
);