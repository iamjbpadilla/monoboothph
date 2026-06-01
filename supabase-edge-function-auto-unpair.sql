-- Create a PostgreSQL function to auto-unpair expired devices
-- This can be called by a cron job or scheduled task

CREATE OR REPLACE FUNCTION auto_unpair_expired_devices()
RETURNS void AS $$
BEGIN
  -- Update devices with expired pairings to offline status
  UPDATE devices
  SET status = 'offline',
      last_sync = NOW()
  WHERE id IN (
    SELECT d.id
    FROM devices d
    JOIN apps a ON d.app_id = a.id
    WHERE d.status = 'online'
    AND d.last_sync < NOW() - INTERVAL '24 hours'
  );

  -- Log the cleanup
  RAISE NOTICE 'Auto-unpaired expired devices at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION auto_unpair_expired_devices() TO postgres;

-- Create a pg_cron extension if not exists (for scheduled execution)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the function to run every hour
SELECT cron.schedule(
  'auto-unpair-devices',
  '0 * * * *', -- Every hour
  'SELECT auto_unpair_expired_devices();'
);
