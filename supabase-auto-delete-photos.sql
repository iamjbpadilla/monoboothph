-- Auto-delete photos after 3 days
-- Run this in the Supabase SQL Editor

-- Create function to delete old photos
CREATE OR REPLACE FUNCTION auto_delete_old_photos()
RETURNS void AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Get photos to delete (older than 3 days)
  WITH photos_to_delete AS (
    SELECT id, storage_path
    FROM photos
    WHERE created_at < NOW() - INTERVAL '3 days'
  )
  SELECT COUNT(*) INTO deleted_count FROM photos_to_delete;

  -- Delete from storage using storage.remove function
  -- Note: This requires calling the storage API via a function or edge function
  -- For now, we'll delete the database records and recommend manual storage cleanup
  
  -- Delete from database
  DELETE FROM photos
  WHERE created_at < NOW() - INTERVAL '3 days';

  -- Log the cleanup
  RAISE NOTICE 'Auto-deleted % photos older than 3 days at %', deleted_count, NOW();
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION auto_delete_old_photos() TO postgres;

-- Create pg_cron extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the function to run every hour
SELECT cron.schedule(
  'auto-delete-photos',
  '0 * * * *', -- Every hour
  'SELECT auto_delete_old_photos();'
);
