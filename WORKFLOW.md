# Development Workflow Guide

## Core Rules

### Development Rules
1. **All testing must be done locally** - No production testing
2. **Windsurf only for code editing** - No deployment operations
3. **GitHub CLI for git operations** - All commits/pushes via GitHub CLI
4. **Manual deployment only** - No auto-deploy to Vercel

### Deployment Rules
1. **Manual approval required** - Deploy only after explicit user confirmation
2. **GitHub CLI → Vercel** - Deployment triggered after pushing via GitHub CLI
3. **No CI/CD auto-deploy** - Disable automatic deployments
4. **Local dev server verification** - Must test locally before any deployment

## GitHub CLI Setup

### First-time Authentication
```bash
gh auth login
```
Follow the prompts to authenticate with your GitHub account.

### Create New Repository
```bash
gh repo create monoboothph --public --source=. --remote=origin
```

## Local Testing Procedures

### Portal Testing
1. Start local dev server:
   ```bash
   cd portal
   npm run dev
   ```
2. Test all features locally at http://localhost:5174
3. Verify gallery enhancements:
   - Pagination works correctly
   - Photo preview modal opens and navigates
   - Download progress indicator shows
   - Date range filtering works
   - Button styling is correct
4. Test responsive design on different screen sizes

### App Testing
1. Start local dev server:
   ```bash
   npm run dev
   ```
2. Test camera, printing, and all kiosk features
3. Verify Supabase connections
4. Test offline-first behavior

## Manual Deployment via GitHub CLI

### Step 1: Commit Changes
```bash
git add .
git commit -m "Your commit message"
```

### Step 2: Push to GitHub
```bash
git push origin main
```

### Step 3: Manual Vercel Deploy
1. Open Vercel dashboard
2. Select "monoboothph" project
3. Click "Deployments"
4. Click "Redeploy" or "Deploy"
5. Wait for build to complete
6. Verify deployment at your Vercel URL

**Vercel Configuration:**
- Root directory: `portal`
- Build command: `npm run build`
- Output directory: `dist`
- Auto-deploy: Disabled (manual only)

## Project Structure

```
mono-booth-ph/                    # GitHub repository (whole project)
├── src/                          # Main app (kiosk)
├── portal/                       # Admin portal (deployed to Vercel)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Gallery.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── ...
│   │   └── lib/
│   │       └── supabase.js
│   ├── supabase-schema.sql
│   ├── package.json
│   └── vercel.json
├── android/                      # Android build files
└── WORKFLOW.md                  # This file
```

**Note:** Vercel deploys only the `portal/` subdirectory. The entire project is stored on GitHub.

## Supabase Schema

### Tables
- **apps**: Photobooth installations/events
- **devices**: Individual kiosk devices
- **photos**: Uploaded photos from kiosks
- **admin_users**: Portal admin users

### Storage
- **photos bucket**: Public bucket for photo storage

### Security
- RLS enabled on all tables
- Public read for photos
- Admin write/delete for all tables
- Authenticated upload for storage

## Environment Variables

### Portal (.env)
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### App (.env)
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Common Commands

### Portal
```bash
cd portal
npm run dev          # Start dev server
npm run build        # Build for production
```

### App
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run android:build # Build APK
```

## Troubleshooting

### Port Already in Use
If port 5174 is in use, Vite will automatically try the next available port (5175, 5176, etc.)

### Supabase Connection Issues
1. Verify environment variables are set
2. Check Supabase project is active
3. Verify RLS policies are correct

### Vercel Build Failures
1. Check build logs in Vercel dashboard
2. Verify build command is `npm run build`
3. Ensure all dependencies are in package.json
