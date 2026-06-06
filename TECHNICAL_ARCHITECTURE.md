# MONO BOOTH PH - Technical Architecture Overview

## 1. Web Portal

**Location:** `portal/` directory

**Purpose:** Admin dashboard for managing photobooth devices, viewing photos, and configuring settings.

### Tech Stack
- React 19.2.6
- Vite 8.0.12
- React Router DOM 7.16.0
- Supabase JS Client 2.106.2
- Tailwind CSS 4.3.0
- Radix UI components (Dialog, Tabs, Select, etc.)

### Key Pages

**AdminDashboard.jsx**
- Overview of system stats (apps count, active devices, photos, prints)
- Database and storage connection status monitoring
- Storage usage tracking (1GB free tier limit)
- Recent activity display
- Navigation to other admin sections

**AppManagement.jsx**
- Create and manage photobooth apps
- Each app has a unique 6-digit pairing code
- View online devices per app
- Real-time device status updates via Supabase Realtime
- Edit app names, delete apps
- Copy pairing codes for device pairing

**Gallery.jsx**
- View all photos from all devices
- Filter by app, device, date range, session ID
- Grid and table view modes
- Download individual or batch photos
- Delete photos (with confirmation)
- QR code generation for photo sharing
- Pagination (24 items per page)
- Photo preview modal with navigation

**Logs.jsx**
- Real-time log viewer via Supabase Realtime
- Subscribe to `logs:{appId}` channel
- Display log entries with timestamps, levels, messages
- Filter by log level (info, warn, error)

**Timeline.jsx**
- Timeline view of photo sessions
- Grouped by app/device
- Chronological display

**PhotoDownload.jsx**
- Direct photo download page
- Uses session ID to fetch specific photo
- QR code for mobile download

**Marketing.jsx**
- Marketing content management
- Configure advertising settings

**Help.jsx**
- Help documentation
- Admin, Operator, and Guest guides

**Landing.jsx**
- Public marketing landing page
- Service packages display
- Features showcase
- Contact information
- Receipt preview generator (demo)

**Changelog.jsx**
- Version history and release notes

### Authentication
- Admin login via `AdminLogin.jsx`
- Uses Supabase auth
- Protected routes require authentication

---

## 2. Main App (Photobooth Application)

**Location:** `src/` directory

**Purpose:** The actual photobooth kiosk application running on Android devices.

### Tech Stack
- React 19.2.6
- Vite 8.0.12
- Capacitor 8.3.4 (Android/iOS native integration)
- Supabase JS Client 2.106.2
- Tailwind CSS 4.3.0
- Radix UI components
- Lucide React icons
- QRCode.js
- JSBarcode

### Key Components

**App.jsx** - Main Application Container
- Screen stack management (navigation between screens)
- `useScreenStack` hook for screen transitions
- Renders active screens with enter/exit animations
- Global modals: SettingsPanel, PermissionModal, IntroModal, PairingModal
- Error boundary wrapping

**Screens**

**Standby.jsx** - Home Screen
- Displays background (color, gradient, image, or video)
- Logo/icon display with floating animation
- Title and subtitle display
- "Tap to Start" button with 17 animation options
- 3-second long press to open settings (custom event dispatch)
- Video preloading with loading states
- Footer branding

**TemplateSelect.jsx** - Template Selection
- Grid of template options (1strip, 2strip, 3strip, 4grid, 2x3-landscape, 2x3-portrait)
- Responsive layout with max-width constraints
- Live preview of selected template
- Template selection triggers capture flow

**Capture.jsx** - Photo Capture
- Camera integration via Capacitor Camera
- Countdown timer (configurable seconds)
- Pose suggestions (optional)
- Multi-photo capture (3-6 photos depending on template)
- Retake functionality with "cleaning" overlay
- Display of home screen title/subtitle during retake

**PrintPreview.jsx** - Receipt Preview
- Canvas-based receipt composition
- Live preview of final print
- Options to retake or print

