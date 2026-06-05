import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';

// Font size guide (203 DPI): 20px ≈ 2.5mm, 28px ≈ 3.5mm, 40px ≈ 5mm
function defaultBlocks() {
  return {
    header:     { enabled: true,  text: '', title: '', subtitle: '', image: null, fontSize: 42, alignment: 'center', bold: true, imageScale: 4, imageBottomMargin: 16, titleSubtitleGap: 8 },
    photos:     { enabled: true,  borderStyle: 'thin', borderColor: '#000000', gap: 8 },
    divider:    { enabled: true,  style: 'dashed', thickness: 2, color: '#000000' },
    elementSpacing: 16,
    datetime:   { enabled: true,  format: 'MMM DD, YYYY  HH:mm' },
    customText: { enabled: false, content: '#SnapAndRoll',           fontSize: 28, alignment: 'center' },
    receiptItems: { enabled: true, items: [
      { name: 'Good Vibes', quantity: 1, price: 999 },
      { name: 'Bad Decisions', quantity: 2, price: 0 },
      { name: 'Y2K Energy', quantity: 1, price: 500 }
    ], fontSize: 20, showTotal: false, showQty: false, randomize: true },
    barcode:    { enabled: true,  value: 'SNAPROLL001', type: 'CODE128', showText: false },
    footer:     { enabled: true,  text: 'Thank you for the memories!', fontSize: 26, alignment: 'center', image: '/footer.png', imageScale: 4, imageTopMargin: 16 },
    backgroundColor: '#ffffff',
    blockOrder: ['datetime', 'header', 'dividerBefore', 'photos', 'dividerAfter', 'customText', 'receiptItems', 'barcode', 'footer'],
  };
}

const DEFAULT_SETTINGS = {
  _version: 18, // bumped from 17: moved resolution/mirror to camera, removed flashEffect, added storageLimitMB, changed printer default to usb
  homeScreen: {
    background: {
      type: 'preset', // 'preset' | 'color' | 'gradient' | 'image' | 'video'
      presetId: 'plain',
      color: '#ffffff',
      gradientId: 'gradient-purple-pink',
      imageBase64: null,
      videoBase64: null,
    },
    title: {
      enabled: true,
      text: 'MONO BOOTH PH',
      font: 'Inter',
      size: 56,
      color: '#000000',
    },
    subtitle: {
      enabled: true,
      text: 'Receipt Photobooth',
      font: 'Inter',
      size: 24,
      color: '#666666',
    },
    button: {
      shape: 'pill', // 'pill' | 'rectangle' | 'square'
      scale: 1.0,
      text: 'Tap to Start',
      imageBase64: null,
      verticalOffset: 0, // Vertical position offset in pixels (0-100)
    },
    logo: {
      imageBase64: null,
      scale: 1.0,
      iconKey: null,
    },
    presets: [], // Array of { id, name, config, createdAt }
  },
  sharing: {
    enabled: true, // Toggle to disable Supabase upload + QR
    fallbackMessage: 'Photo saved locally - will sync when online',
    offlineFallbackEnabled: true, // Toggle to show offline fallback message
    autoRetry: true, // Auto-retry when internet returns
    maxRetries: 3, // Max retry attempts before giving up
    storageLimitMB: 100, // Configurable storage limit for pending uploads
  },
  general: {
    boothName: 'MONO BOOTH PH',
    eventName: 'Receipt Photobooth',
    logoBase64: null,
    logoScale: 1.0, // 1.0 = 100%, 1.1 = 110%, 1.2 = 120%, 1.3 = 130%, 1.5 = 150%
    theme: 'light',
    accent: 'purple',
    fontPair: 'modern',
    brandingIcon: null,
    standbyBackground: 'plain', // KEPT for backward compatibility
    backgroundImage: null, // KEPT for backward compatibility
    showAdvertising: true,
    adDuration: 5,
    settingsIconOpacity: 100, // 10-100, opacity of settings icon on home screen
    hideSettingsIcon: false, // Hide settings icon, use long press instead
    longPressDuration: 3000, // 3 seconds long press to open settings
    advertising: {
      title: 'MONO BOOTH PH',
      subtitle: 'Capture Your Best Moments',
      message: 'Professional photobooth services for all your special occasions. Weddings, birthdays, corporate events, and more!',
      facebookUsername: 'monoboothph',
      instagramUsername: 'monoboothph',
      tiktokUsername: '',
      phone: '',
      email: '',
      posterWall: [], // Array of { type: 'url'|'upload', value: string } (1-10 images)
      showFullScreen: false,
      fullScreenImages: [], // Array of { type: 'url'|'upload', value: string }
      fullScreenImageMode: 'scale', // 'scale' | 'fit' | 'stretch'
      display: {
        showSocial: true,
        showContact: false,
        showQR: true,
        showLogo: false,
        backgroundStyle: 'gradient-purple-pink'
      }
    },
    settingsPin: '0000'
  },
  camera: {
    deviceId: '',
    resolution: 'fhd', // KEPT for backward compatibility
    mirror: true, // KEPT for backward compatibility
  },
  printer: {
    transport: 'usb',
    wifiIp: '192.168.1.100',
    wifiPort: '9100',
    dpi: 203,
    paperWidthMm: 80,
    printDithering: 'floyd',
    printGamma: 1.8,
    printBrightness: -8,
    printContrast: 64,
    printTopMargin: 22,
    printBottomMultiplier: 4,
  },
  capture: {
    countdownSeconds: 3,
    poseSuggestionsEnabled: true,
    retakeMessagesEnabled: true,
  },
  templates: {
    blocks: defaultBlocks(),
  },
};

