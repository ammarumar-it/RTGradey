-- Create settings table for user preferences
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications_enabled BOOLEAN DEFAULT true,
  accessibility_high_contrast BOOLEAN DEFAULT false,
  accessibility_large_text BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for settings table
alter publication supabase_realtime add table settings;

-- Set up access policies for settings table
DROP POLICY IF EXISTS "Users can view their own settings";
CREATE POLICY "Users can view their own settings"
  ON settings FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own settings";
CREATE POLICY "Users can update their own settings"
  ON settings FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own settings";
CREATE POLICY "Users can insert their own settings"
  ON settings FOR INSERT
  WITH CHECK (user_id = auth.uid());
