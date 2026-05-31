import { Preferences } from '@capacitor/preferences';
import { supabase } from '../lib/supabase';

export async function uploadPhotoToSupabase(imageDataUrl, sessionId) {
  try {
    const pairingValue = await Preferences.get({ key: 'snaproll_pairing' });
    if (!pairingValue.value) {
      console.error('Device not paired');
      return null;
    }

    const pairing = JSON.parse(pairingValue.value);
    
    // Convert data URL to blob
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });

    // Generate storage path
    const storagePath = `${pairing.appId}/${pairing.deviceId}/${sessionId}/${file.name}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(storagePath, file, {
        upsert: false,
        contentType: 'image/jpeg',
      });

    if (uploadError) throw uploadError;

    // Create photo record in database
    const { data: photoData, error: dbError } = await supabase
      .from('photos')
      .insert({
        app_id: pairing.appId,
        device_id: pairing.deviceId,
        pairing_code: pairing.pairingCode,
        session_id: sessionId,
        storage_path: storagePath,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return photoData;
  } catch (err) {
    console.error('Photo upload failed:', err);
    throw err;
  }
}

export function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
