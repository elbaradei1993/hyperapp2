-- Create the missing increment_vibe_count function
CREATE OR REPLACE FUNCTION public.increment_vibe_count(report_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.vibe_reports 
  SET confirmed_count = confirmed_count + 1 
  WHERE id = report_id;
END;
$$;