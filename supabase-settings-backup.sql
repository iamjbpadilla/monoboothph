-- Settings backup table
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS settings_backups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE settings_backups ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view settings backups" ON settings_backups;
DROP POLICY IF EXISTS "Users can insert settings backups" ON settings_backups;
DROP POLICY IF EXISTS "Users can update settings backups" ON settings_backups;
DROP POLICY IF EXISTS "Users can delete settings backups" ON settings_backups;

-- Allow authenticated users to read settings backups
CREATE POLICY "Authenticated users can view settings backups" 
ON settings_backups FOR SELECT 
USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert settings backups
CREATE POLICY "Authenticated users can insert settings backups" 
ON settings_backups FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update settings backups
CREATE POLICY "Authenticated users can update settings backups" 
ON settings_backups FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete settings backups
CREATE POLICY "Authenticated users can delete settings backups" 
ON settings_backups FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_settings_backups_device_id ON settings_backups(device_id);
CREATE INDEX IF NOT EXISTS idx_settings_backups_app_id ON settings_backups(app_id);
CREATE INDEX IF NOT EXISTS idx_settings_backups_created_at ON settings_backups(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_backup_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS settings_backups_updated_at ON settings_backups;
CREATE TRIGGER settings_backups_updated_at
  BEFORE UPDATE ON settings_backups
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_backup_updated_at();
