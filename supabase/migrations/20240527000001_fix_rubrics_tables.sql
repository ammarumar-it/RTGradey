-- Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS rubric_criteria CASCADE;
DROP TABLE IF EXISTS rubrics CASCADE;

-- Create rubrics table
CREATE TABLE IF NOT EXISTS rubrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
  order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row-level security
ALTER TABLE rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubric_criteria ENABLE ROW LEVEL SECURITY;

-- Create policies for rubrics table
DROP POLICY IF EXISTS "Users can view their own rubrics" ON rubrics;
CREATE POLICY "Users can view their own rubrics"
  ON rubrics FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own rubrics" ON rubrics;
CREATE POLICY "Users can insert their own rubrics"
  ON rubrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own rubrics" ON rubrics;
CREATE POLICY "Users can update their own rubrics"
  ON rubrics FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own rubrics" ON rubrics;
CREATE POLICY "Users can delete their own rubrics"
  ON rubrics FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for rubric_criteria table
DROP POLICY IF EXISTS "Users can view criteria for their rubrics" ON rubric_criteria;
CREATE POLICY "Users can view criteria for their rubrics"
  ON rubric_criteria FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rubrics
      WHERE rubrics.id = rubric_criteria.rubric_id
      AND rubrics.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert criteria for their rubrics" ON rubric_criteria;
CREATE POLICY "Users can insert criteria for their rubrics"
  ON rubric_criteria FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rubrics
      WHERE rubrics.id = rubric_criteria.rubric_id
      AND rubrics.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update criteria for their rubrics" ON rubric_criteria;
CREATE POLICY "Users can update criteria for their rubrics"
  ON rubric_criteria FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM rubrics
      WHERE rubrics.id = rubric_criteria.rubric_id
      AND rubrics.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete criteria for their rubrics" ON rubric_criteria;
CREATE POLICY "Users can delete criteria for their rubrics"
  ON rubric_criteria FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM rubrics
      WHERE rubrics.id = rubric_criteria.rubric_id
      AND rubrics.user_id = auth.uid()
    )
  );

-- Enable realtime for these tables
alter publication supabase_realtime add table rubrics;
alter publication supabase_realtime add table rubric_criteria;
