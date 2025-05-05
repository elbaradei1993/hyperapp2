
-- Create a saved_vibes table for users to bookmark vibes
CREATE TABLE IF NOT EXISTS public.saved_vibes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  vibe_id INTEGER NOT NULL REFERENCES public.vibe_reports(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, vibe_id)
);

-- Enable Row Level Security
ALTER TABLE public.saved_vibes ENABLE ROW LEVEL SECURITY;

-- Create policies to allow users to manage their own saved vibes
CREATE POLICY "Users can view their own saved vibes"
  ON public.saved_vibes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add vibes to saved collection"
  ON public.saved_vibes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved vibes"
  ON public.saved_vibes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Make sure we have necessary columns in the profile table
ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'individual',
  ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": true, "vibes": true, "events": true, "alerts": true}'::jsonb;
