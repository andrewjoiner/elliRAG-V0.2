-- Create plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'usd',
  interval TEXT DEFAULT 'month',
  chat_limit INTEGER NOT NULL,
  features JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for plans table
ALTER TABLE public.plans DISABLE ROW LEVEL SECURITY;

-- Insert default plans if they don't exist
INSERT INTO public.plans (id, name, description, price, chat_limit, features)
VALUES 
  (gen_random_uuid(), 'Free', 'Basic plan with limited features', 0.00, 50, '{"document_pages": 5, "history_days": 30}'::jsonb),
  (gen_random_uuid(), 'Pro (Monthly)', 'Professional plan with advanced features', 39.00, 500, '{"document_pages": -1, "history_days": 90}'::jsonb),
  (gen_random_uuid(), 'Pro (Yearly)', 'Professional plan with advanced features, billed yearly', 399.00, 500, '{"document_pages": -1, "history_days": 90}'::jsonb),
  (gen_random_uuid(), 'Enterprise', 'Custom enterprise solution', 0.00, -1, '{"document_pages": -1, "history_days": -1}'::jsonb)
ON CONFLICT (id) DO NOTHING;
