-- Fix critical security issues with RLS policies

-- 1. Fix SOS alerts - only allow viewing for nearby users (within 5km) or emergency responders
DROP POLICY IF EXISTS "Authenticated users can view recent SOS details" ON sos_alerts;

CREATE POLICY "Users can view nearby active SOS alerts" 
ON sos_alerts 
FOR SELECT 
USING (
  auth.role() = 'authenticated'::text 
  AND status = 'active'::text 
  AND created_at > (now() - interval '2 hours')
  AND (
    -- Allow viewing own alerts
    auth.uid() = user_id
    OR
    -- Allow viewing alerts within 5km radius (using approximate distance)
    (
      abs(latitude::numeric - (
        SELECT COALESCE(
          (profiles.settings->>'last_lat')::numeric, 
          0
        ) 
        FROM profiles 
        WHERE id = auth.uid()
      )) < 0.045  -- ~5km in degrees
      AND
      abs(longitude::numeric - (
        SELECT COALESCE(
          (profiles.settings->>'last_lng')::numeric, 
          0
        ) 
        FROM profiles 
        WHERE id = auth.uid()
      )) < 0.045
    )
  )
);

-- 2. Fix vibe reports - limit to community members or nearby users
DROP POLICY IF EXISTS "Authenticated users can view vibe reports" ON vibe_reports;

CREATE POLICY "Users can view community or nearby vibe reports" 
ON vibe_reports 
FOR SELECT 
USING (
  auth.role() = 'authenticated'::text 
  AND (
    -- Own reports
    (user_id::text = auth.uid()::text)
    OR
    -- Reports in communities user is member of
    EXISTS (
      SELECT 1 FROM vibe_report_communities vrc
      JOIN community_members cm ON cm.community_id = vrc.community_id
      WHERE vrc.vibe_report_id = vibe_reports.id 
      AND cm.user_id = auth.uid()
    )
    OR
    -- Reports within 10km radius
    (
      abs(latitude::numeric - (
        SELECT COALESCE(
          (profiles.settings->>'last_lat')::numeric, 
          0
        ) 
        FROM profiles 
        WHERE id = auth.uid()
      )) < 0.09  -- ~10km in degrees
      AND
      abs(longitude::numeric - (
        SELECT COALESCE(
          (profiles.settings->>'last_lng')::numeric, 
          0
        ) 
        FROM profiles 
        WHERE id = auth.uid()
      )) < 0.09
    )
  )
);

-- 3. Fix events - limit to community events or public events
DROP POLICY IF EXISTS "Anyone can view events" ON events;

CREATE POLICY "Users can view accessible events" 
ON events 
FOR SELECT 
USING (
  -- Own events
  get_user_integer_id(auth.uid()) = organizer_id
  OR
  -- Events in communities user is member of
  EXISTS (
    SELECT 1 FROM event_communities ec
    JOIN community_members cm ON cm.community_id = ec.community_id
    WHERE ec.event_id = events.id 
    AND cm.user_id = auth.uid()
  )
  OR
  -- Public events (not linked to any community)
  NOT EXISTS (
    SELECT 1 FROM event_communities ec
    WHERE ec.event_id = events.id
  )
);