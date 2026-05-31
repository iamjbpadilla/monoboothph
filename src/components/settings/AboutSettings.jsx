import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Device } from '@capacitor/device';

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
  { name: 'Web Bluetooth',        note: 'BT printer transport' },
  { name: 'Service Worker',       note: 'Offline / PWA caching' },
];

const LICENSE_BADGE = {
  MIT:         'bg-blue-500/15 text-blue-400',
  ISC:         'bg-sky-500/15 text-sky-400',
  'Apache 2.0':'bg-orange-500/15 text-orange-400',
};

const CHANGELOG_DATA = [
  {
    version: 'Unreleased',
    date: new Date().toLocaleDateString(),
    changes: [
      { type: 'Changed', text: 'Advertising screen now displays MONO STUDIO PH marketing content with camera icon, branding, and Facebook link' },
      { type: 'Changed', text: 'Advertising screen now has functional countdown timer (shows seconds remaining)' },
      { type: 'Added', text: 'Advertising/marketing screen shown after print success (configurable duration: 3, 5, or 10 seconds)' },
      { type: 'Added', text: 'Settings entry for advertising page (enable/disable toggle and duration selector)' },
      { type: 'Changed', text: 'Expanded test text generation in Settings > Identity with 36 titles and 36 subtitles for more variety' },
      { type: 'Changed', text: 'Removed return button from template selection screen' },
      { type: 'Added', text: '20-second auto-return timer on template selection if start button not pressed' },
      { type: 'Changed', text: 'Standby background options now display in single line with horizontal scroll' },
      { type: 'Changed', text: 'Updated accent colors to more vibrant Material Design colors (Purple, Pink, Red, Orange, Amber, Yellow, Lime, Green, Teal, Cyan, Blue, Indigo, Violet, Rose, Deep Purple)' },
      { type: 'Changed', text: 'Removed navigation bar and back button from camera capture mode for larger preview area' },
      { type: 'Fixed', text: 'Persistent fullscreen mode - updated MainActivity to use modern WindowInsetsController API for Android 11+' },
      { type: 'Changed', text: 'Camera now queries and uses actual supported resolutions from track capabilities' },
      { type: 'Changed', text: 'Front camera set as default (facingMode: user)' },
      { type: 'Changed', text: 'App now runs in fullscreen mode (status bar and navigation bar hidden)' },
      { type: 'Fixed', text: 'Mirror toggle button in Camera settings - now matches template toggle styling exactly' },
      { type: 'Added', text: 'Reset button for camera device and options in Camera settings' },
      { type: 'Changed', text: 'Default theme changed from Dark to Light' },
      { type: 'Added', text: '6 new accent colors: Cyan, Lime, Violet, Brown, Slate, Olive' },
      { type: 'Changed', text: 'Mirror button on print preview now has fixed width (w-32)' },
      { type: 'Changed', text: 'Removed download button from print preview' },
      { type: 'Fixed', text: 'Mirror toggle button visual bug in Camera settings - fixed styling and positioning' },
      { type: 'Changed', text: 'Removed 4K resolution option from Camera settings (kept HD and Full HD only)' },
      { type: 'Changed', text: 'Settings icon now only shows on standby screen' },
      { type: 'Changed', text: 'Barcode resized to match full content width (same as images)' },
      { type: 'Changed', text: 'All receipt template texts changed to solid black (#000000)' },
      { type: 'Changed', text: 'Default divider thickness changed from 6 to 2' },
      { type: 'Changed', text: 'Default template: moved timestamp to top of block order' },
      { type: 'Changed', text: 'Default template: disabled custom text by default' },
      { type: 'Changed', text: 'Default template: divider set to black, dashed, 2 thickness' },
      { type: 'Added', text: 'Receipt items: randomize every print option to generate witty items' },
      { type: 'Added', text: 'Template settings: added up/down buttons to all blocks for reordering' },
      { type: 'Changed', text: 'Reordered About page sections: About Mono Studio, Developer, Connect, Changelog, How to Use, Device Info, Web APIs, Dependencies' },
      { type: 'Changed', text: 'Removed email and phone number from Connect section in About settings' },
      { type: 'Added', text: 'Option to hide Qty column on receipt items block' },
      { type: 'Changed', text: 'Camera shutter sound updated to DSLR-like mechanical sound with click and mirror slap' },
      { type: 'Fixed', text: 'Triple template supporting text not visible - increased card height from 280px to 320px' },
      { type: 'Fixed', text: 'Chosen branding icon not appearing on standby screen - added missing icons to ICON_MAP' },
      { type: 'Changed', text: 'Removed unused standby background patterns (kept only plain, grid, dots, lines)' },
      { type: 'Fixed', text: 'Mirror button glitch on print preview - replaced icon with text label' },
      { type: 'Fixed', text: 'Print status footer mismatched with standby screen - standardized footer text' },
      { type: 'Added', text: 'Mirror button on print preview to horizontally flip images before printing' },
      { type: 'Changed', text: 'Print status auto-return timer increased from 10 to 20 seconds' },
      { type: 'Changed', text: 'QR code size increased from 148px to 200px for better scannability' },
      { type: 'Added', text: 'Mock receipt purchased items block with customizable item name, quantity, and price' },
      { type: 'Added', text: 'Witty random items auto-populate feature (Good Vibes, Bad Decisions, Y2K Energy, etc.)' },
      { type: 'Added', text: 'Receipt items table rendering with ITEM, QTY, PRICE columns and total calculation' },
      { type: 'Added', text: '5 new standby background patterns: wave, geometric, marble, noise, gradient' },
      { type: 'Added', text: '24 new branding icons: celebration, confetti, balloon, champagne, pizza, burger, and more' },
      { type: 'Added', text: 'Social media links section in About settings (Instagram, Facebook)' },
      { type: 'Added', text: 'Contact information section in About settings (email, phone)' },
      { type: 'Added', text: 'How to Use quick guide in About settings with 4-step instructions' },
      { type: 'Changed', text: 'Template cards now have uniform height (280px) for consistent layout' },
      { type: 'Changed', text: 'Standby background previews now use theme-aware CSS for dark/light visibility' },
      { type: 'Changed', text: 'Footer branding standardized across all waiting screens (Standby, Cleaning, Composing, PrintStatus)' },
      { type: 'Changed', text: 'Rebranded from Snap & Roll to MONO STUDIO PH throughout the app' },
      { type: 'Changed', text: 'Package name updated to com.momostudioph.receipt' },
      { type: 'Changed', text: 'Added tagline and location to footer: No proof without @monoboothph, Kabankalan City & Beyond' },
      { type: 'Fixed', text: 'Settings panel not displaying contents - converted inline styles to CSS classes' },
      { type: 'Fixed', text: 'Print preview stuttering on high-resolution cameras - downsampling to max 1200px width' },
      { type: 'Fixed', text: 'Animation glitch - bumped settings version to clear stale state' },
      { type: 'Added', text: 'Security hardening: Enabled R8/ProGuard for native code obfuscation in release builds' },
      { type: 'Added', text: 'Security hardening: Replaced localStorage with Capacitor Preferences for encrypted storage using Android Keystore' },
      { type: 'Added', text: 'Guided intro modal for first app launch with 3-step onboarding flow' },
      { type: 'Added', text: 'Automatic font download script using Google Fonts CSS API' },
      { type: 'Added', text: 'Local font bundling for offline use (11 font families with multiple weights)' },
      { type: 'Added', text: 'WAKE_LOCK permission to keep screen on during kiosk mode' },
      { type: 'Added', text: 'Changelog system to document all changes' },
      { type: 'Added', text: 'Modal animations: fade out, scale, slide-in effects for intro and permission modals' },
      { type: 'Added', text: 'Device ID display in About settings using @capacitor/device' },
      { type: 'Added', text: 'Extended device info with model, platform, OS version, manufacturer, battery level, and charging status' },
      { type: 'Changed', text: 'Updated developer name to Jubet M. Padilla' },
      { type: 'Changed', text: 'Moved countdown timer from Capture to Camera settings' },
      { type: 'Changed', text: 'Removed flash effect option from Capture settings' },
      { type: 'Changed', text: 'Removed Capture tab from settings panel' },
      { type: 'Changed', text: 'Reordered settings tabs: General > Templates > Camera > Printer > About' },
      { type: 'Fixed', text: 'App glitch on startup (modals flashing before permission checks complete)' },
      { type: 'Added', text: 'Branded loading screen during permission checks' },
      { type: 'Added', text: 'Smooth fade transitions for modals' },
      { type: 'Added', text: 'Staggered animations to modals' },
      { type: 'Added', text: 'Enhanced Standby screen entry animation' },
      { type: 'Changed', text: 'Updated font files to use correct weight-specific URLs from Google Fonts' },
      { type: 'Changed', text: 'Fixed Lato font weights (300, 400, 700, 900) - removed non-existent 500/600 weights' },
      { type: 'Changed', text: 'Permission modal now uses Capacitor Preferences for state persistence' },
      { type: 'Changed', text: 'SettingsContext now uses Capacitor Preferences for encrypted settings storage' },
      { type: 'Fixed', text: 'Typography not loading correctly on Android app - fonts now bundled locally' },
      { type: 'Fixed', text: 'Permission modal showing when permissions already granted - added proper state checking' },
      { type: 'Fixed', text: 'Font files had incorrect sizes (1.6KB) - downloaded correct versions (70-300KB)' },
      { type: 'Fixed', text: 'App hanging on welcome modal after camera permission granted - fixed modal rendering condition' },
      { type: 'Fixed', text: 'Permission modal reappearing after grant - added permissionGranted state check' },
      { type: 'Fixed', text: 'Can\'t touch to start booth after permission granted - removed animation delays blocking interaction' },
      { type: 'Fixed', text: 'Modals reappearing on app launch - simplified animation flow to prevent race conditions' },
      { type: 'Fixed', text: 'Intro modal hanging on "Ready to Start" - added completed state for immediate unmounting' },
      { type: 'Security', text: 'Native Android code obfuscation enabled via R8/ProGuard' },
      { type: 'Security', text: 'All local storage now encrypted via Android Keystore' },
      { type: 'Security', text: 'No sensitive keys hardcoded in frontend code' },
    ],
  },
  {
    version: '0.0.0',
    date: 'Initial Release',
    changes: [
      { type: 'Added', text: 'Initial photobooth application' },
      { type: 'Added', text: 'Camera capture functionality' },
      { type: 'Added', text: 'Template system with 4 layouts' },
      { type: 'Added', text: 'Print preview and status screens' },
      { type: 'Added', text: 'Settings panel with general, camera, printer, capture, and template options' },
      { type: 'Added', text: 'Material Design 3 UI' },
      { type: 'Added', text: 'Sound system with retro vibe' },
      { type: 'Added', text: 'Service worker for PWA support' },
      { type: 'Added', text: 'Capacitor integration for Android' },
    ],
  },
];

