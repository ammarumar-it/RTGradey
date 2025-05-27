-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  rubric_id UUID REFERENCES rubrics(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for assignments table
alter publication supabase_realtime add table assignments;

-- Set up access policies for assignments table
DROP POLICY IF EXISTS "Teachers can view assignments for their classrooms";
CREATE POLICY "Teachers can view assignments for their classrooms"
  ON assignments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM classrooms
    WHERE classrooms.id = assignments.classroom_id
    AND classrooms.teacher_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Students can view assignments for their enrolled classrooms";
CREATE POLICY "Students can view assignments for their enrolled classrooms"
  ON assignments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM classroom_students
    WHERE classroom_students.classroom_id = assignments.classroom_id
    AND classroom_students.student_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Teachers can insert assignments for their classrooms";
CREATE POLICY "Teachers can insert assignments for their classrooms"
  ON assignments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM classrooms
    WHERE classrooms.id = assignments.classroom_id
    AND classrooms.teacher_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Teachers can update assignments for their classrooms";
CREATE POLICY "Teachers can update assignments for their classrooms"
  ON assignments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM classrooms
    WHERE classrooms.id = assignments.classroom_id
    AND classrooms.teacher_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Teachers can delete assignments for their classrooms";
CREATE POLICY "Teachers can delete assignments for their classrooms"
  ON assignments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM classrooms
    WHERE classrooms.id = assignments.classroom_id
    AND classrooms.teacher_id = auth.uid()
  ));
