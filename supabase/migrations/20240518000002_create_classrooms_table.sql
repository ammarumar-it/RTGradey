-- Create classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for classrooms table
alter publication supabase_realtime add table classrooms;

-- Set up access policies for classrooms table
DROP POLICY IF EXISTS "Teachers can view their own classrooms";
CREATE POLICY "Teachers can view their own classrooms"
  ON classrooms FOR SELECT
  USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can insert their own classrooms";
CREATE POLICY "Teachers can insert their own classrooms"
  ON classrooms FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can update their own classrooms";
CREATE POLICY "Teachers can update their own classrooms"
  ON classrooms FOR UPDATE
  USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can delete their own classrooms";
CREATE POLICY "Teachers can delete their own classrooms"
  ON classrooms FOR DELETE
  USING (auth.uid() = teacher_id);
