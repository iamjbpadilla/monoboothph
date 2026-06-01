# Portal Setup Guide

## What Was Built

A unified admin portal and photo download system for Snap & Roll photobooth kiosks.

**Location:** `portal/` directory

**Features:**
- Public photo download via QR code (`/download/:sessionId`)
- Admin authentication via Supabase Auth
- App management (create/edit/delete apps with pairing codes)
- Photo gallery with filtering and bulk delete
- Device tracking (ready for kiosk integration)

## Next Steps to Deploy

### 1. Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run the schema from `portal/supabase-schema.sql`
3. Create a storage bucket named `photos` (make it public)
4. Add storage policies (see comments in schema file)
5. Create an admin user in Supabase Auth (Authentication > Users)
6. Add the admin email to the `admin_users` table:
   ```sql
   INSERT INTO admin_users (email) VALUES ('your-email@example.com');
   ```
7. Copy your Supabase URL and anon key from Project Settings > API

### 2. Configure Environment Variables

Create `portal/.env`:
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Test Locally

```bash
cd portal
npm install
npm run dev
```

Visit http://localhost:5173 to test:
- `/` - Landing page
- `/admin` - Login (use your Supabase auth credentials)
- `/admin/apps` - Create an app
- `/admin/gallery` - View gallery (empty until photos uploaded)

### 4. Deploy to Vercel

1. Push code to GitHub
2. In Vercel, create new project from Git
3. Set root directory to `portal`
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Add environment variables in Vercel dashboard
7. Deploy

### 5. Kiosk Integration (Future)

The kiosk app will need:
- Supabase client setup
- Pairing code entry on first launch
- Photo upload to Supabase Storage
- QR code generation with portal URL

## Database Schema

**Tables:**
- `apps` - Photobooth installations/events
- `devices` - Individual kiosk devices
- `photos` - Uploaded photos
- `admin_users` - Admin portal users

**Storage:**
- `photos` bucket with folder structure: `{app_id}/{device_id}/{session_id}/`

## Routes

- `/` - Public landing
- `/download/:sessionId` - Photo download (QR destination)
- `/admin` - Admin login
- `/admin/dashboard` - Dashboard
- `/admin/apps` - App management
- `/admin/gallery` - Photo gallery

## Notes

- The portal is completely separate from the kiosk app
- Android/iOS folders in the root were NOT touched
- Kiosk app will be integrated in a future phase
- Portal uses TailwindCSS for styling
- All admin routes are protected by Supabase Auth
