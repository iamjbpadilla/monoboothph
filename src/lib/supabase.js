import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;
let isInitializing = false;
let initPromise = null;

// Environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Lazy initialization of Supabase client
 * Only creates the client when first called
 */
export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials not configured');
    return null;
  }

  if (isInitializing) {
    return initPromise;
  }

  isInitializing = true;
  initPromise = Promise.resolve().then(() => {
    try {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      return supabaseClient;
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      return null;
    } finally {
      isInitializing = false;
    }
  });

  return initPromise;
}

/**
 * Check if Supabase is configured and available
 */
export async function checkSupabaseConnection() {
  const client = await getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('apps').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
}

/**
 * Get the Supabase client synchronously (returns null if not initialized)
 */
export function getSupabaseClientSync() {
  return supabaseClient;
}
