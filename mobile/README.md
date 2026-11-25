# FitTrack AI — mobile (React Native + Expo)

Native Android/iOS app sharing the exact same Supabase backend as the website
in `../` (same project, same tables, same auth, same user accounts — nothing
here is a separate system).

## Running it on your phone (Expo Go — fastest way to test)

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

- Login/signup/forgot-password against the actual production Supabase
  project — the same account you use on fittrack-ai-1ip.pages.dev logs in
  here too.
- Home: hero challenge card, real calorie/water stats, today's workout
  status, recent workouts row.
- Workout: discovery (poster cards), exercise detail, a full active session
  (set logging, rest timer, progressive-overload suggestions).
- Nutrition: food search, meal logging, real daily totals.
- Progress: weight trend chart, measurements, progress photos (uploads to
  the same private Supabase Storage bucket as the website).
- Profile: edit name/goal/target weight, notification toggle, logout.
- Animated tab bar, fade-in cards, loading skeletons, haptic feedback on
  buttons.

## What's NOT done yet

- Real on-device QA — everything above is verified via `tsc --noEmit` and
  `expo export --platform android` (bundles clean, zero errors), which is
  the strongest check possible without a physical device/emulator. You
  still need to actually tap through it on your phone.
- Extending the existing inactivity push-notification system (built for the
  website, uses Web Push) to also reach this native app (needs Expo's
  separate push token system).

## Building a real Android app (EAS) — steps only you can do

I can't do these for you — they need your own accounts:

1. **Create a free Expo account** at expo.dev if you don't have one.
2. `cd mobile && npx eas-cli login` — log in with that account.
3. `npx eas-cli init` — registers this app under your Expo account and
   writes a project ID into app.json.
4. `npx eas-cli build --platform android --profile preview` — builds an
   installable `.apk` in the cloud (no Android Studio needed) you can send
   to your own phone or testers directly.
5. When ready for the real listing: `npx eas-cli build --platform android
   --profile production` builds the `.aab` file the Play Store needs.
6. **Google Play Developer account** — $25 one-time, at
   play.google.com/console. Needed either way, same as the TWA option
   we discussed earlier.
7. `npx eas-cli submit --platform android` can upload the build to Play
   Console for you once you have both accounts set up.

`eas.json` already has `development`/`preview`/`production` build profiles
configured and ready to go — you just need to run the commands above once
you have your Expo account.
