# Capacitor Preferences Plugin Resolution Guide

## 1. Package Synchronization Commands

### Verify Package Alignment
```bash
# Check current Capacitor and Preferences versions
npm list @capacitor/core @capacitor/android @capacitor/preferences

# Ensure all Capacitor packages are on the same major version
npm install @capacitor/core@latest @capacitor/android@latest @capacitor/cli@latest
npm install @capacitor/preferences@latest
```

### Clean Native Build Caches

#### Android (Gradle)
```bash
# Navigate to Android directory
cd android

# Clean Gradle build cache
./gradlew clean

# Stop any lingering Gradle daemons
./gradlew --stop

# Remove .gradle folder in project root
rm -rf .gradle

# Return to project root
cd ..
```

#### iOS (CocoaPods)
```bash
# Navigate to iOS directory
cd ios

# Clean CocoaPods cache
pod cache clean --all

# Remove Pods directory and Podfile.lock
rm -rf Pods Podfile.lock

# Navigate back to project root
cd ..
```

### Force Native Asset Sync
```bash
# Build web assets
npm run build

# Force sync to Android (removes and re-adds native plugins)
npx cap sync android

# Force sync to iOS
npx cap sync ios

# If issues persist, try update instead of sync
npx cap update android
npx cap update ios
```

---

## 2. Modern Asynchronous Storage Utility Wrapper

### File: `src/lib/storageService.js`

```javascript
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
```

### Usage Examples

```javascript
import { storageService } from '../lib/storageService';

// Save a simple string
await storageService.set('user_name', 'John Doe');

// Save an object
await storageService.set('user_profile', {
  name: 'John Doe',
  email: 'john@example.com',
  preferences: { theme: 'dark' }
});

// Retrieve a value
const userName = await storageService.get('user_name', 'Guest');
const userProfile = await storageService.get('user_profile', {});

// Remove a key
await storageService.remove('user_name');

// Clear all storage
await storageService.clear();
```

---

## 3. Auto-Registration Compliance

### Android: MainActivity.java

**CRITICAL:** Ensure `super.onCreate()` is called BEFORE any custom plugin registrations.

#### ❌ INCORRECT (Old Pattern)
```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    registerPlugin(UsbPrinterPlugin.class);  // WRONG: Before super.onCreate()
    super.onCreate(savedInstanceState);
    enableImmersiveMode();
}
```

#### ✅ CORRECT (Modern Pattern)
```java
package com.momostudioph.receipt;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;
import com.momostudioph.receipt.plugins.UsbPrinterPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);  // MUST BE FIRST
        registerPlugin(UsbPrinterPlugin.class);  // Custom plugins AFTER
        enableImmersiveMode();
    }

    private void enableImmersiveMode() {
        // ... immersive mode implementation
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            enableImmersiveMode();
        }
    }
}
```

**What to Verify:**
1. `super.onCreate(savedInstanceState)` is the first line in `onCreate()`
2. No manual `registerPlugin()` calls for standard Capacitor plugins (Camera, Preferences, etc.)
3. Only custom plugins (like `UsbPrinterPlugin`) should be manually registered
4. The class extends `BridgeActivity` (not `Activity`)

### iOS: AppDelegate.swift

**CRITICAL:** Modern Capacitor uses auto-registration. Manual plugin registration is deprecated.

#### ❌ INCORRECT (Legacy Pattern - Capacitor v2/v3)
```swift
import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // WRONG: Manual plugin registration not needed in Capacitor v4+
        CAPBridge.registerPlugin(CAPCameraPlugin.self)
        CAPBridge.registerPlugin(CAPPreferencesPlugin.self)
        
        return true
    }
}
```

#### ✅ CORRECT (Modern Pattern - Capacitor v4+)
```swift
import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // No manual plugin registration needed
        // Capacitor auto-discovers and registers plugins automatically
        
        return true
    }
}
```

**What to Verify:**
1. No `CAPBridge.registerPlugin()` calls in `AppDelegate.swift`
2. The project uses `Capacitor` framework (not legacy Cordova)
3. `capacitor.settings.gradle` (Android) or `Podfile` (iOS) includes the plugin dependencies
4. Plugins are listed in `package.json` under dependencies

---

## 4. Verification Checklist

After applying the fixes, verify the following:

### Package.json
```json
{
  "dependencies": {
    "@capacitor/core": "^8.3.4",
    "@capacitor/android": "^8.3.4",
    "@capacitor/ios": "^8.3.4",
    "@capacitor/preferences": "^8.0.1"
  }
}
```

### Android Configuration
- [ ] `android/capacitor.settings.gradle` includes `:capacitor-preferences`
- [ ] `android/app/capacitor.build.gradle` has `implementation project(':capacitor-preferences')`
- [ ] `MainActivity.java` calls `super.onCreate()` first
- [ ] No manual Preferences plugin registration

### iOS Configuration
- [ ] `ios/Podfile` includes `pod 'CapacitorPreferences'`
- [ ] `AppDelegate.swift` has no manual plugin registration
- [ ] Ran `pod install` after adding plugin

