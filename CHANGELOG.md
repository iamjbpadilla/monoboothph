# Changelog

All notable changes to Snap & Roll will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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
- Removed connected app card from Account settings for cleaner UI
- Changed "Connected to portal" text to just "Connected" for simplicity
- Updated font files to use correct weight-specific URLs from Google Fonts
- Fixed Lato font weights (300, 400, 700, 900) - removed non-existent 500/600 weights
- Permission modal now uses Capacitor Preferences for state persistence
- SettingsContext now uses Capacitor Preferences for encrypted settings storage

### Fixed
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
