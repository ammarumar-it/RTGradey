-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('draft', 'submitted', 'graded')) DEFAULT 'submitted',
  UNIQUE(assignment_id, student_id)
);

-- Enable realtime for submissions table
alter publication supabase_realtime add table submissions;

-- Set up access policies for submissions table
DROP POLICY IF EXISTS "Teachers can view submissions for their assignments";
CREATE POLICY "Teachers can view submissions for their assignments"
  ON submissions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM assignments
    JOIN classrooms ON assignments.classroom_id = classrooms.id
    WHERE assignments.id = submissions.assignment_id
    AND classrooms.teacher_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Students can view their own submissions";
CREATE POLICY "Students can view their own submissions"
  ON submissions FOR SELECT
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can insert their own submissions";
CREATE POLICY "Students can insert their own submissions"
  ON submissions FOR INSERT
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can update their own submissions";
CREATE POLICY "Students can update their own submissions"
  ON submissions FOR UPDATE
  USING (student_id = auth.uid() AND status = 'draft');

DROP POLICY IF EXISTS "Teachers can update submissions for grading";
CREATE POLICY "Teachers can update submissions for grading"
  ON submissions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM assignments
    JOIN classrooms ON assignments.classroom_id = classrooms.id
    WHERE assignments.id = submissions.assignment_id
    AND classrooms.teacher_id = auth.uid()
  ));