**PrintStatus.jsx** - Print Status Display
- Shows printing progress
- Success/error states
- QR code for digital download (if sharing enabled)
- Footer branding

**Advertising.jsx** - Ad Screen
- Displays between sessions
- Full-screen video or image mode
- Carousel mode with media rotation
- QR code for social media
- Custom title, subtitle, message
- Social media links (Facebook, Instagram, TikTok)
- Contact info display
- Video preloading and error handling

### Context Providers

**SettingsContext.jsx**
- Global settings management
- Local storage via Capacitor Preferences
- Settings structure:
  - `homeScreen`: Background, title, subtitle, button, logo
  - `general`: Booth name, event name, long press duration, ad duration
  - `templates`: Receipt template blocks (header, photos, divider, datetime, custom text, barcode, footer)
  - `sharing`: Supabase upload toggle, offline fallback, retry settings
  - `printer`: DPI, paper width, margins, contrast
  - `capture`: Countdown seconds, pose suggestions, retake messages
- Settings migration system (version-based)
- Dual-read for backward compatibility

**SnackbarContext.jsx**
- Toast notification system
- Success, error, info messages

### Key Hooks

**usePrinter.js**
- USB printer integration
- Print job management
- Error handling

**usePhotoUpload.js**
- Upload photos to Supabase Storage
- Create database records
- Session ID generation

**usePendingUploads.js**
- Queue failed uploads for retry
- Storage limit management (100MB default)
- Auto-retry when online

**useDeviceHeartbeat.js**
- Periodic heartbeat to Supabase (5-minute interval)
- Updates device status and last_sync timestamp

**useDeviceStatusSync.js**
- Subscribe to device status changes via Supabase Realtime
- React to remote status updates (disable/enable device)

**useSupabaseSync.js**
- Optional settings sync with Supabase
- Local settings always take priority
- Queue sync when offline

**useLogCapture.js**
- Capture logs and broadcast via Supabase Realtime
- Queue logs when offline
- Batch upload every 5 seconds

**useSound.js**
- Sound effects (click, transition, success, error, print tear)

### Canvas Composition

**canvasCompositor.js**
- Receipt layout engine
- Template rendering:
  - Header (image or title/subtitle)
  - Photos with borders (none, thin, thick, rounded, double, dashed, dotted)
  - Dividers (solid, dashed, dotted)
  - Date/time formatting (MM, DD, YYYY, h, A tokens)
  - Custom text
  - Receipt items (witty random items)
  - Barcode (CODE128, CODE39, EAN13, UPC-A)
  - Footer
- Photo border drawing with mirror option
- Barcode generation

### Settings Components

**SettingsPanel.jsx**
- Main settings modal with tabs
- PIN protection
- Live preview of changes

**HomeScreenSettings.jsx**
- Background configuration (preset, color, gradient, image, video)
- Title/subtitle customization
- Button shape, size, vertical position, animation, text, image
- Logo image/icon selection (50 icons)
- Preset save/load

**TemplateSettings.jsx**
- Template selection
- Block configuration (header, photos, divider, datetime, custom text, barcode, footer)
- Border style selection
- Date/time format configuration
- Receipt items randomization

**PrinterSettings.jsx**
- DPI configuration (203, 300)
- Paper width (58mm, 80mm)
- Margins and contrast
- Mirror option

**AdvertisingSettings.jsx**
- Full-screen image/video upload
- Carousel media upload
- Display options (logo, carousel, social, contact, QR)
- Background style selection
- Title, subtitle, message configuration
- Social media links
- Event promotion text

**AccountSettings.jsx**
- Device pairing (6-digit code)
- Supabase connection status
- App information display

**SecuritySettings.jsx**
- PIN configuration
- Auto-lock timer

**AboutSettings.jsx**
- App version info
- Device info

### Native Integration (Capacitor)

**Camera** - Photo capture
**Preferences** - Local storage
**Device** - Device info
**Filesystem** - File operations
**SplashScreen** - App launch screen

