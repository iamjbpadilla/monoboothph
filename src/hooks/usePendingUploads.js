import { useState, useCallback, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { uploadPhotoToSupabase } from './usePhotoUpload.js';

const PENDING_UPLOADS_KEY = 'pending_uploads';
const MAX_QUEUE_SIZE = 4; // Limit to ~3-4 images to stay under limit

/**
 * Calculate approximate size of base64 string in MB
 */
function getBase64SizeMB(base64) {
  if (!base64) return 0;
  // Base64 is ~33% larger than original, so divide by 1.33
  const sizeInBytes = (base64.length * 3) / 4;
  return sizeInBytes / (1024 * 1024);
}

/**
 * Get total storage usage of pending uploads in MB
 */
async function getStorageUsageMB() {
  try {
    const { value } = await Preferences.get({ key: PENDING_UPLOADS_KEY });
    if (!value) return 0;
    const uploads = JSON.parse(value);
    let totalMB = 0;
    for (const upload of uploads) {
      totalMB += getBase64SizeMB(upload.imageDataUrl);
    }
    return totalMB;
  } catch {
    return 0;
  }
}

/**
 * Load pending uploads from Preferences
 */
export async function loadPendingUploads() {
  try {
    const { value } = await Preferences.get({ key: PENDING_UPLOADS_KEY });
    if (!value) return [];
    return JSON.parse(value);
  } catch (err) {
    console.error('[PendingUploads] Error loading:', err);
    return [];
  }
}

/**
 * Save pending uploads to Preferences
 */
async function savePendingUploads(uploads) {
  try {
    await Preferences.set({ key: PENDING_UPLOADS_KEY, value: JSON.stringify(uploads) });
  } catch (err) {
    console.error('[PendingUploads] Error saving:', err);
    throw err;
  }
}

/**
 * Add a failed upload to the pending queue
 */
export async function addPendingUpload(sessionId, imageDataUrl, error = null, storageLimitMB = 100) {
  const uploads = await loadPendingUploads();
  
  // Check if already exists
  if (uploads.find(u => u.sessionId === sessionId)) {
    console.log('[PendingUploads] Session already in queue:', sessionId);
    return;
  }
  
  // Check storage limit
  const currentUsage = await getStorageUsageMB();
  const newImageSize = getBase64SizeMB(imageDataUrl);
  const totalAfterAdd = currentUsage + newImageSize;
  
  if (totalAfterAdd > storageLimitMB) {
    console.warn('[PendingUploads] Storage limit reached, cannot add upload');
    // Remove oldest upload if queue is full
    if (uploads.length > 0) {
      uploads.shift();
    } else {
      throw new Error('Storage limit reached');
    }
  }
  
  // Limit queue size
  if (uploads.length >= MAX_QUEUE_SIZE) {
    uploads.shift(); // Remove oldest
  }
  
  uploads.push({
    sessionId,
    imageDataUrl,
    timestamp: Date.now(),
    retryCount: 0,
    lastError: error?.message || 'Upload failed',
    fileSize: newImageSize.toFixed(2),
  });
  
  await savePendingUploads(uploads);
  console.log('[PendingUploads] Added to queue:', sessionId);
}

/**
 * Remove a pending upload from the queue
 */
export async function removePendingUpload(sessionId) {
  const uploads = await loadPendingUploads();
  const filtered = uploads.filter(u => u.sessionId !== sessionId);
  await savePendingUploads(filtered);
  console.log('[PendingUploads] Removed from queue:', sessionId);
}

/**
 * Retry a single pending upload
 */
export async function retryPendingUpload(sessionId) {
  const uploads = await loadPendingUploads();
  const upload = uploads.find(u => u.sessionId === sessionId);
  
  if (!upload) {
    console.warn('[PendingUploads] Upload not found:', sessionId);
    return { success: false, error: 'Not found' };
  }
  
  try {
    await uploadPhotoToSupabase(upload.imageDataUrl, upload.sessionId);
    // Success - remove from queue
    await removePendingUpload(sessionId);
    console.log('[PendingUploads] Upload successful:', sessionId);
    return { success: true };
  } catch (err) {
    // Failure - update retry count and error
    upload.retryCount += 1;
    upload.lastError = err.message;
    upload.timestamp = Date.now();
    await savePendingUploads(uploads);
    console.error('[PendingUploads] Upload failed:', sessionId, err);
    return { success: false, error: err.message };
  }
}

/**
 * Retry all pending uploads
 */
export async function retryAllPendingUploads() {
  const uploads = await loadPendingUploads();
  const results = [];
  
  for (const upload of uploads) {
    const result = await retryPendingUpload(upload.sessionId);
    results.push({ sessionId: upload.sessionId, ...result });
  }
  
  return results;
}

/**
 * Clear all pending uploads
 */
export async function clearPendingUploads() {
  await Preferences.remove({ key: PENDING_UPLOADS_KEY });
  console.log('[PendingUploads] Cleared all pending uploads');
}

/**
 * React hook for managing pending uploads
 */
export function usePendingUploads(storageLimitMB = 100) {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [storageUsage, setStorageUsage] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await loadPendingUploads();
    setUploads(data);
    setStorageUsage(await getStorageUsageMB());
    setLoading(false);
  }, []);

  const add = useCallback(async (sessionId, imageDataUrl, error) => {
    await addPendingUpload(sessionId, imageDataUrl, error, storageLimitMB);
    await load();
  }, [load, storageLimitMB]);

  const remove = useCallback(async (sessionId) => {
    await removePendingUpload(sessionId);
    await load();
  }, [load]);

  const retry = useCallback(async (sessionId) => {
    const result = await retryPendingUpload(sessionId);
    await load();
    return result;
  }, [load]);

  const retryAll = useCallback(async () => {
    const results = await retryAllPendingUploads();
    await load();
    return results;
  }, [load]);

  const clear = useCallback(async () => {
    await clearPendingUploads();
    await load();
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    uploads,
    loading,
    storageUsage,
    storageLimit: storageLimitMB,
    add,
    remove,
    retry,
    retryAll,
    clear,
    refresh: load,
  };
}
