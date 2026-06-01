-- Create storage bucket for photos if it doesn't exist
-- Run this in the Supabase SQL Editor

-- Create the photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies on photos storage bucket (if exists)
DROP POLICY IF EXISTS "Public can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete photos" ON storage.objects;

-- Create policies for photos storage bucket
-- Allow public upload to photos bucket
CREATE POLICY "Public can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'photos');

-- Allow public read from photos bucket
CREATE POLICY "Public can view photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

-- Allow authenticated users to delete from photos bucket
CREATE POLICY "Authenticated can delete photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'photos' AND auth.role() = 'authenticated');
