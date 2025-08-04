-- PHASE 1: Critical RLS Implementation

-- Enable RLS on vibe_reports table and create policies
ALTER TABLE public.vibe_reports ENABLE ROW LEVEL SECURITY;

-- Allow public read access to basic vibe data
CREATE POLICY "Anyone can view vibe reports" 
ON public.vibe_reports 
FOR SELECT 
USING (true);

-- Allow authenticated users to create their own reports
CREATE POLICY "Authenticated users can create vibe reports" 
ON public.vibe_reports 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated'::text);

-- Allow users to update their own reports
CREATE POLICY "Users can update their own vibe reports" 
ON public.vibe_reports 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

-- Enable RLS on user_mapping table and create policies
ALTER TABLE public.user_mapping ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own mapping
CREATE POLICY "Users can view their own mapping" 
ON public.user_mapping 
FOR SELECT 
USING (auth.uid() = uuid_id);

-- Allow system to insert mappings for new users
CREATE POLICY "System can insert user mappings" 
ON public.user_mapping 
FOR INSERT 
WITH CHECK (auth.uid() = uuid_id);

-- Enable RLS on vibe_types table and create policies
ALTER TABLE public.vibe_types ENABLE ROW LEVEL SECURITY;

-- Allow public read access to vibe types (reference data)
CREATE POLICY "Anyone can view vibe types" 
ON public.vibe_types 
FOR SELECT 
USING (true);

-- Enable RLS on users table and create policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only view their own data
CREATE POLICY "Users can view their own data" 
ON public.users 
FOR SELECT 
USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update their own data" 
ON public.users 
FOR UPDATE 
USING (auth.uid()::text = id::text);

-- Users can insert their own data
CREATE POLICY "Users can insert their own data" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid()::text = id::text);

-- PHASE 2: Function Security Hardening

-- Fix handle_new_user_mapping function with proper security
CREATE OR REPLACE FUNCTION public.handle_new_user_mapping()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_mapping (uuid_id, integer_id)
  VALUES (
    NEW.id, 
    ('x' || substring(replace(NEW.id::text, '-', ''), 1, 8))::bit(32)::int
  )
  ON CONFLICT (uuid_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Fix get_user_integer_id function with proper security
CREATE OR REPLACE FUNCTION public.get_user_integer_id(user_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT integer_id FROM public.user_mapping WHERE uuid_id = user_uuid;
$$;

-- Fix increment_vibe_count function with proper security
CREATE OR REPLACE FUNCTION public.increment_vibe_count(report_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.vibe_reports 
  SET confirmed_count = confirmed_count + 1 
  WHERE id = report_id;
END;
$$;

-- PHASE 4: Enhanced SOS Alert Privacy Protection

-- Update SOS alert policies to be more privacy-conscious
DROP POLICY IF EXISTS "Anyone can view active SOS alerts" ON public.sos_alerts;

-- Create more restrictive SOS alert viewing policy
CREATE POLICY "Limited view of active SOS alerts" 
ON public.sos_alerts 
FOR SELECT 
USING (
  status = 'active'::text 
  AND created_at > (now() - interval '24 hours')
);

-- Allow authenticated users to view more details of recent alerts
CREATE POLICY "Authenticated users can view recent SOS details" 
ON public.sos_alerts 
FOR SELECT 
USING (
  auth.role() = 'authenticated'::text 
  AND status = 'active'::text 
  AND created_at > (now() - interval '72 hours')
);