-- Create rubric_criteria table
CREATE TABLE IF NOT EXISTS rubric_criteria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rubric_id UUID REFERENCES rubrics(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  band TEXT,
  mark_range TEXT,
  description TEXT,
  weight INTEGER DEFAULT 0,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE rubric_criteria ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own rubric criteria" ON rubric_criteria;
CREATE POLICY "Users can view their own rubric criteria"
  ON rubric_criteria FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rubrics
      WHERE rubrics.id = rubric_criteria.rubric_id
      AND rubrics.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own rubric criteria" ON rubric_criteria;
CREATE POLICY "Users can insert their own rubric criteria"
  ON rubric_criteria FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rubrics
      WHERE rubrics.id = rubric_criteria.rubric_id
      AND rubrics.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own rubric criteria" ON rubric_criteria;
CREATE POLICY "Users can update their own rubric criteria"
  ON rubric_criteria FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM rubrics
      WHERE rubrics.id = rubric_criteria.rubric_id
      AND rubrics.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own rubric criteria" ON rubric_criteria;
CREATE POLICY "Users can delete their own rubric criteria"
  ON rubric_criteria FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM rubrics
      WHERE rubrics.id = rubric_criteria.rubric_id
      AND rubrics.user_id = auth.uid()
    )
  );

-- Add to realtime publication
alter publication supabase_realtime add table rubric_criteria;
