-- 1) Robust user mapping + users row sync and corrected policies
-- Create function to ensure mapping and users row
CREATE OR REPLACE FUNCTION public.ensure_user_mapping_for_user(user_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  int_id integer;
  user_email text;
  user_name text;
BEGIN
  -- Try existing mapping
  SELECT integer_id INTO int_id FROM public.user_mapping WHERE uuid_id = user_uuid;

  IF int_id IS NULL THEN
    -- Deterministically derive an integer id from UUID (first 8 hex)
    int_id := (('x' || substring(replace(user_uuid::text, '-', ''), 1, 8))::bit(32))::int;

    -- Insert mapping if missing
    INSERT INTO public.user_mapping (uuid_id, integer_id)
    VALUES (user_uuid, int_id)
    ON CONFLICT (uuid_id) DO NOTHING;
  END IF;

  -- Fetch auth user data
  SELECT email, raw_user_meta_data->>'name' INTO user_email, user_name
  FROM auth.users WHERE id = user_uuid;

  -- Ensure a record exists in public.users with the mapped integer id to satisfy FKs
  INSERT INTO public.users (id, email, username, password)
  VALUES (
    COALESCE(int_id, (('x' || substring(replace(user_uuid::text, '-', ''), 1, 8))::bit(32))::int),
    COALESCE(user_email, concat('user+', substring(user_uuid::text, 1, 8), '@example.com')),
    COALESCE(user_name, substring(user_uuid::text, 1, 12)),
    'external-auth'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Return ensured integer id
  SELECT integer_id INTO int_id FROM public.user_mapping WHERE uuid_id = user_uuid;
  RETURN int_id;
END;
$$;

-- Trigger wrapper to sync on auth.users creation
CREATE OR REPLACE FUNCTION public.on_auth_user_created_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  PERFORM public.ensure_user_mapping_for_user(NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users (if not exists, drop first to be idempotent)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger t 
    JOIN pg_class c ON c.oid = t.tgrelid 
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'on_auth_user_created_sync_trg'
  ) THEN
    DROP TRIGGER on_auth_user_created_sync_trg ON auth.users;
  END IF;
END $$;

CREATE TRIGGER on_auth_user_created_sync_trg
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.on_auth_user_created_sync();

-- 2) Fix RLS policies comparing uuid to integer by using mapping helper
-- Users table policies
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='Users can insert their own data') THEN
    DROP POLICY "Users can insert their own data" ON public.users;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='Users can update their own data') THEN
    DROP POLICY "Users can update their own data" ON public.users;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='Users can view their own data') THEN
    DROP POLICY "Users can view their own data" ON public.users;
  END IF;
END $$;

CREATE POLICY "Users can insert their own data"
ON public.users FOR INSERT
WITH CHECK (public.get_user_integer_id(auth.uid()) = id);

CREATE POLICY "Users can update their own data"
ON public.users FOR UPDATE
USING (public.get_user_integer_id(auth.uid()) = id);

CREATE POLICY "Users can view their own data"
ON public.users FOR SELECT
USING (public.get_user_integer_id(auth.uid()) = id);

-- Events update/delete policies should use mapping as well
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='events' AND policyname='Users can delete their own events') THEN
    DROP POLICY "Users can delete their own events" ON public.events;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='events' AND policyname='Users can update their own events') THEN
    DROP POLICY "Users can update their own events" ON public.events;
  END IF;
END $$;

CREATE POLICY "Users can delete their own events"
ON public.events FOR DELETE
USING (public.get_user_integer_id(auth.uid()) = organizer_id);

CREATE POLICY "Users can update their own events"
ON public.events FOR UPDATE
USING (public.get_user_integer_id(auth.uid()) = organizer_id);

-- Ensure realtime works well on these tables (optional but recommended for updates)
ALTER TABLE public.vibe_reports REPLICA IDENTITY FULL;
ALTER TABLE public.sos_alerts REPLICA IDENTITY FULL;