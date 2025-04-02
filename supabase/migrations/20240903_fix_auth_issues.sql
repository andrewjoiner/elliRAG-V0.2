-- Ensure user_profiles table exists and has RLS disabled
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS on user_profiles
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Create policy for public access to user_profiles
DROP POLICY IF EXISTS "Public access" ON public.user_profiles;
CREATE POLICY "Public access"
ON public.user_profiles FOR SELECT
USING (true);

-- Enable realtime for user_profiles
alter publication supabase_realtime add table user_profiles;
