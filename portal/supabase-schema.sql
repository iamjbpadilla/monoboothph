-- Snap & Roll Portal - Supabase Database Schema
-- Run this in your Supabase project's SQL Editor

-- Apps (photobooth installations/events)
CREATE TABLE IF NOT EXISTS apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pairing_code TEXT UNIQUE NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Devices (individual kiosk devices)
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL UNIQUE,
  device_name TEXT,
  last_sync TIMESTAMPTZ,
  status TEXT DEFAULT 'offline', -- online, offline, error
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photos (uploaded from kiosks)
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  pairing_code TEXT NOT NULL,
  session_id TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users (for portal access)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_photos_app_id ON photos(app_id);
CREATE INDEX IF NOT EXISTS idx_photos_session_id ON photos(session_id);
CREATE INDEX IF NOT EXISTS idx_photos_timestamp ON photos(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_devices_app_id ON devices(app_id);
CREATE INDEX IF NOT EXISTS idx_apps_pairing_code ON apps(pairing_code);

-- Enable Row Level Security
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Apps: Admins can read/write
CREATE POLICY "Admins can manage apps" ON apps
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));

-- Devices: Admins can read/write
CREATE POLICY "Admins can manage devices" ON devices
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));

-- Photos: Public read for download, authenticated write
CREATE POLICY "Public can read photos" ON photos
  FOR SELECT USING (true);

CREATE POLICY "Admins can delete photos" ON photos
  FOR DELETE USING (auth.uid() IN (SELECT id FROM admin_users));

-- Admin users: Public read (for auth check), admins can insert
CREATE POLICY "Public can read admin_users" ON admin_users
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert admin_users" ON admin_users
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

-- Storage Bucket Setup
-- Run this in Supabase Storage section, not SQL Editor
-- 1. Create bucket named "photos"
-- 2. Set bucket to public
-- 3. Add the following policies in Storage:

-- Storage RLS Policies (run in Storage > Policies)
-- Public can download photos
-- CREATE POLICY "Public can download photos" ON storage.objects
--   FOR SELECT USING (bucket_id = 'photos');

-- Authenticated can upload photos
-- CREATE POLICY "Authenticated can upload photos" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

-- Admins can delete photos
-- CREATE POLICY "Admins can delete photos" ON storage.objects
--   FOR DELETE USING (bucket_id = 'photos' AND auth.uid() IN (SELECT id FROM admin_users));

-- Insert initial admin user (replace with your email)
-- INSERT INTO admin_users (email) VALUES ('your-admin-email@example.com');
