import { useEffect, useState, useRef } from 'react';
import { Preferences } from '@capacitor/preferences';
import { getSupabaseClient } from '../lib/supabase';
import { retryAllPendingUploads } from './usePendingUploads.js';
import { logError, logWarn, logInfo } from './useLogCapture.js';

export function useDeviceStatusSync() {
  const [isOnline, setIsOnline] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const subscriptionRef = useRef(null);
  const deviceIdRef = useRef(null);
  const wasOfflineRef = useRef(false);

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
            async (payload) => {
              if (!isMounted) return;
              const newStatus = payload.new.status;
              const nowOnline = newStatus === 'online';
              setIsOnline(nowOnline);
              
              // If device was set to offline server-side, clear local pairing
              if (newStatus === 'offline') {
                Preferences.remove({ key: 'snaproll_pairing' });
                window.location.reload();
              }
              
              // Auto-retry pending uploads when coming online
              if (nowOnline && wasOfflineRef.current) {
                logInfo('Device came online, checking auto-retry');
                console.log('[DeviceStatusSync] Device came online, checking auto-retry...');
                const settingsValue = await Preferences.get({ key: 'snaproll_settings' });
                if (settingsValue.value) {
                  const settings = JSON.parse(settingsValue.value);
                  if (settings.sharing?.autoRetry) {
                    console.log('[DeviceStatusSync] Auto-retry enabled, retrying pending uploads...');
                    const results = await retryAllPendingUploads();
                    logInfo(`Auto-retry completed: ${results.length} uploads processed`, { results });
                  }
                }
              }
              
              wasOfflineRef.current = !nowOnline;
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
          const nowOnline = device.status === 'online';
          setIsOnline(nowOnline);
          wasOfflineRef.current = !nowOnline;
        }
      } catch (err) {
        console.error('Device status sync error:', err);
        logError('Device status sync error', 'DEVICE_SYNC_ERROR', err.message, err.stack);
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
