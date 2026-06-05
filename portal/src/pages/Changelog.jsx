import { useEffect, useState } from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CHANGELOG_CONTENT = `# Changelog

All notable changes to Snap & Roll will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Receipt/Ledger aesthetic rebranding throughout the app
- Monospaced font pairs for ledger aesthetic (IBM Plex Mono, Courier New)
- "Ledger" font pair (IBM Plex Mono for heading and body)
- "Receipt" font pair (Courier New for heading and body)
- "Typewriter" font pair (IBM Plex Mono heading + Courier New body)
- Start button vertical position adjustment with preset buttons (0-100px)
- Receipt printer tear sound effect (mechanical clicks + paper tear)
- Settings consolidation: Moved Security and About tabs into Account tab as collapsible sections
- Home tab redesign with title/subtitle customization moved to top
- Logo icon selection expanded from 7 to 50 icons with 6-column grid layout
- Background patterns/presets returned to home settings (color, gradient, image, video options)
- MD3 styled confirmation dialogs replacing all JavaScript alerts
- Local analytics tracking (print count, image uploads, sessions) in Account tab
- Offline fallback toggle and message configuration in Sharing tab
- 4K UHD (2160p) camera resolution option with warning message
- Start button placement options (Center, Top, Bottom)
- Logo toggle (show/hide) on Home screen
- Color presets (10 colors) and color picker for title/subtitle
- Gradient presets expanded from 5 to 10 options
- Randomize button for colors, typography, background, icon, and button style
- Footer image support for all templates with 60% width and center alignment
- Image scale adjuster (1-8) for header and footer images
- Margin controls for header (bottom margin) and footer (top margin) images
- Portal dashboard redesign with operational modules (online devices, total prints, recent activity, expiring soon)
- Animated dot background for portal with smooth hover animations
- Receipt items enabled by default with randomize option
- 3-column template preview layout for easy visual comparison
- Backup/retrieve settings in Android Account tab for easy configuration transfer
- Download all option in Gallery page for bulk photo downloads
- Deletion countdown timer on download page showing hours, minutes, seconds until auto-delete
- Server-side auto-deletion for photos after 3 days using pg_cron
- QR code modal in Gallery page for testing download functionality
- Server-side print counter tracking total prints per device
- Online devices filter in admin portal to show only active devices
- Photo preview fix in Gallery using public URLs from Supabase storage
- Download page optimization with loading spinner and Web Share API for mobile gallery save
- Debug logs display in Account settings tab for on-device troubleshooting
- Photo upload to Supabase Storage after successful print
- Dynamic QR code generation linking to download portal for each photo
- Download portal page for photo retrieval via session ID
- Account settings tab with pairing status and auto-unpair countdown
- Server-side auto-unpair timer using pg_cron (hourly cleanup)
- Real-time device status sync between Android app and admin portal
- Server-side single-device enforcement trigger per app
- Long-press guide on download page for saving to gallery
- Security hardening: Enabled R8/ProGuard for native code obfuscation in release builds
- Security hardening: Replaced localStorage with Capacitor Preferences for encrypted storage using Android Keystore
- Guided intro modal for first app launch with 3-step onboarding flow
- Automatic font download script using Google Fonts CSS API
- Local font bundling for offline use (11 font families with multiple weights)
- WAKE_LOCK permission to keep screen on during kiosk mode
- Changelog system to document all changes
- Modal animations: fade out, scale, slide-in effects for intro and permission modals
- Device ID display in About settings using @capacitor/device
- Extended device info with model, platform, OS version, manufacturer, battery level, and charging status
- Updated developer name to Jubet M. Padilla
- Moved countdown timer from Capture to Camera settings
- Removed flash effect option from Capture settings
- Removed Capture tab from settings panel
- Reordered settings tabs: General > Templates > Camera > Printer > About
- Fixed app glitch on startup (modals flashing before permission checks complete)
- Added branded loading screen during permission checks
- Added smooth fade transitions for modals
- Added staggered animations to modals
- Enhanced Standby screen entry animation
- Date/time format options for templates (10 preset formats)
- Random message feature for custom text (15 preset messages)
- Expanded accent colors from 19 to 32 with vivid/darker tones
- 8-column grid layout for accent color selection
- Home screen title/subtitle display on loading screens (PrintStatus, Capture cleaning)
- ConfirmDialog for all destructive actions in settings

### Changed
- "Print Preview" renamed to "Your Receipt"
- "Print Status" renamed to "Issuing Receipt"
- "Print" button renamed to "Tear It"
- "Print Another" renamed to "Tear Another"
- "Print All" renamed to "Tear All"
- "Print Transport" renamed to "Issue Transport"
- "Print Quality" renamed to "Issue Quality"
- "Thermal Print Tester" renamed to "Thermal Issue Tester"
- "Test Print" renamed to "Test Issue"
- "Printing…" status renamed to "Issuing…"
- "Printed!" status renamed to "Issued!"
- "Print Failed" status renamed to "Issue Failed"
- Settings tabs reduced from 9 to 7 (Security and About consolidated into Account)
- "Home Screen" tab relabeled to "Home"
- Title/subtitle font options removed (now uses global Typography setting)
- Removed connected app card from Account settings for cleaner UI
- Changed "Connected to portal" text to just "Connected" for simplicity
- Updated font files to use correct weight-specific URLs from Google Fonts
- Fixed Lato font weights (300, 400, 700, 900) - removed non-existent 500/600 weights
- Permission modal now uses Capacitor Preferences for state persistence
- SettingsContext now uses Capacitor Preferences for encrypted settings storage

### Fixed
- Capture screen toggles now respect settings (pose suggestions and retake messages)
- Typography not loading correctly on Android app - fonts now bundled locally
- Permission modal showing when permissions already granted - added proper state checking
- Font files had incorrect sizes (1.6KB) - downloaded correct versions (70-300KB)
- App hanging on welcome modal after camera permission granted - fixed modal rendering condition
- Permission modal reappearing after grant - added permissionGranted state check
- Can't touch to start booth after permission granted - removed animation delays blocking interaction
- Modals reappearing on app launch - simplified animation flow to prevent race conditions
- Intro modal hanging on "Ready to Start" - added completed state for immediate unmounting
- Fixed handleDelete in SharingSettings to properly use remove function from usePendingUploads hook

### Security
- Native Android code obfuscation enabled via R8/ProGuard
- All local storage now encrypted via Android Keystore
- No sensitive keys hardcoded in frontend code

## [0.0.0] - Initial Release

### Added
- Initial photobooth application
- Camera capture functionality
- Template system with 4 layouts
- Print preview and status screens
- Settings panel with general, camera, printer, capture, and template options
- Material Design 3 UI
- Sound system with retro vibe
- Service worker for PWA support
- Capacitor integration for Android
`;

