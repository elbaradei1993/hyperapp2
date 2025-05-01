
-- Function to help with incrementing counters safely
CREATE OR REPLACE FUNCTION increment_vibe_count(
  report_id integer,
  inc_amount integer DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE vibe_reports
  SET confirmed_count = COALESCE(confirmed_count, 0) + inc_amount
  WHERE id = report_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_vibe_count TO authenticated;
GRANT EXECUTE ON FUNCTION increment_vibe_count TO anon;
