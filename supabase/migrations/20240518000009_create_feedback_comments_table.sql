-- Create feedback_comments table for inline comments on essays
CREATE TABLE IF NOT EXISTS feedback_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  graded_essay_id UUID REFERENCES graded_essays(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  position_start INTEGER,
  position_end INTEGER,
  comment_type TEXT CHECK (comment_type IN ('highlight', 'suggestion', 'question', 'praise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for feedback_comments table
alter publication supabase_realtime add table feedback_comments;

-- Set up access policies for feedback_comments table
DROP POLICY IF EXISTS "Teachers can view feedback comments they created";
CREATE POLICY "Teachers can view feedback comments they created"
  ON feedback_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM graded_essays
    WHERE graded_essays.id = feedback_comments.graded_essay_id
    AND graded_essays.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Students can view feedback comments on their essays";
CREATE POLICY "Students can view feedback comments on their essays"
  ON feedback_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM graded_essays
    JOIN submissions ON graded_essays.submission_id = submissions.id
    WHERE graded_essays.id = feedback_comments.graded_essay_id
    AND submissions.student_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Teachers can insert feedback comments";
CREATE POLICY "Teachers can insert feedback comments"
  ON feedback_comments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM graded_essays
    WHERE graded_essays.id = feedback_comments.graded_essay_id
    AND graded_essays.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Teachers can update feedback comments they created";
CREATE POLICY "Teachers can update feedback comments they created"
  ON feedback_comments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM graded_essays
    WHERE graded_essays.id = feedback_comments.graded_essay_id
    AND graded_essays.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Teachers can delete feedback comments they created";
CREATE POLICY "Teachers can delete feedback comments they created"
  ON feedback_comments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM graded_essays
    WHERE graded_essays.id = feedback_comments.graded_essay_id
    AND graded_essays.user_id = auth.uid()
  ));
