-- Create rubric_criteria table
CREATE TABLE IF NOT EXISTS rubric_criteria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rubric_id UUID REFERENCES rubrics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  max_score INTEGER NOT NULL,
  weight DECIMAL(5,2) DEFAULT 1.0,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for rubric_criteria table
alter publication supabase_realtime add table rubric_criteria;

-- Set up access policies for rubric_criteria table
DROP POLICY IF EXISTS "Users can view criteria for their rubrics";
CREATE POLICY "Users can view criteria for their rubrics"
  ON rubric_criteria FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM rubrics
    WHERE rubrics.id = rubric_criteria.rubric_id
    AND rubrics.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert criteria for their rubrics";
CREATE POLICY "Users can insert criteria for their rubrics"
  ON rubric_criteria FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM rubrics
    WHERE rubrics.id = rubric_criteria.rubric_id
    AND rubrics.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update criteria for their rubrics";
CREATE POLICY "Users can update criteria for their rubrics"
  ON rubric_criteria FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM rubrics
    WHERE rubrics.id = rubric_criteria.rubric_id
    AND rubrics.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete criteria for their rubrics";
CREATE POLICY "Users can delete criteria for their rubrics"
  ON rubric_criteria FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM rubrics
    WHERE rubrics.id = rubric_criteria.rubric_id
    AND rubrics.user_id = auth.uid()
  ));
