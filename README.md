# Portfolio — Next.js 14 + Tailwind CSS

Single Next.js 14 (App Router) app that replaces the old two-app setup
(`react-portfolio` CRA frontend + `node-portfolio` Express backend). All
styling is Tailwind CSS (MUI/Emotion and Bootstrap have been removed);
the Express API has been folded into Next.js Route Handlers under
`app/api/*`, backed by the same MongoDB Atlas cluster.

## Getting started

```bash
npm install
# .env.local already exists locally with working values — see below for what's in it
npm run dev   # http://localhost:3000
```

## Environment variables (`.env.local`)

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string (same DB as the live site) |
| `JWT_SECRET` | Signing secret for the Profile Manager auth token |
| `FRONTEND_URL` | Optional. Overrides the origin `/api/pdf`'s Puppeteer instance navigates to. Defaults to the incoming request's own origin. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` / `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Used by `/fileuploader/[...folder]` |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` / `_TEMPLATE_ID` / `_PUBLIC_KEY` | Used by the Contact form |

## Structure

- `app/(site)/` — home page, wrapped in the Navbar+Footer layout
- `app/myresume/`, `app/login/`, `app/profile/`, `app/fileuploader/[...folder]/` — standalone routes (no site chrome)
- `app/api/*` — auth, profile CRUD, PDF export (Puppeteer), health check
- `lib/` — Mongo connection (cached for serverless), Mongoose models, JWT helpers
- `components/` — mirrors the old `src/components` structure; MUI is gone, styling is Tailwind utility classes plus a handful of shared classes in `app/globals.css` (`@layer components`)
- `components/ui/Modal.jsx` — Radix UI Dialog wrapper used by the Profile Manager's 6 dialogs, replacing MUI `Dialog`
- Profile Manager's tabs use Radix UI Tabs, replacing MUI `Tabs`

## Scripts

- `npm run dev` / `npm run build` / `npm run start` / `npm run lint`
- `npm run seed` — one-off script that seeds a default admin user + profile if the database is empty (matches the old Express `seed.js`, safe to run repeatedly)

## Notes / intentional differences from the old app

- `components/Resume/resumeview.css` is kept as plain CSS (not Tailwind) — it's a pixel-precise print layout that the PDF export's `onclone` hook manipulates by exact class name; converting it risked silently breaking the resume PDF.
- `Home/SwarmBackground.jsx`, `CustomSwiper/CustomSwiper.jsx`, and `Home/Demo.jsx` from the old app were dead code (not referenced by any route) and were not ported.
- FontAwesome is loaded via the same CDN `<link>` as before rather than an npm package, to minimize icon-by-icon rewrite risk.

## Cutover

`react-portfolio` and `node-portfolio` are untouched and still deployable as-is. This app is a drop-in replacement once you're ready to switch — point DNS/hosting at this app instead, using the same `MONGO_URI`.
