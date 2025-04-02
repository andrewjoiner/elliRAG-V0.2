-- Create a direct SQL connection to auth.users to bypass RLS issues

-- Create a view to access auth.users directly
CREATE OR REPLACE VIEW public.auth_users AS
SELECT id, email, created_at, last_sign_in_at, raw_user_meta_data
FROM auth.users;

-- Ensure the view is accessible
GRANT SELECT ON public.auth_users TO anon, authenticated, service_role;

-- Create a function to check if a user exists by email
CREATE OR REPLACE FUNCTION public.check_user_exists(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = user_email) INTO user_exists;
  RETURN user_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.check_user_exists TO anon, authenticated, service_role;

-- Ensure users table exists and has proper permissions
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS on users table to ensure access
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Grant all permissions on users table
GRANT ALL ON public.users TO anon, authenticated, service_role;
