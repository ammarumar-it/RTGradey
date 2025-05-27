-- Create classroom_students junction table
CREATE TABLE IF NOT EXISTS classroom_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(classroom_id, student_id)
);

-- Enable realtime for classroom_students table
alter publication supabase_realtime add table classroom_students;

-- Set up access policies for classroom_students table
DROP POLICY IF EXISTS "Teachers can view their classroom students";
CREATE POLICY "Teachers can view their classroom students"
  ON classroom_students FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM classrooms
    WHERE classrooms.id = classroom_students.classroom_id
    AND classrooms.teacher_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Students can view their own classroom enrollments";
CREATE POLICY "Students can view their own classroom enrollments"
  ON classroom_students FOR SELECT
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can add students to their classrooms";
CREATE POLICY "Teachers can add students to their classrooms"
  ON classroom_students FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM classrooms
    WHERE classrooms.id = classroom_students.classroom_id
    AND classrooms.teacher_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Teachers can remove students from their classrooms";
CREATE POLICY "Teachers can remove students from their classrooms"
  ON classroom_students FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM classrooms
    WHERE classrooms.id = classroom_students.classroom_id
    AND classrooms.teacher_id = auth.uid()
  ));
