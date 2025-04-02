-- Drop constraints first to avoid dependency issues
ALTER TABLE IF EXISTS public.chat_usage DROP CONSTRAINT IF EXISTS fk_chat_usage_plan;

-- Create or recreate the plans table
DROP TABLE IF EXISTS public.plans CASCADE;
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  billing_interval TEXT NOT NULL,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default plans
INSERT INTO public.plans (id, name, description, price, billing_interval, features)
VALUES
  ('free', 'Free', 'Basic access to elli', 0, 'month', '{"chat_limit": 50, "document_limit": 5, "features": ["Basic regulatory guidance", "Access to core frameworks", "Single-question interactions", "Basic document summaries", "50 questions per month"]}'),
  ('pro', 'Pro', 'Advanced features for professionals', 39, 'month', '{"chat_limit": 500, "document_limit": 100, "features": ["Everything in Free tier", "Advanced multi-turn conversations", "Full document analysis", "Priority response times", "Conversation history saved for 90 days", "Export conversation insights", "Email support", "500 questions per month"]}'),
  ('enterprise', 'Enterprise', 'Custom solutions for organizations', 999, 'month', '{"chat_limit": 10000, "document_limit": 1000, "features": ["Everything in Pro tier", "Custom knowledge integration", "Web scraping for regulatory updates", "API access", "Dedicated account manager", "Training sessions", "Custom reporting", "SLA guarantees", "Phone and email support", "Custom usage limits"]}')  
ON CONFLICT (id) DO NOTHING;

-- Recreate the foreign key if needed
ALTER TABLE IF EXISTS public.chat_usage ADD CONSTRAINT fk_chat_usage_plan FOREIGN KEY (plan_id) REFERENCES public.plans(id);