### Test the Fix
```javascript
import { storageService } from './lib/storageService';

// Test basic operations
await storageService.set('test_key', 'test_value');
const value = await storageService.get('test_key');
console.log('Storage test result:', value); // Should output: 'test_value'
```

---

## 5. Additional Causes of Preferences Plugin Errors

Beyond the MainActivity.java registration order, here are other potential causes:

### 1. Plugin Version Mismatch
**Cause:** Capacitor core, Android, and plugins on incompatible versions
**Solution:**
```bash
# Ensure all Capacitor packages are on same major version
npm list @capacitor/core @capacitor/android @capacitor/preferences
# All should be ^8.x.x or consistent major version
npm install @capacitor/core@latest @capacitor/android@latest @capacitor/preferences@latest
```

### 2. Missing Plugin in Gradle Configuration
**Cause:** Plugin not included in `android/capacitor.settings.gradle` or `android/app/capacitor.build.gradle`
**Solution:**
```bash
# Force sync to regenerate gradle files
npx cap sync android
# Verify capacitor.settings.gradle includes:
# include ':capacitor-preferences'
# project(':capacitor-preferences').projectDir = new File('../node_modules/@capacitor/preferences/android')
```

### 3. Corrupted node_modules
**Cause:** Plugin installation corrupted or incomplete
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npx cap sync android
```

### 4. Old Gradle Build Cache
**Cause:** Gradle using cached old plugin code
**Solution:**
```bash
cd android
./gradlew clean
./gradlew --stop
rm -rf .gradle build
cd ..
npx cap sync android
```

### 5. ProGuard/R8 Minification Issues
**Cause:** Plugin code removed during release build minification
**Solution:** Add to `android/app/proguard-rules.pro`:
```proguard
-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.** { *; }
-dontwarn com.getcapacitor.**
```

### 6. Calling Before Capacitor Initialized
**Cause:** Attempting to use Preferences before Capacitor bridge is ready
**Solution:** Wrap in useEffect or check Capacitor is ready:
```javascript
import { Capacitor } from '@capacitor/core';

useEffect(() => {
  if (Capacitor.isNativePlatform()) {
    // Safe to use Preferences
  }
}, []);
```

### 7. Async/Await Misuse
**Cause:** Not properly awaiting Preferences promises
**Solution:**
```javascript
// ❌ WRONG - no await
Preferences.set({ key: 'test', value: 'data' });

// ✅ CORRECT - with await
await Preferences.set({ key: 'test', value: 'data' });
```

### 8. Key Name Restrictions
**Cause:** Using invalid characters or excessively long key names
**Solution:** Use alphanumeric keys with underscores, max 100 chars:
```javascript
// ✅ GOOD
'user_name', 'app_settings_v1', 'session_token'

// ❌ BAD
'user name', 'user/name', 'user.name', 'a'.repeat(200)
```

### 9. Storage Quota Exceeded (Rare)
**Cause:** SharedPreferences has theoretical limit (though very high)
**Solution:** Check for excessive data storage:
```javascript
const keys = await Preferences.keys();
console.log('Total keys:', keys.length);
// If > 1000 keys, consider cleanup
```

### 10. Multi-Process Conflicts
**Cause:** App using multiple processes with shared storage
**Solution:** Ensure single process in AndroidManifest.xml:
```xml
<application
    android:process=":single"
    ...>
```

### 11. Plugin Not in package.json
**Cause:** Preferences plugin not actually installed
**Solution:**
```bash
npm install @capacitor/preferences
npx cap sync android
```

### 12. Web-Only Context
**Cause:** Trying to use native plugin in web-only build
**Solution:** Check platform before use:
```javascript
import { Capacitor } from '@capacitor/core';

if (Capacitor.isNativePlatform()) {
  // Use native Preferences
} else {
  // Fallback to localStorage
  localStorage.setItem('key', 'value');
}
```

### 13. Thread/Main Thread Issues
**Cause:** Calling plugin from background thread
**Solution:** Capacitor plugins must be called from main thread (React handles this automatically)

### 14. Outdated Capacitor CLI
**Cause:** CLI version doesn't match core version
**Solution:**
```bash
npm install @capacitor/cli@latest
npx cap sync android
```

### 15. Android SDK Path Issues
**Cause:** Gradle can't find Android SDK
**Solution:** Set local.properties:
```properties
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

---

## 6. Common Issues and Solutions

### Issue: "Preferences plugin is not implemented"
**Cause:** Plugin not properly registered or sync failed
**Solution:** Run `npx cap sync android` and verify MainActivity.java order

### Issue: "Cannot read property 'get' of undefined"
**Cause:** Importing from wrong package or plugin not installed
**Solution:** Verify `import { Preferences } from '@capacitor/preferences'` and run `npm install`

### Issue: Storage works on web but not on device
**Cause:** Native plugin not synced to platform
**Solution:** Run `npm run build && npx cap sync android` before building APK

### Issue: Values persist after app uninstall
**Cause:** Android shared preferences not cleared
**Solution:** This is expected behavior. Use `storageService.clear()` in settings if needed
