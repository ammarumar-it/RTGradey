-- Add avatar_seed column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'users' 
                   AND column_name = 'avatar_seed') THEN
        ALTER TABLE public.users ADD COLUMN avatar_seed text;
    END IF;
END$$;

-- Update existing users to have their email as the avatar seed if null
UPDATE public.users
SET avatar_seed = email
WHERE avatar_seed IS NULL AND email IS NOT NULL;
