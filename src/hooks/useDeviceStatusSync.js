import { useEffect, useState, useRef } from 'react';
import { Preferences } from '@capacitor/preferences';
import { getSupabaseClient } from '../lib/supabase';

export function useDeviceStatusSync() {
  const [isOnline, setIsOnline] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const subscriptionRef = useRef(null);
  const deviceIdRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function setupSync() {
      try {
        const pairingValue = await Preferences.get({ key: 'snaproll_pairing' });
        if (!pairingValue.value || !isMounted) return;

        const pairing = JSON.parse(pairingValue.value);
        setDeviceId(pairing.deviceId);
        deviceIdRef.current = pairing.deviceId;

        const supabase = await getSupabaseClient();
        if (!supabase || !isMounted) return;

        // Use unique channel name with timestamp to avoid conflicts
        const channelName = `device-status-${pairing.deviceId}-${Date.now()}`;

        // Subscribe to device status changes
        const subscription = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'devices',
              filter: `id=eq.${pairing.deviceId}`
            },
            (payload) => {
              if (!isMounted) return;
              const newStatus = payload.new.status;
              setIsOnline(newStatus === 'online');
              
              // If device was set to offline server-side, clear local pairing
              if (newStatus === 'offline') {
                Preferences.remove({ key: 'snaproll_pairing' });
                window.location.reload();
              }
            }
          )
          .subscribe();

        if (isMounted) {
          subscriptionRef.current = subscription;
        }

        // Initial status check
        const { data: device } = await supabase
          .from('devices')
          .select('status')
          .eq('id', pairing.deviceId)
          .single();

        if (device && isMounted) {
          setIsOnline(device.status === 'online');
        }
      } catch (err) {
        console.error('Device status sync error:', err);
      }
    }

    setupSync();

    return () => {
      isMounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, []);

  return { isOnline, deviceId };
}
