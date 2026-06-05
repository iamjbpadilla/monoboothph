import { Preferences } from '@capacitor/preferences';
import { getSupabaseClient } from '../lib/supabase';
import { addPendingUpload } from './usePendingUploads.js';
import { logError } from './useLogCapture.js';

/**
 * Upload photo to Supabase Storage and create database record
 * This is optional - if not paired or upload fails, it silently continues
 */
export async function uploadPhotoToSupabase(imageDataUrl, sessionId) {
  console.log('[Photo Upload] Starting upload for session:', sessionId);
  
  try {
    // Check if paired
    console.log('[Photo Upload] Checking pairing status...');
    const pairingValue = await Preferences.get({ key: 'snaproll_pairing' });
    if (!pairingValue.value) {
      console.log('[Photo Upload] Not paired, skipping photo upload');
      return null;
    }

    const pairing = JSON.parse(pairingValue.value);
    console.log('[Photo Upload] Paired to app:', pairing.appId, 'device:', pairing.deviceId);

    const supabase = await getSupabaseClient();
    if (!supabase) {
      console.error('[Photo Upload] Supabase not available, skipping photo upload');
      return null;
    }

    console.log('[Photo Upload] Converting data URL to blob...');
    // Convert data URL to blob
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    const file = new File([blob], `${sessionId}.jpg`, { type: 'image/jpeg' });
    console.log('[Photo Upload] Blob size:', blob.size, 'bytes');

    // Upload to Supabase Storage
    const fileName = `${pairing.deviceId}/${sessionId}.jpg`;
    console.log('[Photo Upload] Uploading to storage path:', fileName);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file, {
        upsert: true,
        contentType: 'image/jpeg',
      });

    if (uploadError) {
      console.error('[Photo Upload] Storage upload failed:', {
        message: uploadError.message,
        statusCode: uploadError.statusCode,
        error: uploadError.error
      });
      logError('Storage upload failed', 'STORAGE_UPLOAD_ERROR', uploadError.message, { sessionId, statusCode: uploadError.statusCode });
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    console.log('[Photo Upload] Storage upload successful:', uploadData);

    // Create database record
    console.log('[Photo Upload] Creating database record...');
    const { data: photoData, error: dbError } = await supabase
      .from('photos')
      .insert({
        app_id: pairing.appId,
        device_id: pairing.deviceId,
        session_id: sessionId,
        storage_path: fileName,
        pairing_code: pairing.pairingCode || 'unknown',
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Photo Upload] Database insert failed:', {
        message: dbError.message,
        code: dbError.code,
        details: dbError.details
      });
      logError('Database insert failed', 'DB_INSERT_ERROR', dbError.message, { sessionId, code: dbError.code });
      throw new Error(`Database insert failed: ${dbError.message}`);
    }

    console.log('[Photo Upload] Database record created:', photoData);
    
    // Increment local analytics image uploads count
    const analyticsValue = await Preferences.get({ key: 'snaproll_local_analytics' });
    const analytics = analyticsValue.value ? JSON.parse(analyticsValue.value) : { printCount: 0, imageUploads: 0, sessions: 0 };
    analytics.imageUploads += 1;
    await Preferences.set({ key: 'snaproll_local_analytics', value: JSON.stringify(analytics) });
    console.log('[Photo Upload] Local analytics image uploads incremented:', analytics.imageUploads);
    
    return photoData;
  } catch (error) {
    console.error('[Photo Upload] Fatal error:', {
      message: error.message,
      stack: error.stack
    });
    
    logError('Photo upload failed', 'UPLOAD_FATAL_ERROR', error.message, error.stack, { sessionId });
    
    // Save to pending queue on failure
    console.log('[Photo Upload] Saving to pending queue...');
    await addPendingUpload(sessionId, imageDataUrl, error);
    
    throw error;
  }
}

/**
 * Generate a unique session ID
 */
export function generateSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
