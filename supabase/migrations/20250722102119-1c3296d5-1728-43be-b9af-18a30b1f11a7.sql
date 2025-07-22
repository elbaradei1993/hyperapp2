-- Create user mapping table to link UUIDs to integers temporarily
CREATE TABLE IF NOT EXISTS public.user_mapping (
    uuid_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    integer_id integer UNIQUE NOT NULL
);

-- Insert mapping for existing users (create deterministic mapping)
INSERT INTO public.user_mapping (uuid_id, integer_id)
SELECT 
    id as uuid_id,
    ('x' || substring(replace(id::text, '-', ''), 1, 8))::bit(32)::int as integer_id
FROM auth.users
ON CONFLICT (uuid_id) DO NOTHING;

-- Create a function to get integer ID from UUID
CREATE OR REPLACE FUNCTION public.get_user_integer_id(user_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT integer_id FROM public.user_mapping WHERE uuid_id = user_uuid;
$$;