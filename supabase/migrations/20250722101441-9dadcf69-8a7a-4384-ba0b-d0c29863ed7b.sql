-- First, drop the policies that depend on organizer_id
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;

-- Now change the column types
ALTER TABLE public.events 
ALTER COLUMN organizer_id TYPE uuid USING organizer_id::text::uuid;

ALTER TABLE public.vibe_reports 
ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;

-- Recreate the policies with proper UUID comparison
CREATE POLICY "Users can update their own events" 
ON public.events 
FOR UPDATE 
USING (auth.uid() = organizer_id);

CREATE POLICY "Users can delete their own events" 
ON public.events 
FOR DELETE 
USING (auth.uid() = organizer_id);

-- Add foreign key constraints
ALTER TABLE public.events 
ADD CONSTRAINT events_organizer_id_fkey 
FOREIGN KEY (organizer_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.vibe_reports 
ADD CONSTRAINT vibe_reports_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;