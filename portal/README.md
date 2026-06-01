# Snap & Roll Portal

Admin panel and photo download portal for Snap & Roll photobooth kiosks.

## Features

- **Public Photo Download**: Users can download photos via QR code using session ID
- **Admin Authentication**: Secure login via Supabase Auth
- **App Management**: Create and manage photobooth installations with pairing codes
- **Photo Gallery**: View, filter, and bulk delete photos
- **Device Tracking**: Monitor connected kiosk devices

## Setup

### Prerequisites

- Node.js 18+
- Supabase account
- Vercel account (for deployment)

### Environment Variables

Create a .env file in the portal directory:

`env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
`

### Development

`ash
cd portal
npm install
npm run dev
`

### Build

`ash
npm run build
`

### Deployment

Deploy to Vercel:
1. Connect your Vercel account to the portal/ directory
2. Set environment variables in Vercel dashboard
3. Deploy

## Database Setup

Run the SQL schema in your Supabase project:
- See the development plan for the complete database structure

## Routes

- / - Public landing page
- /download/:sessionId - Photo download page (QR code destination)
- /admin - Admin login
- /admin/dashboard - Admin dashboard
- /admin/apps - App management
- /admin/gallery - Photo gallery