const CHANGE_TYPE_COLORS = {
  Added: 'bg-green-500/15 text-green-400',
  Changed: 'bg-blue-500/15 text-blue-400',
  Fixed: 'bg-yellow-500/15 text-yellow-400',
  Security: 'bg-red-500/15 text-red-400',
};

export default function AboutSettings() {
  const [changelogExpanded, setChangelogExpanded] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [webApisExpanded, setWebApisExpanded] = useState(false);
  const [dependenciesExpanded, setDependenciesExpanded] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* About Mono Studio */}
      <div className="rounded-[20px] bg-md-primary-container px-5 py-5 space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-md-on-primary-container">MONO STUDIO PH</h2>
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
            <span className="text-lg">�</span>
            <span className="text-sm text-md-on-surface">@monoboothph</span>
            <ExternalLink size={12} className="text-md-outline ml-auto" />
          </a>
          <a
            href="https://facebook.com/monoboothph"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-md-surface-container-high hover:bg-md-surface-container-highest transition-colors"
          >
            <span className="text-lg">📘</span>
            <span className="text-sm text-md-on-surface">MONO STUDIO PH</span>
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
            {CHANGELOG_DATA.map((release) => (
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

      {/* How to Use */}
      <div className="rounded-[16px] bg-md-surface-container p-4 space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-md-on-surface-variant">How to Use</p>
        <div className="space-y-2 text-xs text-md-on-surface-variant leading-relaxed">
          <div className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center text-[10px] font-semibold">1</span>
            <span>Tap the screen to start</span>
          </div>
          <div className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center text-[10px] font-semibold">2</span>
            <span>Choose your template (Solo, Double, Triple, or Quad)</span>
          </div>
          <div className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center text-[10px] font-semibold">3</span>
            <span>Strike a pose for each photo</span>
          </div>
          <div className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center text-[10px] font-semibold">4</span>
            <span>Preview and print your receipt</span>
          </div>
        </div>
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
  );
}
