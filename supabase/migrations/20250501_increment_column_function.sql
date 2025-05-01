
-- Function to safely increment a numeric column value in any table
CREATE OR REPLACE FUNCTION increment_column(
  p_table_name text,
  p_column_name text,
  p_row_id integer,
  p_increment_amount integer default 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  query text;
BEGIN
  -- Construct the update query dynamically
  query := format('UPDATE %I SET %I = COALESCE(%I, 0) + $1 WHERE id = $2',
                 p_table_name, p_column_name, p_column_name);
  
  -- Execute the query with parameters
  EXECUTE query USING p_increment_amount, p_row_id;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_column TO authenticated;
GRANT EXECUTE ON FUNCTION increment_column TO anon;
