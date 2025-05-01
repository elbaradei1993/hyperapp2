
-- Insert default vibe types if they don't exist
INSERT INTO vibe_types (name, color)
VALUES
  ('Calm', '#0EA5E9'),
  ('Dangerous', '#F43F5E'),
  ('Noisy', '#FACC15'),
  ('LGBTQIA+ Friendly', '#8B5CF6'),
  ('Family Friendly', '#4ADE80'),
  ('Party', '#FB923C'),
  ('Romantic', '#EC4899'),
  ('Workout', '#2DD4BF'),
  ('Study', '#6366F1')
ON CONFLICT (name) DO NOTHING;
