import { Preferences } from '@capacitor/preferences';

/**
 * Storage Service - Modern async/await wrapper for Capacitor Preferences
 * Provides type-safe methods with comprehensive error handling
 */

class StorageService {
  /**
   * Save a key/value pair to storage
   * @param {string} key - The storage key
   * @param {string} value - The value to store (will be stringified if object)
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  async set(key, value) {
    try {
      // Convert objects/arrays to JSON strings
      const stringValue = typeof value === 'string' 
        ? value 
        : JSON.stringify(value);
      
      await Preferences.set({
        key,
        value: stringValue
      });
      
      console.log(`[StorageService] Set: ${key}`);
      return true;
    } catch (error) {
      console.error(`[StorageService] Failed to set ${key}:`, error);
      return false;
    }
  }

  /**
   * Retrieve a value from storage
   * @param {string} key - The storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {Promise<any>} - The retrieved value or default
   */
  async get(key, defaultValue = null) {
    try {
      const { value } = await Preferences.get({ key });
      
      if (value === null) {
        return defaultValue;
      }
      
      // Try to parse as JSON, return as string if fails
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error(`[StorageService] Failed to get ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Remove a specific key from storage
   * @param {string} key - The storage key to remove
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  async remove(key) {
    try {
      await Preferences.remove({ key });
      console.log(`[StorageService] Removed: ${key}`);
      return true;
    } catch (error) {
      console.error(`[StorageService] Failed to remove ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all stored data
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  async clear() {
    try {
      await Preferences.clear();
      console.log('[StorageService] Cleared all storage');
      return true;
    } catch (error) {
      console.error('[StorageService] Failed to clear storage:', error);
      return false;
    }
  }

  /**
   * Get all stored keys
   * @returns {Promise<string[]>} - Array of all keys
   */
  async keys() {
    try {
      const { keys } = await Preferences.keys();
      return keys;
    } catch (error) {
      console.error('[StorageService] Failed to get keys:', error);
      return [];
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();

// Export default for convenience
export default storageService;
