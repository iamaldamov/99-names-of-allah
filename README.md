# Asma Ul Husna

A minimalist learning app for studying and memorizing the 99 Names of Allah.

## Stack
- React + TypeScript + Vite
- Supabase Auth and PostgreSQL
- GitHub Pages via GitHub Actions

## Local development
1. Install Node.js 22.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add your Supabase project URL and publishable/anon key.
4. Run `npm run dev`.

## Supabase setup
Run `supabase/schema.sql` in the Supabase SQL Editor. Configure email authentication first. Phone OTP requires an SMS provider and should be enabled only after provider setup.\n\nFor an existing Supabase project, also run the newest SQL file in `supabase/migrations/` in the SQL Editor. The 2026-10-29 migration removes the optional foreign-key dependency on pre-seeding the public names catalogue, so signed-in learners can save their progress even while the catalogue is still served from the app bundle.

## GitHub Pages
Enable GitHub Actions as the Pages build and deployment source in repository Settings → Pages. Add repository Actions secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Only the Supabase publishable/anon key belongs in the client. Never expose the service role key.

## Content integrity
Name entries are intentionally marked as draft until Arabic spelling, transliteration, translation, explanation, and references have been reviewed against reliable Islamic sources. Do not publish unverified religious content.

Pages deployment is triggered automatically on pushes to the main branch.