// Migration from v16 to v17
function migrateFromV16(saved) {
  const migrated = { ...saved };
  
  // Migrate home screen fields from general
  if (!migrated.homeScreen) {
    migrated.homeScreen = {
      background: {
        type: saved.general.backgroundImage ? 'image' : 'preset',
        presetId: saved.general.standbyBackground || 'plain',
        imageBase64: saved.general.backgroundImage || null,
        color: '#ffffff',
        gradientId: 'gradient-purple-pink',
        videoBase64: null,
      },
      title: {
        enabled: true,
        text: saved.general.boothName || 'MONO BOOTH PH',
        font: 'Inter',
        size: 56,
        color: '#000000',
      },
      subtitle: {
        enabled: !!saved.general.eventName,
        text: saved.general.eventName || '',
        font: 'Inter',
        size: 24,
        color: '#666666',
      },
      button: {
        shape: 'pill',
        scale: 1.0,
        text: 'Tap to Start',
        imageBase64: null,
      },
      logo: {
        imageBase64: saved.general.logoBase64 || null,
        scale: saved.general.logoScale || 1.0,
        iconKey: saved.general.brandingIcon || null,
      },
      presets: [],
    };
  }
  
  // Migrate capture fields from camera
  if (!migrated.capture.poseSuggestionsEnabled) {
    migrated.capture.poseSuggestionsEnabled = true;
  }
  if (!migrated.capture.retakeMessagesEnabled) {
    migrated.capture.retakeMessagesEnabled = true;
  }
  if (migrated.camera.resolution && !migrated.capture.resolution) {
    migrated.capture.resolution = migrated.camera.resolution;
  }
  if (migrated.camera.mirror !== undefined && migrated.capture.mirror === undefined) {
    migrated.capture.mirror = migrated.camera.mirror;
  }
  
  // Add sharing section if not present
  if (!migrated.sharing) {
    migrated.sharing = {
      enabled: true,
      fallbackMessage: 'Photo saved locally - will sync when online',
      autoRetry: true,
      maxRetries: 3,
    };
  }
  
  migrated._version = 17;
  return migrated;
}

