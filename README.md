# FitTrack AI

Your fitness journey. Smarter, simpler, stronger.

A fitness and nutrition companion built for Indian users — workouts, an Indian food database, budget meal planning, body transformation tracking and daily habit challenges. Core features are free; the architecture leaves room for an optional paid tier later without a rewrite.

## Tech stack

- **Frontend:** React 19, Vite 6, Tailwind CSS v4, React Router 7, Recharts, Lucide icons
- **Backend:** Supabase (Postgres, Auth, Storage, Row Level Security) — free tier
- **No paid APIs required.** All calorie/macro/BMI math is local, deterministic code (see `src/utils/nutritionCalculations.js`) — no AI API calls, no API keys to pay for.

## Project structure

```
src/
  components/   reusable UI, grouped by feature (ui/, landing/, app/, workouts/, nutrition/, transformation/, challenges/, auth/)
  pages/        one file per route
  layouts/      PublicLayout, AuthLayout, AppLayout (sidebar + bottom nav shell)
  context/      ThemeContext, AuthContext
  hooks/        useAuth, useTheme, useDashboardData, useWorkouts, useChallenges
  services/     all Supabase calls, one file per feature area
  utils/        nutritionCalculations.js — BMR/TDEE/calorie/protein/BMI math
  data/         static option lists (onboarding choices, nav items, landing copy)
supabase/
  migrations/   numbered SQL files — run in order, see below
```

## Running locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173` (or the next free port). Without Supabase credentials set, the app runs in **local demo mode**: you can sign up, complete onboarding and click around the whole app, but nothing is saved beyond your browser's `localStorage`, and a banner says so. This is intentional — see `src/services/supabaseClient.js`.

## Connecting a real Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env.local` and fill in your **Project URL** and **anon/publishable key** from Project Settings → API. **Never** put the `service_role`/secret key in this file — it must never reach the browser.
3. Open the Supabase **SQL Editor** and run every file in `supabase/migrations/` **in numeric order** — each one is idempotent (safe to re-run), but order matters the first time:

   | File | What it does |
   |---|---|
   | `0001_init.sql` | All 13 tables, indexes, RLS policies, the private `progress-photos` storage bucket, and the trigger that creates a profile row on signup |
   | `0002_seed.sql` | Starter exercises, Indian foods, and challenges |
   | `0003_grants.sql` | Table-level permission grants (RLS alone isn't enough — Postgres also needs explicit GRANTs) |
   | `0004_daily_metrics.sql` | The daily water-intake tracker table |
   | `0005_add_biological_sex.sql` | Adds the field needed for accurate BMR calculation |
   | `0006_workout_templates.sql` | 6 ready-made workout templates (home/gym, beginner–advanced) |
   | `0007_workout_logs_unique.sql` | A constraint needed so editing a logged set updates it instead of duplicating it |
   | `0008_food_prices.sql` | Estimated prices for the budget meal planner |
   | `0009_fix_template_insert_policy.sql` | Security fix: closes a hole that let any user publish their own routine as a public "template" |
   | `0010_progress_photos_path_check.sql` | Integrity check: a photo row can't claim a path outside its own user's storage folder |

4. Restart the dev server after adding `.env.local` (Vite only reads env files at startup).

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # serve the production build locally to sanity-check it
```

## Deployment

### Cloudflare Pages (recommended — free tier, no account limits for this use case)

1. Push this repo to GitHub.
2. In the Cloudflare dashboard: Workers & Pages → Create → Pages → connect the repo.
3. Build command: `npm run build`. Build output directory: `dist`.
4. Add your two `VITE_SUPABASE_*` environment variables in the Pages project settings (Settings → Environment variables) — they must be set there too, not just in your local `.env.local`.
5. The included `public/_redirects` file (`/* /index.html 200`) makes client-side routing work — without it, refreshing on `/dashboard` would 404.

### Vercel (alternative)

Works the same way (`npm run build`, output `dist`), and `vercel.json` in the repo root already handles SPA routing. **Note:** Vercel's free Hobby plan is for non-commercial use only — fine while this stays free, but revisit if you later charge users (Cloudflare Pages' free tier has no such restriction for this kind of app).

## Known limitations (be upfront about these)

- **Email confirmation:** Supabase requires confirming your email before first login, by default. Turn this off in Supabase → Authentication → Providers → Email if you want frictionless signup instead; it's a one-click toggle, not a code change.
- **Account deletion:** Settings lets a user delete all their *data* (workouts, logs, photos) from the client. Deleting the *login itself* needs elevated (service-role) access that must run server-side (e.g. a Supabase Edge Function) — not yet built. Settings currently points users to an email contact for that instead.
- **Workout/nutrition/transformation/challenges** all need migrations `0002` and later actually run against your project before they show real data — an empty database will just show empty states, which is correct behavior, not a bug.

## Troubleshooting

- **"No Supabase credentials found" banner won't go away** — check `.env.local` exists (not just `.env.example`), has both variables filled in, and that you restarted `npm run dev` after creating/editing it.
- **"permission denied for table X"** — you ran `0001_init.sql` but not `0003_grants.sql`. RLS policies and table grants are two separate Postgres mechanisms; both are required.
- **New signups can't log in** — check whether email confirmation is required (see Known limitations above) and whether the confirmation email actually arrived (check spam).
- **Build warns about chunk size** — the Recharts bundle is the main contributor; it's already code-split per-route via `React.lazy`, so this is expected and not a performance problem in practice (users only download the chart code when they visit a page that uses charts).
