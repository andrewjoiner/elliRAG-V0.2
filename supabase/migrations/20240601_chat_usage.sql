-- Create chat_usage table to track user chat usage
CREATE TABLE IF NOT EXISTS chat_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_count INTEGER NOT NULL DEFAULT 0,
  billing_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  billing_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  plan_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  chat_limit INTEGER NOT NULL,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key to chat_usage
ALTER TABLE chat_usage
ADD CONSTRAINT fk_chat_usage_plan
FOREIGN KEY (plan_id)
REFERENCES plans(id);

-- Create function to increment chat count
CREATE OR REPLACE FUNCTION increment_chat_count(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  -- Check if user has an active billing period
  IF EXISTS (SELECT 1 FROM chat_usage WHERE user_id = user_id_param AND billing_period_end > NOW()) THEN
    -- Update existing record
    UPDATE chat_usage
    SET chat_count = chat_count + 1,
        updated_at = NOW()
    WHERE user_id = user_id_param AND billing_period_end > NOW();
  ELSE
    -- Create new billing period (30 days from now)
    INSERT INTO chat_usage (
      user_id,
      chat_count,
      billing_period_start,
      billing_period_end,
      plan_id
    )
    VALUES (
      user_id_param,
      1,
      NOW(),
      NOW() + INTERVAL '30 days',
      (SELECT id FROM plans WHERE name = 'Pro' LIMIT 1) -- Default to Pro plan
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Insert default plans
INSERT INTO plans (name, description, price, chat_limit, features)
VALUES 
  ('Basic', 'Basic plan with limited features', 9.99, 100, '{"document_search": true, "email_support": true}'::jsonb),
  ('Pro', 'Professional plan with advanced features', 29.99, 500, '{"document_search": true, "web_search": true, "priority_support": true}'::jsonb),
  ('Enterprise', 'Enterprise plan with all features', 99.99, 9999, '{"document_search": true, "web_search": true, "web_scraping": true, "dedicated_support": true, "custom_integrations": true}'::jsonb)
ON CONFLICT DO NOTHING;

-- Enable row level security
ALTER TABLE chat_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own usage"
ON chat_usage FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view all plans"
ON plans FOR SELECT
USING (true);

-- Enable realtime
alter publication supabase_realtime add table chat_usage;
alter publication supabase_realtime add table plans;
