import { useEffect, useCallback, useRef } from 'react';
import { Preferences } from '@capacitor/preferences';
import { supabase } from '../lib/supabase';

export function useSupabaseSync(settings, updateSettings) {
  const syncQueue = useRef([]);
  const isOnline = useRef(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      isOnline.current = true;
      processSyncQueue();
    };

    const handleOffline = () => {
      isOnline.current = false;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const pullSettings = useCallback(async () => {
    try {
      const pairingValue = await Preferences.get({ key: 'snaproll_pairing' });
      if (!pairingValue.value) return;

      const pairing = JSON.parse(pairingValue.value);
      
      const { data, error } = await supabase
        .from('apps')
        .select('settings')
        .eq('id', pairing.appId)
        .single();

      if (error) throw error;

      if (data?.settings) {
        updateSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to pull settings:', err);
    }
  }, [updateSettings]);

  const pushSettings = useCallback(async (newSettings) => {
    try {
      const pairingValue = await Preferences.get({ key: 'snaproll_pairing' });
      if (!pairingValue.value) return;

      const pairing = JSON.parse(pairingValue.value);

      if (!isOnline.current) {
        syncQueue.current.push({ settings: newSettings, appId: pairing.appId });
        return;
      }

      const { error } = await supabase
        .from('apps')
        .update({ settings: newSettings })
        .eq('id', pairing.appId);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to push settings:', err);
      syncQueue.current.push({ settings: newSettings });
    }
  }, []);

  const processSyncQueue = useCallback(async () => {
    if (!isOnline.current || syncQueue.current.length === 0) return;

    for (const item of syncQueue.current) {
      try {
        const { error } = await supabase
          .from('apps')
          .update({ settings: item.settings })
          .eq('id', item.appId);

        if (error) throw error;
      } catch (err) {
        console.error('Failed to sync queued settings:', err);
      }
    }

    syncQueue.current = [];
  }, []);

  return { pullSettings, pushSettings };
}
