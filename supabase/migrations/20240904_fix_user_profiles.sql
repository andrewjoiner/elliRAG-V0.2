-- Ensure user_profiles table exists
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure RLS is disabled for user_profiles
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON user_profiles;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
