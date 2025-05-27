-- Add avatar_type column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'users' 
                   AND column_name = 'avatar_type') THEN
        ALTER TABLE public.users ADD COLUMN avatar_type text DEFAULT 'avataaars';
    END IF;
END$$;
