-- Fix the plans table structure to match the existing schema

-- Create plans table if it doesn't exist with the correct column names
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  interval TEXT DEFAULT 'month',
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  stripe_product_id TEXT
);

-- Insert default plans
INSERT INTO public.plans (id, name, description, amount, currency, interval, features)
VALUES 
('free', 'Free', 'Basic plan for getting started', 0, 'usd', 'month', '{"chat_limit": 50, "document_pages": 5, "history_days": 30}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.plans (id, name, description, amount, currency, interval, features)
VALUES
('pro_monthly', 'Pro', 'For professionals and small teams', 3900, 'usd', 'month', '{"chat_limit": 500, "document_pages": -1, "history_days": 90}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.plans (id, name, description, amount, currency, interval, features)
VALUES
('pro_yearly', 'Pro (Annual)', 'Annual pro plan with savings', 39900, 'usd', 'year', '{"chat_limit": 500, "document_pages": -1, "history_days": 90}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.plans (id, name, description, amount, currency, interval, features)
VALUES
('enterprise', 'Enterprise', 'For organizations with advanced needs', 0, 'usd', 'month', '{"chat_limit": -1, "document_pages": -1, "history_days": -1}')
ON CONFLICT (id) DO NOTHING;

-- Safely add table to realtime publication if not already a member
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'plans') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE plans;
  END IF;
END
$$;