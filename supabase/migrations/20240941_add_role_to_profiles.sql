-- Add role column to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'free';
  END IF;
END $$;

-- Update existing profiles to have the default role if they don't have one
UPDATE profiles SET role = 'free' WHERE role IS NULL;

-- No need to enable realtime for profiles table as it's already enabled
-- ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
