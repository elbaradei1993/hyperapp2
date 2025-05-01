
-- Function to safely increment a column value in a table
CREATE OR REPLACE FUNCTION increment_column_value(
  p_table_name TEXT,
  p_column_name TEXT,
  p_row_id INTEGER,
  p_increment INTEGER
) RETURNS VOID AS $$
DECLARE
  query TEXT;
BEGIN
  -- Validate table name to prevent SQL injection
  IF p_table_name NOT IN ('vibe_reports', 'profiles') THEN
    RAISE EXCEPTION 'Invalid table name: %', p_table_name;
  END IF;
  
  -- Validate column name to prevent SQL injection
  IF p_column_name NOT IN ('confirmed_count', 'points', 'reputation') THEN
    RAISE EXCEPTION 'Invalid column name: %', p_column_name;
  END IF;
  
  -- Construct and execute the update query
  query := format(
    'UPDATE %I SET %I = %I + $1 WHERE id = $2',
    p_table_name,
    p_column_name,
    p_column_name
  );
  
  EXECUTE query USING p_increment, p_row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
