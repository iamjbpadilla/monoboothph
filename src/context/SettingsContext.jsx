import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';

// Font size guide (203 DPI): 20px ≈ 2.5mm, 28px ≈ 3.5mm, 40px ≈ 5mm
function defaultBlocks() {
  return {
    header:     { enabled: true,  text: '', title: '', subtitle: '', image: null, fontSize: 42, alignment: 'center', bold: true },
    photos:     { enabled: true,  borderStyle: 'thin', borderColor: '#000000', gap: 8 },
    divider:    { enabled: true,  style: 'dashed', thickness: 2, color: '#000000' },
    elementSpacing: 16,
    datetime:   { enabled: true,  format: 'MMM DD, YYYY  HH:mm' },
    customText: { enabled: false, content: '#SnapAndRoll',           fontSize: 28, alignment: 'center' },
    receiptItems: { enabled: false, items: [], fontSize: 20, showTotal: true, showQty: true, randomize: false },
    barcode:    { enabled: true,  value: 'SNAPROLL001', type: 'CODE128', showText: false },
    footer:     { enabled: true,  text: 'Thank you for the memories!', fontSize: 26, alignment: 'center' },
    backgroundColor: '#ffffff',
    blockOrder: ['datetime', 'header', 'dividerBefore', 'photos', 'dividerAfter', 'customText', 'receiptItems', 'barcode', 'footer'],
  };
}

const DEFAULT_SETTINGS = {
  _version: 9, // bump to force preferences refresh when defaults change
  general: {
    boothName: 'MONO STUDIO PH',
    eventName: 'Receipt Photobooth',
    logoBase64: null,
    theme: 'light',
    accent: 'purple',
    fontPair: 'modern',
    brandingIcon: null,
    standbyBackground: 'plain',
    showAdvertising: true,
    adDuration: 5,
  },
  camera: {
    deviceId: '',
    resolution: 'hd',
    mirror: true,
  },
  printer: {
    transport: 'simulate',
    wifiIp: '192.168.1.100',
    wifiPort: '9100',
    dpi: 203,
    paperWidthMm: 80,
  },
  capture: {
    countdownSeconds: 3,
    flashEffect: true,
  },
  templates: {
    blocks: defaultBlocks(),
  },
};

async function loadSettings() {
  try {
    const { value } = await Preferences.get({ key: 'snaproll_settings' });
    if (!value) return DEFAULT_SETTINGS;
    const saved = JSON.parse(value);
    // Version mismatch → wipe and use fresh defaults
    if (saved._version !== DEFAULT_SETTINGS._version) {
      await Preferences.remove({ key: 'snaproll_settings' });
      return DEFAULT_SETTINGS;
    }
    return deepMerge(DEFAULT_SETTINGS, saved);
  } catch {
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

export { DEFAULT_SETTINGS };
