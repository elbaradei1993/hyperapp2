-- Tighten access to precise coordinates in vibe_reports and add public anonymized RPC

-- 1) Drop existing public SELECT policy if exists and replace with authenticated-only
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'vibe_reports' 
      AND policyname = 'Anyone can view vibe reports'
  ) THEN
    EXECUTE 'DROP POLICY "Anyone can view vibe reports" ON public.vibe_reports';
  END IF;
END $$;

-- Ensure RLS is enabled (safety)
ALTER TABLE public.vibe_reports ENABLE ROW LEVEL SECURITY;

-- Create authenticated-only SELECT policy if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'vibe_reports' 
      AND policyname = 'Authenticated users can view vibe reports'
  ) THEN
    CREATE POLICY "Authenticated users can view vibe reports"
    ON public.vibe_reports
    FOR SELECT
    TO authenticated
    USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- 2) Create SECURITY DEFINER RPC to return anonymized, recent vibe reports for public use
CREATE OR REPLACE FUNCTION public.get_public_vibe_reports(_limit integer DEFAULT 100)
RETURNS TABLE (
  id integer,
  title text,
  description text,
  latitude text,
  longitude text,
  created_at timestamp without time zone,
  confirmed_count integer,
  vibe_type_id integer,
  vibe_type_name text,
  vibe_type_color text
) AS $$
  SELECT 
    v.id,
    v.title,
    v.description,
    -- Round to ~1.1km precision to mitigate tracking
    round((v.latitude::numeric), 2)::text AS latitude,
    round((v.longitude::numeric), 2)::text AS longitude,
    v.created_at,
    v.confirmed_count,
    v.vibe_type_id,
    t.name AS vibe_type_name,
    t.color AS vibe_type_color
  FROM public.vibe_reports v
  JOIN public.vibe_types t ON t.id = v.vibe_type_id
  WHERE v.created_at > now() - interval '48 hours'
  ORDER BY v.confirmed_count DESC, v.created_at DESC
  LIMIT LEAST(_limit, 500);
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_public_vibe_reports(integer) TO anon, authenticated;
