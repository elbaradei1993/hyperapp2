-- Fix organizer_id column type to match auth.users UUID format
ALTER TABLE public.events 
ALTER COLUMN organizer_id TYPE uuid USING organizer_id::text::uuid;

-- Add foreign key constraint to link with auth.users
ALTER TABLE public.events 
ADD CONSTRAINT events_organizer_id_fkey 
FOREIGN KEY (organizer_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix vibe_reports user_id to use UUID type  
ALTER TABLE public.vibe_reports 
ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;

-- Add foreign key constraint for vibe_reports
ALTER TABLE public.vibe_reports 
ADD CONSTRAINT vibe_reports_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;