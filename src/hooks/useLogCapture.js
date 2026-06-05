import { Preferences } from '@capacitor/preferences';
import { getSupabaseClient } from '../lib/supabase';

const LOG_QUEUE_KEY = 'log_queue';
const MAX_QUEUE_SIZE = 50;
const BATCH_INTERVAL = 5000; // 5 seconds

let logQueue = [];
let batchTimeout = null;
let supabaseClient = null;

/**
 * Initialize log capture system
 */
async function initLogCapture() {
  try {
    supabaseClient = await getSupabaseClient();
    
    // Load queued logs from storage
    const { value } = await Preferences.get({ key: LOG_QUEUE_KEY });
    if (value) {
      logQueue = JSON.parse(value);
      console.log('[LogCapture] Loaded queued logs:', logQueue.length);
      
      // Try to send queued logs
      if (logQueue.length > 0 && supabaseClient) {
        await flushLogQueue();
      }
    }
  } catch (err) {
    console.error('[LogCapture] Init error:', err);
  }
}

/**
 * Get app_id from pairing
 */
async function getAppId() {
  try {
    const { value } = await Preferences.get({ key: 'snaproll_pairing' });
    if (!value) return null;
    const pairing = JSON.parse(value);
    return pairing.appId;
  } catch {
    return null;
  }
}

/**
 * Get device_id from pairing
 */
async function getDeviceId() {
  try {
    const { value } = await Preferences.get({ key: 'snaproll_pairing' });
    if (!value) return null;
    const pairing = JSON.parse(value);
    return pairing.deviceId;
  } catch {
    return null;
  }
}

/**
 * Broadcast a log to Supabase Realtime
 */
async function broadcastLog(logEntry) {
  try {
    if (!supabaseClient) {
      supabaseClient = await getSupabaseClient();
    }
    
    if (!supabaseClient) {
      console.warn('[LogCapture] Supabase not available, queuing log');
      queueLog(logEntry);
      return;
    }

    const appId = await getAppId();
    if (!appId) {
      console.warn('[LogCapture] Not paired, queuing log');
      queueLog(logEntry);
      return;
    }

    const channelName = `logs:${appId}`;
    
    // Broadcast to Realtime channel
    const channel = supabaseClient.channel(channelName);
    await channel.send({
      type: 'broadcast',
      event: 'log',
      payload: logEntry
    });
    
    console.log('[LogCapture] Broadcasted log:', logEntry.level, logEntry.message);
  } catch (err) {
    console.error('[LogCapture] Broadcast error:', err);
    queueLog(logEntry);
  }
}

/**
 * Queue a log for later sending
 */
function queueLog(logEntry) {
  logQueue.push(logEntry);
  
  // Limit queue size
  if (logQueue.length > MAX_QUEUE_SIZE) {
    logQueue.shift(); // Remove oldest
  }
  
  // Save to storage
  Preferences.set({ key: LOG_QUEUE_KEY, value: JSON.stringify(logQueue) }).catch(err => {
    console.error('[LogCapture] Failed to save queue:', err);
  });
}

/**
 * Flush queued logs
 */
async function flushLogQueue() {
  if (logQueue.length === 0) return;
  
  const logsToSend = [...logQueue];
  logQueue = [];
  
  await Preferences.remove({ key: LOG_QUEUE_KEY });
  
  console.log('[LogCapture] Flushing queued logs:', logsToSend.length);
  
  for (const log of logsToSend) {
    await broadcastLog(log);
  }
}

/**
 * Capture a log entry
 */
export async function captureLog(level, message, errorCode = null, stackTrace = null, context = {}) {
  const logEntry = {
    level,
    message,
    error_code: errorCode,
    stack_trace: stackTrace,
    context,
    timestamp: new Date().toISOString(),
    device_id: await getDeviceId(),
  };
  
  // Broadcast immediately
  await broadcastLog(logEntry);
}

/**
 * Convenience functions for different log levels
 */
export const logError = (message, errorCode = null, stackTrace = null, context = {}) =>
  captureLog('error', message, errorCode, stackTrace, context);

export const logWarn = (message, context = {}) =>
  captureLog('warn', message, null, null, context);

export const logInfo = (message, context = {}) =>
  captureLog('info', message, null, null, context);

export const logDebug = (message, context = {}) =>
  captureLog('debug', message, null, null, context);

/**
 * Initialize on import
 */
initLogCapture();
