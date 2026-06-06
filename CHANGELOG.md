# Changelog

All notable changes to Snap & Roll will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Bible Verses design block with all 66 Bible books (Old and New Testament)
- Bible Verses randomization on each print with topic/book selection
- Bible Verses word wrapping with template font adoption
- Bible Verses font size slider (18-48px)
- Bible Verses reference display toggle
- Bible Verses alignment options
- Footer bottom spacing consistency across all templates
- Independent design block height calculations (no block depends on another)
- Actual text measurement for Bible Verses height (prevents overflow)
- Print Margins settings enabled on Printer tab (Top Margin, Bottom Multiplier)

### Changed
- Bible Verses enabled by default (replaces Receipt Items as default)
- Receipt Items disabled by default
- Verse reference size now matches verse text size
- Default barcode value now uses current title from home screen
- Removed all SnapAndRoll branding references (now MONO BOOTH PH)
- Title/Subtitle size sliders now work on receipt layout
- Date/Time format selection improved
- "Photos to borders" relabeled to "Border"

### Fixed
- Footer overflow on template previews (root cause: elGap stripping + Bible Verses underestimation)
- Barcode not working (empty value fallback now uses title text)
- Bible Verses height underestimation (was 2 lines, now measures actual wrapped lines)
- Empty space from disabled design blocks not hidden properly
- Canvas height now correctly accommodates all enabled blocks without overflow
- Subtitle not showing on receipts (was checking home screen enabled toggle)
- Subtitle not showing on composing/cleaning screens during capture flow
- Print status showing wrong subtitle when home screen subtitle was disabled
- Mirror toggle re-randomizing Bible verses and receipt items
- Mirror toggle remounting entire receipt canvas (now smooth toggle)
- Ads video duration not functional ("Use video length" option)
- Footer bottom spacing too large (now balanced with header top)
- Header title-subtitle gap using hardcoded 8px (now uses element spacing)
- Button animation preview in Home settings not working
- Print preview not showing (StrictMode double-run cache issue)
- Background Color/Gradient options removed, Preset patterns restored
- ReceiptItems height calc not accounting for randomize mode (canvas too short when items array empty)
- BibleVerses height calc using max across all verses instead of actual chosen verse (overestimated)
- Header title font size mismatch between height calc and renderer

### Changed
- Show title/subtitle toggle now only affects home screen (not receipts or other screens)
- ReceiptCanvas now pre-generates design data for consistent normal/mirrored views
- Home screen background: Color/Gradient removed, Preset (plain/grid/dots/lines) added
- Button animation preview in settings now actually plays the selected animation

### Added
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
