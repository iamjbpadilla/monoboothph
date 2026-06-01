-- Create a trigger function to enforce single-device activation per app
-- This runs before inserting a new device or updating a device to online status

CREATE OR REPLACE FUNCTION enforce_single_device_per_app()
RETURNS trigger AS $$
BEGIN
  -- If setting a device to online, first set all other online devices for this app to offline
  IF NEW.status = 'online' AND (TG_OP = 'INSERT' OR OLD.status != 'online') THEN
    UPDATE devices
    SET status = 'offline',
        last_sync = NOW()
    WHERE app_id = NEW.app_id
      AND status = 'online'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on devices table
DROP TRIGGER IF EXISTS single_device_trigger ON devices;
CREATE TRIGGER single_device_trigger
  BEFORE INSERT OR UPDATE ON devices
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_device_per_app();

-- Grant execute permission
GRANT EXECUTE ON FUNCTION enforce_single_device_per_app() TO postgres;