// Migration from v17 to v18
function migrateFromV17(saved) {
  const migrated = { ...saved };
  
  // Move resolution and mirror from capture back to camera
  if (migrated.capture.resolution && !migrated.camera.resolution) {
    migrated.camera.resolution = migrated.capture.resolution;
  }
  if (migrated.capture.mirror !== undefined && migrated.camera.mirror === undefined) {
    migrated.camera.mirror = migrated.capture.mirror;
  }
  
  // Remove flashEffect from capture
  if (migrated.capture.flashEffect !== undefined) {
    delete migrated.capture.flashEffect;
  }
  
  // Add storageLimitMB to sharing if not present
  if (!migrated.sharing.storageLimitMB) {
    migrated.sharing.storageLimitMB = 100;
  }
  
  // Change printer transport from simulate to usb
  if (migrated.printer.transport === 'simulate') {
    migrated.printer.transport = 'usb';
  }
  
  migrated._version = 18;
  return migrated;
}

async function loadSettings() {
  try {
    const { value } = await Preferences.get({ key: 'snaproll_settings' });
    if (!value) return DEFAULT_SETTINGS;
    let saved = JSON.parse(value);
    
    // Migration from v16 to v17
    if (saved._version === 16) {
      console.log('[Settings] Migrating from v16 to v17...');
      saved = migrateFromV16(saved);
      await Preferences.set({ key: 'snaproll_settings', value: JSON.stringify(saved) });
      console.log('[Settings] Migration complete');
    }
    
    // Migration from v17 to v18
    if (saved._version === 17) {
      console.log('[Settings] Migrating from v17 to v18...');
      saved = migrateFromV17(saved);
      await Preferences.set({ key: 'snaproll_settings', value: JSON.stringify(saved) });
      console.log('[Settings] Migration complete');
    }
    
    // Version mismatch → wipe and use fresh defaults
    if (saved._version !== DEFAULT_SETTINGS._version) {
      console.warn('[Settings] Version mismatch, resetting to defaults');
      await Preferences.remove({ key: 'snaproll_settings' });
      return DEFAULT_SETTINGS;
    }
    
    return deepMerge(DEFAULT_SETTINGS, saved);
  } catch (err) {
    console.error('[Settings] Error loading settings:', err);
    return DEFAULT_SETTINGS;
  }
}

function deepMerge(base, override) {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (
      override[key] !== null &&
      typeof override[key] === 'object' &&
      !Array.isArray(override[key]) &&
      base[key] !== null &&
      typeof base[key] === 'object'
    ) {
      result[key] = deepMerge(base[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [savedSettings, setSavedSettings] = useState(DEFAULT_SETTINGS);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isDirty, setIsDirty] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSettings().then(loadedSettings => {
      setSavedSettings(loadedSettings);
      setSettings(loadedSettings);
      setLoaded(true);
    });
  }, []);

  const updateSettings = useCallback((path, value) => {
    setSettings(prev => {
      const next = structuredClone(prev);
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
    setIsDirty(true);
  }, []);

  const saveSettings = useCallback(async () => {
    await Preferences.set({ key: 'snaproll_settings', value: JSON.stringify(settings) });
    setSavedSettings(structuredClone(settings));
    setIsDirty(false);
  }, [settings]);

  const discardSettings = useCallback(() => {
    setSettings(structuredClone(savedSettings));
    setIsDirty(false);
  }, [savedSettings]);

  const resetSettings = useCallback(async () => {
    await Preferences.remove({ key: 'snaproll_settings' });
    setSavedSettings(DEFAULT_SETTINGS);
    setSettings(structuredClone(DEFAULT_SETTINGS));
    setIsDirty(false);
  }, []);

  if (!loaded) return null;

  return (
    <SettingsContext.Provider value={{
      settings, isDirty,
      updateSettings,
      saveSettings, discardSettings, resetSettings,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export { DEFAULT_SETTINGS, defaultBlocks };
