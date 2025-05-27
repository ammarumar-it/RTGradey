-- Create rubrics table
CREATE TABLE IF NOT EXISTS rubrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  grade_type TEXT CHECK (grade_type IN ('levels', 'points')),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0
);

-- Enable realtime for rubrics table
alter publication supabase_realtime add table rubrics;

-- Set up access policies for rubrics table
DROP POLICY IF EXISTS "Users can view their own rubrics";
CREATE POLICY "Users can view their own rubrics"
  ON rubrics FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own rubrics";
CREATE POLICY "Users can insert their own rubrics"
  ON rubrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own rubrics";
CREATE POLICY "Users can update their own rubrics"
  ON rubrics FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own rubrics";
CREATE POLICY "Users can delete their own rubrics"
  ON rubrics FOR DELETE
  USING (auth.uid() = user_id);
