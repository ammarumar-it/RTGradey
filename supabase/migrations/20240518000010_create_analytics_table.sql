-- Create analytics table for tracking user activity and essay statistics
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  essays_graded INTEGER DEFAULT 0,
  rubrics_created INTEGER DEFAULT 0,
  average_grading_time INTEGER, -- in seconds
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for analytics table
alter publication supabase_realtime add table analytics;

-- Set up access policies for analytics table
DROP POLICY IF EXISTS "Users can view their own analytics";
CREATE POLICY "Users can view their own analytics"
  ON analytics FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can update analytics";
CREATE POLICY "System can update analytics"
  ON analytics FOR UPDATE
  USING (user_id = auth.uid());
