-- Create devices table if it doesn't exist
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  device_id TEXT UNIQUE NOT NULL,
  device_name TEXT NOT NULL,
  status TEXT DEFAULT 'offline',
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS on devices table to allow public device registration
ALTER TABLE devices DISABLE ROW LEVEL SECURITY;

-- Drop existing policies on devices table (if exists)
DROP POLICY IF EXISTS "Users can view devices" ON devices;
DROP POLICY IF EXISTS "Users can insert devices" ON devices;
DROP POLICY IF EXISTS "Users can update devices" ON devices;
DROP POLICY IF EXISTS "Users can delete devices" ON devices;
DROP POLICY IF EXISTS "Public can insert devices" ON devices;
DROP POLICY IF EXISTS "Public can update devices" ON devices;
DROP POLICY IF EXISTS "Authenticated users can view devices" ON devices;
DROP POLICY IF EXISTS "Authenticated users can delete devices" ON devices;

-- Create policies for devices table
-- Allow public insert for device registration (pairing)
CREATE POLICY "Public can insert devices" 
ON devices FOR INSERT 
WITH CHECK (true);

-- Allow public update for device status updates
CREATE POLICY "Public can update devices" 
ON devices FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Allow authenticated users to read all devices
CREATE POLICY "Authenticated users can view devices" 
ON devices FOR SELECT 
USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete devices
CREATE POLICY "Authenticated users can delete devices" 
ON devices FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create index on device_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);
CREATE INDEX IF NOT EXISTS idx_devices_app_id ON devices(app_id);
