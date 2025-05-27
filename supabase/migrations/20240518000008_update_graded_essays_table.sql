-- Update graded_essays table to include more fields and relationships
ALTER TABLE IF EXISTS graded_essays
  ADD COLUMN IF NOT EXISTS submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rubric_id UUID REFERENCES rubrics(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS classroom_id UUID REFERENCES classrooms(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL;

-- Enable realtime for graded_essays table if not already enabled
alter publication supabase_realtime add table graded_essays;

-- Set up access policies for graded_essays table
DROP POLICY IF EXISTS "Teachers can view graded essays they created";
CREATE POLICY "Teachers can view graded essays they created"
  ON graded_essays FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Students can view their own graded essays";
CREATE POLICY "Students can view their own graded essays"
  ON graded_essays FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM submissions
    WHERE submissions.id = graded_essays.submission_id
    AND submissions.student_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Teachers can insert graded essays";
CREATE POLICY "Teachers can insert graded essays"
  ON graded_essays FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can update graded essays they created";
CREATE POLICY "Teachers can update graded essays they created"
  ON graded_essays FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can delete graded essays they created";
CREATE POLICY "Teachers can delete graded essays they created"
  ON graded_essays FOR DELETE
  USING (user_id = auth.uid());
