# Pet Hospital Solapur: Clinic Management App

React + Vite + Supabase web app, installable as a desktop / phone app (PWA).

## Run locally

```bash
npm install
cp .env.example .env.local     # then fill in the two Supabase values
npm run dev                    # http://localhost:3000
```

## Production build

```bash
npm run build                  # type-checks, then outputs ./dist
npm run preview                # test the production build locally
```

## Deploy

Works on any static host (Vercel, Netlify, Cloudflare Pages, ...). The host must serve **HTTPS** (required for installing the app).

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables (set in the host's dashboard, not in code):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Page refresh / deep links: already handled by `vercel.json` (Vercel) and `public/_redirects` (Netlify, Cloudflare Pages).

### Supabase settings to check before go-live

In **Authentication -> URL Configuration**:
- **Site URL**: the production URL, e.g. `https://app.your-domain.com`
- **Redirect URLs**: add `https://app.your-domain.com/reset-password` (needed for the "Forgot Password?" email link to work)

The clinic's login account is created in **Authentication -> Users**.

## Installing as a desktop app (for the client)

1. Open the live URL in **Chrome** or **Edge**.
2. Click **Install App** in the app's top bar (or the install icon at the right end of the address bar).
3. The app now opens in its own window with its own icon on the desktop / Start menu / taskbar.

On Android, use "Install app" / "Add to Home screen". On iPhone/iPad, use Share -> Add to Home Screen.

Updates are automatic: after a new version is deployed, the installed app picks it up the next time it is opened.
The app needs an internet connection to load and save clinic data; a banner is shown when the connection drops.

## Changing the app icon

Replace the PNG files in `public/` (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`, `favicon.png`) keeping the same names and sizes, then redeploy.

## Email reports

Emailing treatment reports uses EmailJS. The clinic's Service ID, Template ID and Public Key are entered in **Settings -> Email Configuration**.
