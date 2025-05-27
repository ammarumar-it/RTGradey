-- Use Supabase's auth settings API instead of direct function calls

-- Create a function to safely set auth settings
CREATE OR REPLACE FUNCTION set_auth_setting(setting_name text, setting_value text) RETURNS void AS $$
BEGIN
  -- This is a safer approach that doesn't rely on auth.config function
  EXECUTE format('ALTER SYSTEM SET %I = %L', setting_name, setting_value);
  PERFORM pg_reload_conf();
EXCEPTION WHEN OTHERS THEN
  -- Silently continue if setting fails
  RAISE NOTICE 'Could not set % to %: %', setting_name, setting_value, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Apply settings using the safer function
SELECT set_auth_setting('app.settings.auth.email_confirm_changes', 'true');
SELECT set_auth_setting('app.settings.auth.email_confirmation_required', 'false');
SELECT set_auth_setting('app.settings.auth.site_url', 'https://bold-cannon7-9je45.view-3.tempo-dev.app');

-- Add redirect URLs - this table should exist in Supabase
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'auth'
    AND table_name = 'redirect_urls'
  ) THEN
    INSERT INTO auth.redirect_urls (redirect_url) 
    VALUES 
    ('https://bold-cannon7-9je45.view-3.tempo-dev.app'),
    ('https://bold-cannon7-9je45.view-3.tempo-dev.app/dashboard'),
    ('https://bold-cannon7-9je45.view-3.tempo-dev.app/login'),
    ('https://bold-cannon7-9je45.view-3.tempo-dev.app/signup'),
    ('https://bold-cannon7-9je45.view-3.tempo-dev.app/auth/callback')
    ON CONFLICT DO NOTHING;
  END IF;
END
$$;