---

## 3. Supabase Integration

### Database Schema

**apps table**
- `id` (UUID, primary key)
- `name` (text) - App name
- `pairing_code` (text, unique) - 6-digit code for device pairing
- `settings` (jsonb) - App-wide settings
- `created_at` (timestamp)

**devices table**
- `id` (UUID, primary key)
- `app_id` (UUID, foreign key to apps)
- `device_name` (text)
- `status` (enum: online, offline, disabled)
- `last_sync` (timestamp)
- `created_at` (timestamp)

**photos table**
- `id` (UUID, primary key)
- `app_id` (UUID, foreign key to apps)
- `device_id` (UUID, foreign key to devices)
- `session_id` (text) - Unique session identifier
- `storage_path` (text) - Path in Supabase Storage
- `timestamp` (timestamp)
- `created_at` (timestamp)

**Storage Buckets**

**photos bucket**
- Stores all photo uploads
- Path structure: `{device_id}/{session_id}.jpg`
- Public access for gallery downloads

### Supabase Client

**src/lib/supabase.js** (App)
- Lazy initialization (only creates client when needed)
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Connection check function
- Synchronous client access

**portal/src/lib/supabase.js** (Portal)
- Direct initialization on load
- Same environment variables

### Realtime Features

**Device Status Sync**
- Subscribe to `device-status-{deviceId}` channel
- Listen for postgres_changes on devices table
- Remote enable/disable of devices

**Log Broadcasting**
- Broadcast logs to `logs:{appId}` channel
- Portal subscribes to view real-time logs
- Queue logs when offline

**Photo Gallery Updates**
- Portal could subscribe to photos table for real-time updates (not currently implemented)

### RPC Functions

**increment_print_count**
- Called after successful print
- Increments print counter for device
- Used for analytics

### Upload Flow

1. User takes photos → Receipt generated
2. Print successful → `uploadPhotoToSupabase()` called
3. Convert data URL to blob
4. Upload to `photos` bucket: `{device_id}/{session_id}.jpg`
5. Create record in `photos` table
6. If offline → Add to pending uploads queue
7. When online → Retry pending uploads

### Device Pairing Flow

1. Admin creates app in portal → Generates 6-digit pairing code
2. User enters code in app's PairingModal
3. App queries `apps` table for matching code
4. If found → Create device record in `devices` table
5. Store pairing info (appId, deviceId) in local Preferences
6. App now paired → Supabase features enabled

### Settings Sync Flow

1. App changes settings locally
2. If paired → Queue settings sync
3. If online → Update `apps.settings` in Supabase
4. Portal reads settings from `apps` table
5. Local settings always take priority (app doesn't overwrite local with remote)

### Offline Support

**Pending Uploads**
- Queue failed uploads in Preferences
- Limit to ~4 images (storage limit)
- Auto-retry when internet returns
- Manual retry option

**Settings Sync Queue**
- Queue settings changes when offline
- Process queue when online

**Log Queue**
- Queue logs when offline
- Batch upload every 5 seconds when online

### Security

- Row Level Security (RLS) policies should be configured
- Anon key used for client access
- Device pairing restricts access to specific app
- No direct user authentication in app (device-based access)

---

## Architecture Summary

**Portal → Supabase ← App**

- Portal: Admin interface, photo gallery, device management
- App: Photobooth kiosk, photo capture, printing
- Supabase: Backend database, storage, realtime sync

**Data Flow:**
1. App captures photos → uploads to Supabase Storage
2. Portal queries Supabase → displays in gallery
3. Portal manages apps/devices → App reads settings
4. App sends logs/heartbeat → Portal monitors status
5. Portal can disable devices → App respects status

**Key Design Decisions:**
- App works offline (local-first)
- Supabase is optional (graceful degradation)
- Settings stored locally, synced when possible
- Realtime for live monitoring
- Capacitor for native Android deployment
