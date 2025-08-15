-- Secure sos_alerts: remove public visibility, reduce window, preserve own access
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'sos_alerts' 
      AND policyname = 'Limited view of active SOS alerts'
  ) THEN
    EXECUTE 'DROP POLICY "Limited view of active SOS alerts" ON public.sos_alerts';
  END IF;
END $$;

-- Recreate authenticated recent-view policy with shorter window (2 hours)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'sos_alerts' 
      AND policyname = 'Authenticated users can view recent SOS details'
  ) THEN
    EXECUTE 'DROP POLICY "Authenticated users can view recent SOS details" ON public.sos_alerts';
  END IF;

  CREATE POLICY "Authenticated users can view recent SOS details"
  ON public.sos_alerts
  FOR SELECT
  TO authenticated
  USING (
    (auth.role() = 'authenticated') AND (status = 'active') AND (created_at > (now() - interval '2 hours'))
  );
END $$;

-- Allow users to view ALL their own alerts regardless of status/time
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'sos_alerts' 
      AND policyname = 'Users can view their own SOS alerts'
  ) THEN
    CREATE POLICY "Users can view their own SOS alerts"
    ON public.sos_alerts
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;
