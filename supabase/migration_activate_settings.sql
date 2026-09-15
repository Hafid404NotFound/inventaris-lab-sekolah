-- Activate dashboard settings without removing existing data.
-- Run this migration in the Supabase SQL Editor.

ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS npsn VARCHAR(50),
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT;

CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY,
  phone VARCHAR(50),
  notifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  system JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_settings_updated_at ON user_settings(updated_at);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow settings access" ON user_settings;
CREATE POLICY "Allow settings access" ON user_settings
  FOR ALL USING (true) WITH CHECK (true);
