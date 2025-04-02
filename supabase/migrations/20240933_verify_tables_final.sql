-- Verify and create necessary tables if they don't exist

-- Users table (if not already created by Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  chat_count INTEGER DEFAULT 0,
  max_chats INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_id TEXT UNIQUE NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  interval TEXT NOT NULL DEFAULT 'month',
  features JSONB,
  max_chats INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_id TEXT UNIQUE,
  stripe_price_id TEXT,
  price_id TEXT REFERENCES public.plans(price_id),
  status TEXT,
  currency TEXT,
  interval TEXT,
  amount NUMERIC,
  current_period_start BIGINT,
  current_period_end BIGINT,
  cancel_at_period_end BOOLEAN DEFAULT false,
  started_at BIGINT,
  canceled_at BIGINT,
  ended_at BIGINT,
  customer_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Webhook events table for logging
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT,
  type TEXT,
  stripe_event_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data JSONB
);

-- Chat history table
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.chat_history(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- API keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Safely add tables to realtime publication if they're not already members
DO $$
DECLARE
  table_name text;
  is_member boolean;
BEGIN
  FOR table_name IN 
    SELECT 'users' UNION 
    SELECT 'user_profiles' UNION 
    SELECT 'plans' UNION 
    SELECT 'subscriptions' UNION 
    SELECT 'webhook_events' UNION 
    SELECT 'chat_history' UNION 
    SELECT 'chat_messages' UNION 
    SELECT 'api_keys'
  LOOP
    -- Check if the table is already a member of the publication
    SELECT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = table_name
    ) INTO is_member;
    
    -- Only add if not already a member
    IF NOT is_member THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
    END IF;
  END LOOP;
END;
$$;

-- Create RLS policies (disabled by default as per instructions)
-- These are commented out and can be enabled if explicitly requested

-- Example policy for users table (commented out)
-- DROP POLICY IF EXISTS "Users are viewable by themselves" ON users;
-- CREATE POLICY "Users are viewable by themselves"
--   ON users FOR SELECT
--   USING (auth.uid() = id);

-- Insert default plans if none exist
INSERT INTO public.plans (name, description, price_id, price, currency, interval, features, max_chats)
SELECT 
  'Free', 
  'Basic access with limited features', 
  'price_free', 
  0, 
  'usd', 
  'month', 
  '{"features": ["10 chats per month", "Basic support"]}'::jsonb, 
  10
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE price_id = 'price_free');

INSERT INTO public.plans (name, description, price_id, price, currency, interval, features, max_chats)
SELECT 
  'Pro', 
  'Full access to all features', 
  'price_1OvXXXXXXXXXXXXXXXXXXXXX', 
  1999, 
  'usd', 
  'month', 
  '{"features": ["Unlimited chats", "Priority support", "Advanced features"]}'::jsonb, 
  9999
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE price_id = 'price_1OvXXXXXXXXXXXXXXXXXXXXX');
