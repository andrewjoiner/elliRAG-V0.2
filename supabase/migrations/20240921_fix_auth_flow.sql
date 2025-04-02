-- Create a function to create a user directly
CREATE OR REPLACE FUNCTION public.create_user(user_email TEXT, user_password TEXT, user_full_name TEXT)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    email,
    raw_user_meta_data,
    email_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at,
    confirmation_token,
    email_change_token_current,
    email_change_token_new,
    recovery_token
  ) VALUES (
    user_email,
    jsonb_build_object('full_name', user_full_name),
    now(),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- Insert into auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    created_at,
    updated_at,
    last_sign_in_at
  ) VALUES (
    new_user_id,
    new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', user_email),
    'email',
    now(),
    now(),
    now()
  );

  -- Set password
  UPDATE auth.users
  SET encrypted_password = crypt(user_password, gen_salt('bf'))
  WHERE id = new_user_id;

  -- Create user profile
  INSERT INTO public.users (id, email, full_name, created_at)
  VALUES (new_user_id, user_email, user_full_name, now());

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.create_user TO anon, authenticated, service_role;

-- Create a function to check if a user can sign in
CREATE OR REPLACE FUNCTION public.check_user_credentials(user_email TEXT, user_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM auth.users 
    WHERE email = user_email 
    AND encrypted_password = crypt(user_password, encrypted_password)
  ) INTO user_exists;
  RETURN user_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.check_user_credentials TO anon, authenticated, service_role;

-- Create a function to get user by email
CREATE OR REPLACE FUNCTION public.get_user_by_email(user_email TEXT)
RETURNS TABLE (id UUID, email TEXT, full_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.raw_user_meta_data->>'full_name' as full_name
  FROM auth.users u
  WHERE u.email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_user_by_email TO anon, authenticated, service_role;

-- Ensure plans table exists
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  interval TEXT NOT NULL,
  features JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert plans that match the landing page
INSERT INTO public.plans (id, name, price, interval, features)
VALUES 
  ('free', 'Free', 0, 'month', '{"chat_limit": 50, "document_pages": 5, "history_days": 30}'::jsonb),
  ('pro_monthly', 'Pro', 3900, 'month', '{"chat_limit": 500, "document_pages": -1, "history_days": 90}'::jsonb),
  ('pro_yearly', 'Pro (Annual)', 39900, 'year', '{"chat_limit": 500, "document_pages": -1, "history_days": 90}'::jsonb),
  ('enterprise', 'Enterprise', 0, 'month', '{"chat_limit": -1, "document_pages": -1, "history_days": -1}'::jsonb)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    price = EXCLUDED.price,
    interval = EXCLUDED.interval,
    features = EXCLUDED.features;

-- Disable RLS on plans table
ALTER TABLE public.plans DISABLE ROW LEVEL SECURITY;

-- Grant all permissions on plans table
GRANT ALL ON public.plans TO anon, authenticated, service_role;
