-- Add print counter to devices table
-- Run this in the Supabase SQL Editor

-- Add print_count column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'devices' AND column_name = 'print_count'
  ) THEN
    ALTER TABLE devices ADD COLUMN print_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create function to increment print counter
CREATE OR REPLACE FUNCTION increment_print_count(device_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE devices
  SET print_count = COALESCE(print_count, 0) + 1
  WHERE id = device_uuid;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_print_count(UUID) TO postgres;
