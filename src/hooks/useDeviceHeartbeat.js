import { useEffect, useRef } from 'react';
import { Preferences } from '@capacitor/preferences';
import { getSupabaseClient } from '../lib/supabase';

const HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Send periodic heartbeat to Supabase to update device status
 * Only runs when device is paired
 */
export function useDeviceHeartbeat(isPaired) {
  const intervalRef = useRef(null);
  const isOnline = useRef(navigator.onLine);

  useEffect(() => {
    if (!isPaired) return;

    const handleOnline = () => {
      isOnline.current = true;
      updateDeviceStatus('online');
    };

    const handleOffline = () => {
      isOnline.current = false;
      updateDeviceStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial heartbeat
    updateDeviceStatus('online');

    // Set up periodic heartbeat
    intervalRef.current = setInterval(() => {
      if (isOnline.current) {
        updateDeviceStatus('online');
      }
    }, HEARTBEAT_INTERVAL);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Set to offline when unmounting
      updateDeviceStatus('offline');
    };
  }, [isPaired]);
}

async function updateDeviceStatus(status) {
  try {
    const pairingValue = await Preferences.get({ key: 'snaproll_pairing' });
    if (!pairingValue.value) return;

    const pairing = JSON.parse(pairingValue.value);
    const supabase = await getSupabaseClient();
    if (!supabase) return;

    const { error } = await supabase
      .from('devices')
      .update({
        status,
        last_sync: new Date().toISOString(),
      })
      .eq('id', pairing.deviceId);

    if (error) {
      console.error('Failed to update device status:', error);
    }
  } catch (err) {
    console.error('Device heartbeat error:', err);
  }
}
