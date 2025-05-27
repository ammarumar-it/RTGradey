-- Ensure users table has the correct structure
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  user_type TEXT DEFAULT 'student',
  avatar_seed TEXT,
  avatar_type TEXT,
  avatar_url TEXT,
  token_identifier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE,
  image TEXT,
  name TEXT,
  user_id TEXT
);

-- Enable realtime for users table
ALTER PUBLICATION supabase_realtime ADD TABLE users;
