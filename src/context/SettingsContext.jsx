import { createContext, useContext, useState, useCallback } from 'react';

// Font size guide (203 DPI): 20px ≈ 2.5mm, 28px ≈ 3.5mm, 40px ≈ 5mm
function defaultBlocks() {
  return {
    header:     { enabled: true,  text: '', title: '', subtitle: '', image: null, fontSize: 42, alignment: 'center', bold: true },
    photos:     { enabled: true,  borderStyle: 'thin', borderColor: '#000000', gap: 8 },
    divider:    { enabled: true,  style: 'solid', thickness: 2, color: '#aaaaaa' },
    elementSpacing: 16,
    datetime:   { enabled: true,  format: 'MMM DD, YYYY  HH:mm' },
    customText: { enabled: true,  content: '#SnapAndRoll',           fontSize: 28, alignment: 'center' },
    barcode:    { enabled: true,  value: 'SNAPROLL001', type: 'CODE128', showText: true },
    footer:     { enabled: true,  text: 'Thank you for the memories!', fontSize: 26, alignment: 'center' },
    backgroundColor: '#ffffff',
    blockOrder: ['header', 'dividerBefore', 'photos', 'dividerAfter', 'datetime', 'customText', 'barcode', 'footer'],
  };
}

const DEFAULT_SETTINGS = {
  _version: 7, // bump to force localStorage refresh when defaults change
  general: {
    boothName: 'Snap & Roll',
    eventName: 'Receipt Photobooth',
    logoBase64: null,
    theme: 'dark',
    accent: 'purple',
    fontPair: 'modern',
    brandingIcon: null,
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

function loadSettings() {
  try {
    const raw = localStorage.getItem('snaproll_settings');
    if (!raw) return DEFAULT_SETTINGS;
    const saved = JSON.parse(raw);
    // Version mismatch → wipe and use fresh defaults
    if (saved._version !== DEFAULT_SETTINGS._version) {
      localStorage.removeItem('snaproll_settings');
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
  const [savedSettings, setSavedSettings] = useState(loadSettings);
  const [settings, setSettings] = useState(loadSettings);
  const [isDirty, setIsDirty] = useState(false);

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

  const saveSettings = useCallback(() => {
    localStorage.setItem('snaproll_settings', JSON.stringify(settings));
    setSavedSettings(structuredClone(settings));
    setIsDirty(false);
  }, [settings]);

  const discardSettings = useCallback(() => {
    setSettings(structuredClone(savedSettings));
    setIsDirty(false);
  }, [savedSettings]);

  const resetSettings = useCallback(() => {
    localStorage.removeItem('snaproll_settings');
    setSavedSettings(DEFAULT_SETTINGS);
    setSettings(structuredClone(DEFAULT_SETTINGS));
    setIsDirty(false);
  }, []);

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
