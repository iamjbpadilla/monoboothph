-- Update RLS policies to make pairing_code publicly readable
-- Run this in the Supabase SQL Editor

-- Drop existing restrictive policy on apps table (if exists)
DROP POLICY IF EXISTS "Users can view their own apps" ON apps;
DROP POLICY IF EXISTS "Users can insert their own apps" ON apps;
DROP POLICY IF EXISTS "Users can update their own apps" ON apps;

-- Create new policies for apps table
-- Allow public read access to pairing_code only
CREATE POLICY "Public can read pairing_code" 
ON apps FOR SELECT 
USING (true);

-- Allow authenticated users to read all app data
CREATE POLICY "Authenticated users can view apps" 
ON apps FOR SELECT 
USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert apps
CREATE POLICY "Authenticated users can insert apps" 
ON apps FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update apps
CREATE POLICY "Authenticated users can update apps" 
ON apps FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete apps
CREATE POLICY "Authenticated users can delete apps" 
ON apps FOR DELETE 
USING (auth.role() = 'authenticated');
