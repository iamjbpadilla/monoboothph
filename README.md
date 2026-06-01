# Snap & Roll - Mono Booth PH

A photobooth kiosk application with admin portal for event management.

## Development Workflow

**IMPORTANT: All development must follow the workflow rules documented in [WORKFLOW.md](./WORKFLOW.md)**

### Core Rules
- **All testing must be done locally** - No production testing
- **Windsurf only for code editing** - No deployment operations
- **GitHub Desktop for git operations** - All commits/pushes via GitHub Desktop
- **Manual deployment only** - No auto-deploy to Netlify

For detailed workflow procedures, see [WORKFLOW.md](./WORKFLOW.md)

## Project Structure

```
mono-booth-ph/
├── src/                    # Main app (kiosk)
├── portal/                 # Admin portal
├── android/                # Android build files
└── WORKFLOW.md            # Development workflow guide
```

## Quick Start

### Portal (Admin)
```bash
cd portal
npm install
npm run dev
```

### App (Kiosk)
```bash
npm install
npm run dev
```

## Tech Stack

- React + Vite
- Supabase (Database & Storage)
- Capacitor (Mobile)
- TailwindCSS
- Lucide Icons

## Supabase Schema

- **apps**: Photobooth installations/events
- **devices**: Individual kiosk devices
- **photos**: Uploaded photos from kiosks
- **admin_users**: Portal admin users

See [portal/supabase-schema.sql](./portal/supabase-schema.sql) for complete schema definition.

## Deployment

Deployment is manual only via Vercel. See [WORKFLOW.md](./WORKFLOW.md) for deployment procedures.

## License

MIT
