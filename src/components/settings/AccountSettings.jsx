import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { User, Link2, Unlink, Clock, AlertTriangle, CheckCircle, XCircle, Trash2, ChevronDown, ChevronUp, Download, Upload, Loader2, Lock, AlertCircle, ChevronRight, ExternalLink, Share2, Globe, Printer, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { getLogs, clearLogs } from '../../lib/logger.js';
import { getSupabaseClient } from '../../lib/supabase';
import { useSettings } from '../../context/SettingsContext.jsx';
import { Device } from '@capacitor/device';
import ConfirmDialog from '../ConfirmDialog.jsx';

const DEPENDENCIES = [
  { name: 'React',                      version: '^19.2.6',  license: 'MIT',        note: 'UI framework' },
  { name: 'React DOM',                  version: '^19.2.6',  license: 'MIT',        note: 'DOM renderer' },
  { name: 'Vite',                       version: '^8.0.12',  license: 'MIT',        note: 'Build tool & dev server' },
  { name: '@vitejs/plugin-react',       version: '^6.0.1',   license: 'MIT',        note: 'React fast-refresh' },
  { name: 'Tailwind CSS',               version: '^4.3.0',   license: 'MIT',        note: 'Utility-first CSS' },
  { name: '@tailwindcss/vite',          version: '^4.3.0',   license: 'MIT',        note: 'Vite integration' },
  { name: 'lucide-react',               version: '^1.17.0',  license: 'ISC',        note: 'Icon library' },
  { name: 'JsBarcode',                  version: '^3.12.3',  license: 'MIT',        note: 'Barcode generation on Canvas' },
  { name: '@radix-ui/react-dialog',     version: '^1.1.15',  license: 'MIT',        note: 'Accessible dialog primitive' },
  { name: '@radix-ui/react-label',      version: '^2.1.8',   license: 'MIT',        note: 'Accessible label primitive' },
  { name: '@radix-ui/react-select',     version: '^2.2.6',   license: 'MIT',        note: 'Accessible select primitive' },
  { name: '@radix-ui/react-separator', version: '^1.1.8',   license: 'MIT',        note: 'Accessible separator primitive' },
  { name: '@radix-ui/react-slider',     version: '^1.3.6',   license: 'MIT',        note: 'Accessible slider primitive' },
  { name: '@radix-ui/react-switch',     version: '^1.2.6',   license: 'MIT',        note: 'Accessible switch primitive' },
  { name: '@radix-ui/react-tabs',       version: '^1.1.13',  license: 'MIT',        note: 'Accessible tabs primitive' },
  { name: 'class-variance-authority',   version: '^0.7.1',   license: 'Apache 2.0', note: 'Variant-based class utils' },
  { name: 'clsx',                       version: '^2.1.1',   license: 'MIT',        note: 'Classname utility' },
  { name: 'tailwind-merge',             version: '^3.6.0',   license: 'MIT',        note: 'Tailwind class dedup' },
  { name: 'vite-plugin-pwa',            version: '^1.3.0',   license: 'MIT',        note: 'PWA / service worker' },
  { name: 'ESLint',                     version: '^10.3.0',  license: 'MIT',        note: 'Linter (dev only)' },
];

const PLATFORM_APIS = [
  { name: 'Canvas API',           note: 'Receipt image compositor' },
  { name: 'MediaDevices / getUserMedia', note: 'Camera capture' },
  { name: 'ESC/POS Protocol',     note: 'Thermal printer commands' },
  { name: 'Web Serial / USB OTG', note: 'USB printer transport' },
  { name: 'Service Worker',       note: 'Offline / PWA caching' },
];

const LICENSE_BADGE = {
  MIT:         'bg-blue-500/15 text-blue-400',
  ISC:         'bg-sky-500/15 text-sky-400',
  'Apache 2.0':'bg-orange-500/15 text-orange-400',
};

const CHANGE_TYPE_COLORS = {
  Added: 'bg-green-500/15 text-green-400',
  Changed: 'bg-blue-500/15 text-blue-400',
  Fixed: 'bg-yellow-500/15 text-yellow-400',
  Security: 'bg-red-500/15 text-red-400',
};

function parseChangelog(markdown) {
  const lines = markdown.split('\n');
  const releases = [];
  let currentRelease = null;
  let currentSection = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Version header
    if (line.startsWith('## [')) {
      if (currentRelease) {
        releases.push(currentRelease);
      }
      const versionMatch = line.match(/\[([^\]]+)\]/);
      const dateMatch = line.match(/- (.+)$/);
      currentRelease = {
        version: versionMatch ? versionMatch[1] : 'Unknown',
        date: dateMatch ? dateMatch[1].replace('{date}', new Date().toLocaleDateString()) : 'Unknown',
        changes: []
      };
      currentSection = null;
    }
    // Section header
    else if (line.startsWith('### ')) {
      currentSection = line.substring(4);
    }
    // Change item
    else if (line.startsWith('- ') && currentRelease) {
      const text = line.substring(2);
      const type = currentSection || 'Changed';
      currentRelease.changes.push({ type, text });
    }
  }

  if (currentRelease) {
    releases.push(currentRelease);
  }

  return releases;
}

