# Backend setup (Supabase)

This app used to keep everything in the browser's `localStorage`. It now
reads/writes a real Postgres database via Supabase, with row-level
security so students only see their own patients, supervisors see their
section, and admins see everything.

## 1. Create a Supabase project
1. Go to https://supabase.com → New project (free tier is fine to start).
2. Wait ~2 min for it to provision.

## 2. Install the schema
1. Supabase Dashboard → SQL Editor → New query.
2. Paste the contents of `supabase/schema.sql` and run it.
   This creates every table, the `profiles` auto-provisioning trigger,
   and all the row-level-security policies in one shot.

## 3. Create your first accounts
Follow `supabase/seed_accounts.md` — create a super_admin, a supervisor,
and a student account so you have one of each role to test with.

## 4. Point the app at your project
```
cp .env.example .env.local
```
Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from
Supabase Dashboard → Project Settings → API.

## 5. Install & run
```
npm install
npm run dev
```
Open the printed URL, sign in with one of the accounts you created.

## What changed
- `src/lib/supabaseClient.ts` — the Supabase connection.
- `src/lib/mappers.ts` — converts between Postgres' snake_case columns
  and the app's existing camelCase types, so no other component had to change.
- `src/context/ClinicContext.tsx` — now reads/writes Supabase instead of
  `localStorage`, and subscribes to realtime changes so multiple devices
  (a supervisor on a tablet, a student on their phone) stay in sync live.
- `src/components/Auth/LoginView.tsx` + `src/App.tsx` — real sign-in
  gate. Nothing renders until there's a valid Supabase session.
- `Sidebar.tsx` / `TopBar.tsx` / `MainLayout.tsx` — the navigation shell
  is now a slide-in drawer on phone/tablet with a hamburger toggle,
  instead of a sidebar that eats half a phone screen.

## Known follow-ups (not done in this pass)
- **Demo user switcher removed in spirit, not literally**: `TopBar` and
  `DataManagementView` still have a "switch user" dropdown left over
  from the localStorage prototype. With real auth this can't actually
  change who you're signed in as (Row Level Security is tied to your
  login session) — `switchUser`/`switchRole` are now no-ops that log a
  console warning. Recommend removing that dropdown from the UI, or
  replacing it with a real "Impersonate" feature restricted to
  super_admin (needs a server-side admin API call, not a client-side
  swap).
- **Per-view responsive polish**: the app shell (sidebar, topbar) now
  works on phone/tablet widths, but dense views like the Odontogram
  chart and some data tables were designed for desktop and may still
  need horizontal scrolling or layout tweaks on narrow screens.
- **X-ray uploads**: the schema includes a private `xrays` storage
  bucket and table, but the upload UI itself (wherever `XRayImage` is
  currently created) still needs wiring to `supabase.storage.from('xrays').upload(...)`.
- **RLS is a solid baseline, not the final word**: supervisors currently
  get full staff-level access rather than being scoped to only their
  assigned section. Tighten `is_staff()` / the `cases`/`patients`
  policies in `schema.sql` once section assignment is finalized.
