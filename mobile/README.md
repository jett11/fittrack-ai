# FitTrack AI — mobile (React Native + Expo)

Native Android/iOS app sharing the exact same Supabase backend as the website
in `../` (same project, same tables, same auth, same user accounts — nothing
here is a separate system).

## Running it on your phone

This Expo SDK requires **Node 22.13+**. This machine has Node 20 as the
default (other tools, like the website, still use that), so switch versions
just for this folder:

```bash
nvm use 22.13.0
cd mobile
npm install          # first time only
npx expo start
```

Scan the QR code with the **Expo Go** app on your Android phone (install it
from the Play Store first). No build step needed for this — Expo Go runs it
directly.

When you're done, switch back so the website's tooling isn't affected:

```bash
nvm use 20.18.1
```

## What's real right now

- Login/signup against the actual production Supabase project — the same
  account you use on fittrack-ai-1ip.pages.dev logs in here too.
- Home tab shows real data: today's water, today's calories vs. your target,
  today's workout status.
- Profile tab shows your real profile and lets you log out.
- Workout / Meals / Progress tabs are honest placeholders (not fake data) —
  next build phases.

## What's NOT done yet

See the project task list — workout sessions, nutrition logging, progress
photos, charts, animations, and the production Android build (EAS) are all
still ahead.