export default function AccountSettings() {
  const { settings, updateSettings } = useSettings();
  const [pairingData, setPairingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [retrieving, setRetrieving] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', onConfirm: null });
  const [showSecurity, setShowSecurity] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [changelogExpanded, setChangelogExpanded] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [webApisExpanded, setWebApisExpanded] = useState(false);
  const [dependenciesExpanded, setDependenciesExpanded] = useState(false);
  const [changelogData, setChangelogData] = useState([]);
  const [localAnalytics, setLocalAnalytics] = useState({ printCount: 0, imageUploads: 0, sessions: 0 });

  // Security state
  const currentPin = settings.general.settingsPin || '0000';
  const [currentInput, setCurrentInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStatus, setPinStatus] = useState(null);
  const [pinStatusMsg, setPinStatusMsg] = useState('');

  useEffect(() => {
    loadPairingData();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, []);

  // Refresh logs every second
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(getLogs());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load device info
  useEffect(() => {
    async function loadDeviceInfo() {
      try {
        const [id, info, battery] = await Promise.all([
          Device.getId(),
          Device.getInfo(),
          Device.getBatteryInfo(),
        ]);
        setDeviceInfo({ ...id, ...info, ...battery });
      } catch (err) {
        console.error('Failed to get device info:', err);
      }
    }
    loadDeviceInfo();
  }, []);

  // Load changelog
  useEffect(() => {
    async function loadChangelog() {
      try {
        const response = await fetch('/CHANGELOG.md');
        const markdown = await response.text();
        const parsed = parseChangelog(markdown);
        setChangelogData(parsed);
      } catch (err) {
        console.error('Failed to load changelog:', err);
      }
    }
    loadChangelog();
  }, []);

  // Load local analytics
  useEffect(() => {
    async function loadLocalAnalytics() {
      try {
        const { value } = await Preferences.get({ key: 'snaproll_local_analytics' });
        if (value) {
          setLocalAnalytics(JSON.parse(value));
        }
      } catch (err) {
        console.error('Failed to load local analytics:', err);
      }
    }
    loadLocalAnalytics();
  }, []);

  async function loadPairingData() {
    try {
      const pairingValue = await Preferences.get({ key: 'snaproll_pairing' });
      if (pairingValue.value) {
        const pairing = JSON.parse(pairingValue.value);
        const expiryTime = new Date(pairing.expiresAt).getTime();
        const now = Date.now();
        
        if (now < expiryTime) {
          setPairingData(pairing);
          updateTimeRemaining();
        } else {
          // Pairing expired, clear it
          await Preferences.remove({ key: 'snaproll_pairing' });
          setPairingData(null);
        }
      }
    } catch (err) {
      console.error('Failed to load pairing data:', err);
    } finally {
      setLoading(false);
    }
  }

  function updateTimeRemaining() {
    if (!pairingData) return;
    
    const expiryTime = new Date(pairingData.expiresAt).getTime();
    const now = Date.now();
    const remaining = expiryTime - now;
    
    if (remaining <= 0) {
      setTimeRemaining(null);
      handleUnpair();
      return;
    }

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    setTimeRemaining({ hours, minutes, seconds });
  }

  async function handleUnpair() {
    try {
      await Preferences.remove({ key: 'snaproll_pairing' });
      setPairingData(null);
      setTimeRemaining(null);
    } catch (err) {
      console.error('Failed to unpair:', err);
    }
  }

  function showConfirm(title, description, onConfirm) {
    setConfirmDialog({ open: true, title, description, onConfirm });
  }

  function handlePair() {
    // Trigger pairing modal - this will be handled by the parent component
    // For now, we'll dispatch a custom event
    window.dispatchEvent(new CustomEvent('open-pairing-modal'));
  }

  async function handleBackup() {
    if (!pairingData) {
      showConfirm(
        'Not Paired',
        'Please pair your device first to backup settings to cloud.',
        () => {}
      );
      return;
    }

    setBackingUp(true);
    try {
      // Get all preferences keys
      const allKeys = [
        'snaproll_settings_general',
        'snaproll_settings_camera',
        'snaproll_settings_printer',
        'snaproll_settings_templates',
      ];

      const backupData = {};
      for (const key of allKeys) {
        const { value } = await Preferences.get({ key });
        if (value) {
          backupData[key] = value;
        }
      }

      // Save to Supabase
      const supabase = await getSupabaseClient();
      if (!supabase) {
        throw new Error('Failed to get Supabase client');
      }

      const { error } = await supabase
        .from('settings_backups')
        .upsert({
          device_id: pairingData.deviceId,
          app_id: pairingData.appId,
          settings: backupData,
        }, {
          onConflict: 'device_id'
        });

      if (error) throw error;

      console.log('Settings backed up to cloud successfully');
      showConfirm(
        'Backup Successful',
        'Settings have been backed up to cloud successfully.',
        () => {}
      );
    } catch (err) {
      console.error('Failed to backup settings:', err);
      showConfirm(
        'Backup Failed',
        'Failed to backup settings: ' + err.message,
        () => {}
      );
    } finally {
      setBackingUp(false);
    }
  }

  async function handleRetrieve() {
    if (!pairingData) {
      showConfirm(
        'Not Paired',
        'Please pair your device first to retrieve settings from cloud.',
        () => {}
      );
      return;
    }

    setRetrieving(true);
    try {
      // Fetch from Supabase
      const supabase = await getSupabaseClient();
      if (!supabase) {
        throw new Error('Failed to get Supabase client');
      }

      const { data, error } = await supabase
        .from('settings_backups')
        .select('settings')
        .eq('device_id', pairingData.deviceId)
        .single();

      if (error) throw error;

      if (!data || !data.settings) {
        showConfirm(
          'No Backup Found',
          'No backup found for this device.',
          () => {}
        );
        return;
      }

      // Restore all preferences
      for (const [key, value] of Object.entries(data.settings)) {
        await Preferences.set({ key, value });
      }

      console.log('Settings retrieved from cloud successfully');
      showConfirm(
        'Retrieve Successful',
        'Settings retrieved from cloud successfully. Reloading...',
        () => {
          setTimeout(() => window.location.reload(), 1000);
        }
      );
      
      // Reload the page to apply changes
      // setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error('Failed to retrieve settings:', err);
      showConfirm(
        'Retrieve Failed',
        'Failed to retrieve settings: ' + err.message,
        () => {}
      );
    } finally {
      setRetrieving(false);
    }
  }

  function handlePinChange() {
    setPinStatus(null);

    if (currentInput !== currentPin) {
      setPinStatus('error');
      setPinStatusMsg('Current PIN is incorrect');
      return;
    }

    if (!/^\d{4}$/.test(newPin)) {
      setPinStatus('error');
      setPinStatusMsg('New PIN must be exactly 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      setPinStatus('error');
      setPinStatusMsg('New PINs do not match');
      return;
    }

    updateSettings('general.settingsPin', newPin);
    setPinStatus('success');
    setPinStatusMsg('PIN changed successfully');
    setCurrentInput('');
    setNewPin('');
    setConfirmPin('');
  }

  async function handleIncrementPrintCount() {
    const newAnalytics = { ...localAnalytics, printCount: localAnalytics.printCount + 1 };
    setLocalAnalytics(newAnalytics);
    await Preferences.set({ key: 'snaproll_local_analytics', value: JSON.stringify(newAnalytics) });
  }

  async function handleIncrementImageUploads() {
    const newAnalytics = { ...localAnalytics, imageUploads: localAnalytics.imageUploads + 1 };
    setLocalAnalytics(newAnalytics);
    await Preferences.set({ key: 'snaproll_local_analytics', value: JSON.stringify(newAnalytics) });
  }

  async function handleIncrementSessions() {
    const newAnalytics = { ...localAnalytics, sessions: localAnalytics.sessions + 1 };
    setLocalAnalytics(newAnalytics);
    await Preferences.set({ key: 'snaproll_local_analytics', value: JSON.stringify(newAnalytics) });
  }

  async function handleResetAnalytics() {
    showConfirm(
      'Reset Analytics',
      'Reset all local analytics to zero?',
      async () => {
        const newAnalytics = { printCount: 0, imageUploads: 0, sessions: 0 };
        setLocalAnalytics(newAnalytics);
        await Preferences.set({ key: 'snaproll_local_analytics', value: JSON.stringify(newAnalytics) });
      }
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-md-outline border-t-md-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Pairing Status Card */}
      <div className="rounded-2xl border border-md-outline-variant bg-md-surface-container overflow-hidden">
        <div className="px-4 py-3 bg-md-surface-container-high border-b border-md-outline-variant">
          <span className="text-[10px] font-medium tracking-widest uppercase text-md-outline">Account Status</span>
        </div>
        
        <div className="p-6">
          {pairingData ? (
            <div className="space-y-4">
              {/* Paired Status */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-md-primary-container flex items-center justify-center">
                  <CheckCircle size={20} className="text-md-on-primary-container" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-md-on-surface">Paired</p>
                  <p className="text-xs text-md-on-surface-variant">Connected</p>
                </div>
              </div>

              {/* Expiry Timer */}
              {timeRemaining && (
                <div className="bg-md-surface-container-high rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-md-primary" />
                    <p className="text-xs text-md-on-surface-variant">Auto-unpair in</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-md-surface rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-md-on-surface">{timeRemaining.hours}</p>
                      <p className="text-xs text-md-on-surface-variant">Hours</p>
                    </div>
                    <div className="flex-1 bg-md-surface rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-md-on-surface">{timeRemaining.minutes}</p>
                      <p className="text-xs text-md-on-surface-variant">Minutes</p>
                    </div>
                    <div className="flex-1 bg-md-surface rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-md-on-surface">{timeRemaining.seconds}</p>
                      <p className="text-xs text-md-on-surface-variant">Seconds</p>
                    </div>
                  </div>
                  {timeRemaining.hours < 1 && (
                    <div className="flex items-center gap-2 mt-3 text-md-error">
                      <AlertTriangle size={14} />
                      <p className="text-xs">Expiring soon!</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="space-y-4">
              {/* Unpaired Status */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-md-surface-container-high flex items-center justify-center">
                  <XCircle size={20} className="text-md-outline" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-md-on-surface">Not Paired</p>
                  <p className="text-xs text-md-on-surface-variant">Connect to enable cloud features</p>
                </div>
              </div>

              {/* Features List */}
              <div className="bg-md-surface-container-high rounded-xl p-4 space-y-2">
                <p className="text-xs text-md-on-surface-variant mb-3">Cloud features when paired:</p>
                <div className="flex items-center gap-2 text-sm text-md-on-surface">
                  <CheckCircle size={14} className="text-md-primary" />
                  <span>Photo upload to cloud</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-md-on-surface">
                  <CheckCircle size={14} className="text-md-primary" />
                  <span>Digital download QR codes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-md-on-surface">
                  <CheckCircle size={14} className="text-md-primary" />
                  <span>Device status tracking</span>
                </div>
              </div>

              {/* Pair Button */}
              <button
                onClick={handlePair}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-md-primary text-md-on-primary hover:brightness-110 transition-colors shadow"
              >
                <Link2 size={18} />
                Pair Device
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Local Analytics Card */}
      <div className="rounded-2xl border border-md-outline-variant bg-md-surface-container overflow-hidden">
        <div className="px-4 py-3 bg-md-surface-container-high border-b border-md-outline-variant flex items-center justify-between">
          <span className="text-[10px] font-medium tracking-widest uppercase text-md-outline">Local Analytics</span>
          <button
            onClick={handleResetAnalytics}
            className="flex items-center gap-1 text-xs text-md-primary hover:bg-md-primary-container rounded-md px-2 py-1 transition-colors"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-md-surface-container-high rounded-xl p-4 text-center">
              <Printer size={20} className="mx-auto mb-2 text-md-primary" />
              <p className="text-2xl font-bold text-md-on-surface">{localAnalytics.printCount}</p>
              <p className="text-xs text-md-on-surface-variant">Prints</p>
            </div>
            <div className="bg-md-surface-container-high rounded-xl p-4 text-center">
              <ImageIcon size={20} className="mx-auto mb-2 text-md-primary" />
              <p className="text-2xl font-bold text-md-on-surface">{localAnalytics.imageUploads}</p>
              <p className="text-xs text-md-on-surface-variant">Uploads</p>
            </div>
            <div className="bg-md-surface-container-high rounded-xl p-4 text-center">
              <User size={20} className="mx-auto mb-2 text-md-primary" />
              <p className="text-2xl font-bold text-md-on-surface">{localAnalytics.sessions}</p>
              <p className="text-xs text-md-on-surface-variant">Sessions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Icon Card */}
      <div className="rounded-2xl border border-md-outline-variant bg-md-surface-container overflow-hidden">
        <div className="px-4 py-3 bg-md-surface-container-high border-b border-md-outline-variant">
          <span className="text-[10px] font-medium tracking-widest uppercase text-md-outline">Settings Icon</span>
        </div>
        <div className="p-4 space-y-4">
          {/* Hide Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock size={18} className="text-md-primary" />
              <div>
                <p className="text-sm font-medium text-md-on-surface">Hide Settings Icon</p>
                <p className="text-xs text-md-on-surface-variant">Use long press on home screen instead</p>
              </div>
            </div>
            <button
              role="switch"
              aria-checked={settings.general.hideSettingsIcon ?? false}
              onClick={() => updateSettings('general.hideSettingsIcon', !(settings.general.hideSettingsIcon ?? false))}
              className={`relative inline-flex flex-shrink-0 w-[52px] h-[32px] rounded-full transition-colors duration-200 ${
                (settings.general.hideSettingsIcon ?? false)
                  ? 'bg-md-primary'
                  : 'bg-md-surface-container-highest ring-2 ring-inset ring-md-outline'
              }`}
            >
              <span
                className={`pointer-events-none absolute top-[4px] left-[4px] w-[24px] h-[24px] rounded-full shadow-md transition-all duration-200 ease-out ${
                  (settings.general.hideSettingsIcon ?? false) ? 'translate-x-[20px] bg-md-on-primary' : 'translate-x-0 bg-md-on-surface-variant'
                }`}
              />
            </button>
          </div>

          {/* Opacity Slider - only show if not hidden */}
          {!settings.general.hideSettingsIcon && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-md-on-surface">Icon Opacity</p>
                <p className="text-xs text-md-primary font-semibold">{settings.general.settingsIconOpacity ?? 100}%</p>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={settings.general.settingsIconOpacity ?? 100}
                onChange={e => updateSettings('general.settingsIconOpacity', parseInt(e.target.value))}
                className="w-full h-2 bg-md-surface-container-highest rounded-lg appearance-none cursor-pointer accent-md-primary"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-md-on-surface-variant">10%</span>
                <span className="text-[10px] text-md-on-surface-variant">100%</span>
              </div>
            </div>
          )}

          {/* Long Press Info */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-md-surface-container-high border border-md-outline-variant">
            <AlertCircle size={16} className="text-md-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-md-on-surface-variant leading-relaxed">
              {settings.general.hideSettingsIcon 
                ? 'Long press on home screen for 3 seconds to open settings.'
                : 'You can also long press on home screen for 3 seconds to open settings.'}
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-2xl border border-md-outline-variant bg-md-surface-container overflow-hidden">
        <div className="px-4 py-3 bg-md-surface-container-high border-b border-md-outline-variant">
          <span className="text-[10px] font-medium tracking-widest uppercase text-md-outline">Information</span>
        </div>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <User size={18} className="text-md-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-md-on-surface-variant leading-relaxed">
              Pairing connects your device to the portal for cloud features. 
              Pairings automatically expire after 24 hours for security. 
              You can re-pair at any time using the pairing code from the portal.
            </p>
          </div>
        </div>
      </div>

      {/* Security Card */}
      <div className="rounded-2xl border border-md-outline-variant bg-md-surface-container overflow-hidden">
        <div 
          className="px-4 py-3 bg-md-surface-container-high border-b border-md-outline-variant flex items-center justify-between cursor-pointer"
          onClick={() => setShowSecurity(!showSecurity)}
        >
          <span className="text-[10px] font-medium tracking-widest uppercase text-md-outline">Security</span>
          {showSecurity ? <ChevronUp size={16} className="text-md-outline" /> : <ChevronDown size={16} className="text-md-outline" />}
        </div>
        {showSecurity && (
          <div className="p-4 space-y-5">
            {/* Current PIN */}
            <div>
              <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Current PIN</label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={currentInput}
                onChange={e => setCurrentInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary tracking-[0.5em] font-mono"
                placeholder="••••"
              />
            </div>

            {/* New PIN */}
            <div>
              <label className="block text-xs font-medium text-md-on-surface-variant mb-2">New PIN</label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary tracking-[0.5em] font-mono"
                placeholder="••••"
              />
            </div>

            {/* Confirm New PIN */}
            <div>
              <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Confirm New PIN</label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={confirmPin}
                onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary tracking-[0.5em] font-mono"
                placeholder="••••"
              />
            </div>

            {/* Status */}
            {pinStatus && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
                pinStatus === 'success'
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {pinStatus === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {pinStatusMsg}
              </div>
            )}

            {/* Save */}
            <button
              onClick={handlePinChange}
              className="w-full flex items-center justify-center gap-2 bg-md-primary text-md-on-primary rounded-xl py-3 text-sm font-medium hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <Lock size={14} /> Change PIN
            </button>
          </div>
        )}
      </div>

      {/* About Card */}
      <div className="rounded-2xl border border-md-outline-variant bg-md-surface-container overflow-hidden">
        <div 
          className="px-4 py-3 bg-md-surface-container-high border-b border-md-outline-variant flex items-center justify-between cursor-pointer"
          onClick={() => setShowAbout(!showAbout)}
        >
          <span className="text-[10px] font-medium tracking-widest uppercase text-md-outline">About</span>
          {showAbout ? <ChevronUp size={16} className="text-md-outline" /> : <ChevronDown size={16} className="text-md-outline" />}
        </div>
        {showAbout && (
          <div className="p-4 space-y-4">
            {/* About Mono Studio */}
            <div className="rounded-[20px] bg-md-primary-container px-5 py-5 space-y-1">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-md-on-primary-container">MONO BOOTH PH</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-md-on-primary-container/10 text-md-on-primary-container/70">
                  v0.1.0-mvp
                </span>
              </div>
              <p className="text-sm text-md-on-primary-container/80">
                Receipt Photobooth — print memories, one strip at a time.
              </p>
              <p className="text-xs text-md-on-primary-container/60 leading-relaxed pt-1">
                No proof without @monoboothph — show 'em the receipts! 🧾✨
              </p>
              <p className="text-xs text-md-on-primary-container/60 leading-relaxed">
                📍 Kabankalan City & Beyond
              </p>
            </div>

            {/* Developer */}
            <div className="rounded-[16px] bg-md-surface-container p-4 space-y-2">
              <p className="text-xs font-medium uppercase tracking-widest text-md-on-surface-variant">Developer</p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-md-secondary-container flex items-center justify-center text-md-on-secondary-container font-semibold text-base select-none">
                  JP
                </div>
                <div>
                  <div className="text-sm font-semibold text-md-on-surface">Jubet M. Padilla</div>
                  <div className="text-xs text-md-on-surface-variant">Designer &amp; Developer</div>
                </div>
              </div>
            </div>

            {/* Connect */}
            <div className="rounded-[16px] bg-md-surface-container p-4 space-y-3">
              <p className="text-xs font-medium uppercase tracking-widest text-md-on-surface-variant">Connect</p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://instagram.com/monoboothph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-md-surface-container-high hover:bg-md-surface-container-highest transition-colors"
                >
                  <Share2 size={18} className="text-md-on-surface" />
                  <span className="text-sm text-md-on-surface">@monoboothph</span>
                  <ExternalLink size={12} className="text-md-outline ml-auto" />
                </a>
                <a
                  href="https://facebook.com/monoboothph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-md-surface-container-high hover:bg-md-surface-container-highest transition-colors"
                >
                  <Globe size={18} className="text-md-on-surface" />
                  <span className="text-sm text-md-on-surface">MONO BOOTH PH</span>
                  <ExternalLink size={12} className="text-md-outline ml-auto" />
                </a>
              </div>
            </div>

            {/* Changelog */}
            <div className="space-y-2">
              <button
                onClick={() => setChangelogExpanded(!changelogExpanded)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-md-surface-container border border-md-outline-variant hover:bg-md-surface-container-high transition-colors"
              >
                <p className="text-xs font-medium uppercase tracking-widest text-md-on-surface-variant">Changelog</p>
                {changelogExpanded ? <ChevronDown className="w-4 h-4 text-md-on-surface-variant" /> : <ChevronRight className="w-4 h-4 text-md-on-surface-variant" />}
              </button>
              {changelogExpanded && (
                <div className="rounded-xl overflow-hidden border border-md-outline-variant divide-y divide-md-outline-variant">
                  {changelogData.map((release) => (
                    <div key={release.version} className="bg-md-surface-container p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-md-on-surface">{release.version}</span>
                        <span className="text-xs text-md-on-surface-variant">{release.date}</span>
                      </div>
                      <div className="space-y-2">
                        {release.changes.map((change, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${CHANGE_TYPE_COLORS[change.type] ?? 'bg-md-surface-container-highest text-md-on-surface-variant'}`}>
                              {change.type}
                            </span>
                            <span className="text-xs text-md-on-surface-variant leading-relaxed">{change.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Device Info */}
            {deviceInfo && (
              <div className="rounded-[16px] bg-md-surface-container p-4 space-y-2">
                <p className="text-xs font-medium uppercase tracking-widest text-md-on-surface-variant">Device Info</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-md-on-surface-variant">Device ID</span>
                    <span className="text-xs font-mono text-md-on-surface">{deviceInfo.identifier || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-md-on-surface-variant">Model</span>
                    <span className="text-xs text-md-on-surface">{deviceInfo.model || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-md-on-surface-variant">Platform</span>
                    <span className="text-xs text-md-on-surface">{deviceInfo.platform || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-md-on-surface-variant">OS Version</span>
                    <span className="text-xs text-md-on-surface">{deviceInfo.osVersion || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-md-on-surface-variant">Manufacturer</span>
                    <span className="text-xs text-md-on-surface">{deviceInfo.manufacturer || 'N/A'}</span>
                  </div>
                  {deviceInfo.batteryLevel !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-md-on-surface-variant">Battery</span>
                      <span className="text-xs text-md-on-surface">{Math.round(deviceInfo.batteryLevel * 100)}%</span>
                    </div>
                  )}
                  {deviceInfo.isCharging !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-md-on-surface-variant">Charging</span>
                      <span className="text-xs text-md-on-surface">{deviceInfo.isCharging ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Web Platform APIs */}
            <div className="space-y-2">
              <button
                onClick={() => setWebApisExpanded(!webApisExpanded)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-md-surface-container border border-md-outline-variant hover:bg-md-surface-container-high transition-colors"
              >
                <p className="text-xs font-medium uppercase tracking-widest text-md-on-surface-variant">Web Platform APIs</p>
                {webApisExpanded ? <ChevronDown className="w-4 h-4 text-md-on-surface-variant" /> : <ChevronRight className="w-4 h-4 text-md-on-surface-variant" />}
              </button>
              {webApisExpanded && (
                <div className="rounded-xl overflow-hidden border border-md-outline-variant divide-y divide-md-outline-variant">
                  {PLATFORM_APIS.map(a => (
                    <div key={a.name} className="flex items-center justify-between px-4 py-3 bg-md-surface-container">
                      <span className="text-sm text-md-on-surface font-medium">{a.name}</span>
                      <span className="text-xs text-md-on-surface-variant ml-2 text-right">{a.note}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Open-source dependencies */}
            <div className="space-y-2">
              <button
                onClick={() => setDependenciesExpanded(!dependenciesExpanded)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-md-surface-container border border-md-outline-variant hover:bg-md-surface-container-high transition-colors"
              >
                <p className="text-xs font-medium uppercase tracking-widest text-md-on-surface-variant">Open-Source Dependencies</p>
                {dependenciesExpanded ? <ChevronDown className="w-4 h-4 text-md-on-surface-variant" /> : <ChevronRight className="w-4 h-4 text-md-on-surface-variant" />}
              </button>
              {dependenciesExpanded && (
                <div className="rounded-xl overflow-hidden border border-md-outline-variant divide-y divide-md-outline-variant">
                  {DEPENDENCIES.map(d => (
                    <div key={d.name} className="flex items-start justify-between px-4 py-3 bg-md-surface-container gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-md-on-surface font-medium truncate">{d.name}</div>
                        <div className="text-xs text-md-on-surface-variant">{d.version} · {d.note}</div>
                      </div>
                      <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${LICENSE_BADGE[d.license] ?? 'bg-md-surface-container-highest text-md-on-surface-variant'}`}>
                        {d.license}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* App license */}
            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-md-surface-container border border-md-outline-variant">
              <span className="text-xs text-md-on-surface-variant">This project</span>
              <span className="text-xs font-semibold text-md-on-surface">Private / MVP — All rights reserved</span>
            </div>
          </div>
        )}
      </div>

      {/* Debug Logs Card */}
      <div className="rounded-2xl border border-md-outline-variant bg-md-surface-container overflow-hidden">
        <div 
          className="px-4 py-3 bg-md-surface-container-high border-b border-md-outline-variant flex items-center justify-between cursor-pointer"
          onClick={() => setShowLogs(!showLogs)}
        >
          <span className="text-[10px] font-medium tracking-widest uppercase text-md-outline">Debug Logs</span>
          {showLogs ? <ChevronUp size={16} className="text-md-outline" /> : <ChevronDown size={16} className="text-md-outline" />}
        </div>
        {showLogs && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-md-on-surface-variant">{logs.length} log entries</span>
              <button
                onClick={() => clearLogs()}
                className="flex items-center gap-1 text-xs text-md-error hover:underline"
              >
                <Trash2 size={12} />
                Clear
              </button>
            </div>
            <div className="bg-md-surface rounded-xl p-3 h-64 overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-md-on-surface-variant text-center py-8">No logs yet</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className={`mb-1 ${log.type === 'error' ? 'text-md-error' : log.type === 'warn' ? 'text-orange-500' : 'text-md-on-surface'}`}>
                    <span className="text-md-outline-variant">[{log.timestamp}]</span> {log.message}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={() => {
          if (confirmDialog.onConfirm) confirmDialog.onConfirm();
        }}
      />
    </div>
  );
}
