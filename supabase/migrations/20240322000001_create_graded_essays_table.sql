-- Create graded essays table to store essay grading history
CREATE TABLE IF NOT EXISTS graded_essays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT,
  assignment_title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  answer TEXT NOT NULL,
  summary TEXT NOT NULL,
  feedback JSONB NOT NULL,
  rubric JSONB NOT NULL,
  total_score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE graded_essays ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own graded essays" ON graded_essays;
CREATE POLICY "Users can view their own graded essays"
  ON graded_essays FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own graded essays" ON graded_essays;
CREATE POLICY "Users can insert their own graded essays"
  ON graded_essays FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own graded essays" ON graded_essays;
CREATE POLICY "Users can update their own graded essays"
  ON graded_essays FOR UPDATE
  USING (auth.uid() = user_id);

-- Add to realtime
alter publication supabase_realtime add table graded_essays;