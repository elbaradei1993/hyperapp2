-- Create trigger to automatically add new users to the mapping table
CREATE OR REPLACE FUNCTION public.handle_new_user_mapping()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create trigger for automatic user mapping on signup
DROP TRIGGER IF EXISTS on_auth_user_created_mapping ON auth.users;
CREATE TRIGGER on_auth_user_created_mapping
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_mapping();