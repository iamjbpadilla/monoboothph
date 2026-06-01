-- Create photos table if it doesn't exist
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  pairing_code TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on photos table
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on photos table (if exists)
DROP POLICY IF EXISTS "Users can view photos" ON photos;
DROP POLICY IF EXISTS "Users can insert photos" ON photos;
DROP POLICY IF EXISTS "Users can delete photos" ON photos;

-- Create policies for photos table
-- Allow public insert for photo uploads (from paired devices)
CREATE POLICY "Public can insert photos" 
ON photos FOR INSERT 
WITH CHECK (true);

-- Allow authenticated users to read all photos
CREATE POLICY "Authenticated users can view photos" 
ON photos FOR SELECT 
USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete photos
CREATE POLICY "Authenticated users can delete photos" 
ON photos FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_photos_session_id ON photos(session_id);
CREATE INDEX IF NOT EXISTS idx_photos_app_id ON photos(app_id);
CREATE INDEX IF NOT EXISTS idx_photos_device_id ON photos(device_id);
CREATE INDEX IF NOT EXISTS idx_photos_timestamp ON photos(timestamp DESC);