export default function Changelog() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');

  useEffect(() => {
    setContent(CHANGELOG_CONTENT);
  }, []);

  function parseMarkdown(text) {
    const lines = text.split('\n');
    const result = [];
    let inList = false;
    let currentSection = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Version headers
      if (line.startsWith('## [')) {
        if (inList) {
          inList = false;
          result.push({ type: 'listEnd' });
        }
        const version = line.match(/\[([^\]]+)\]/)?.[1] || 'Unknown';
        const date = line.match(/- (.+)$/)?.[1] || '';
        currentSection = version;
        result.push({ type: 'version', version, date });
        continue;
      }

      // Section headers
      if (line.startsWith('### ')) {
        if (inList) {
          inList = false;
          result.push({ type: 'listEnd' });
        }
        const section = line.replace('### ', '');
        result.push({ type: 'section', section });
        continue;
      }

      // List items
      if (line.startsWith('- ')) {
        if (!inList) {
          inList = true;
          result.push({ type: 'listStart' });
        }
        const item = line.replace('- ', '');
        result.push({ type: 'item', content: item });
        continue;
      }

      // Empty lines
      if (line.trim() === '') {
        if (inList) {
          inList = false;
          result.push({ type: 'listEnd' });
        }
        continue;
      }
    }

    if (inList) {
      result.push({ type: 'listEnd' });
    }

    return result;
  }

  const parsed = parseMarkdown(content);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Changelog</h1>
          </div>
          <p className="text-gray-600">All notable changes to Snap & Roll</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-sm max-w-none">
          {parsed.map((item, index) => {
            switch (item.type) {
              case 'version':
                return (
                  <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b border-gray-200">
                    {item.version} {item.date && <span className="text-gray-500 font-normal text-lg ml-2">{item.date}</span>}
                  </h2>
                );
              case 'section':
                return (
                  <h3 key={index} className="text-lg font-semibold text-gray-800 mt-6 mb-3">
                    {item.section}
                  </h3>
                );
              case 'listStart':
                return <ul key={index} className="list-disc list-inside space-y-1 text-gray-700 ml-4">;
              case 'listEnd':
                return </ul>;
              case 'item':
                return <li key={index}>{item.content}</li>;
              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
}
