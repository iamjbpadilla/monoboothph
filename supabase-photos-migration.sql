-- Migration script to add pairing_code column to existing photos table
-- Run this in the Supabase SQL Editor if the table already exists

-- Add pairing_code column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'photos' AND column_name = 'pairing_code'
  ) THEN
    ALTER TABLE photos ADD COLUMN pairing_code TEXT NOT NULL DEFAULT 'unknown';
  END IF;
END $$;

-- Disable RLS on photos table to allow public photo uploads
ALTER TABLE photos DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies on photos table (more robust approach)
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'photos'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON photos', policy_record.policyname);
  END LOOP;
END $$;
