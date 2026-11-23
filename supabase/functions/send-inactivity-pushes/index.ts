// Cron-triggered (see migration 0018's pg_cron schedule) — finds users with
// a push subscription who haven't logged a workout or a meal in 2+ days and
// sends each of them one re-engagement push. No user JWT exists for a cron
// job, so this is deployed with --no-verify-jwt and instead checks a shared
// secret header set by the cron job itself.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'
import { corsHeaders } from '../_shared/cors.ts'

const INACTIVE_AFTER_MS = 2 * 24 * 60 * 60 * 1000

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const cronSecret = Deno.env.get('CRON_SECRET')
  if (!cronSecret || req.headers.get('x-cron-secret') !== cronSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
  }

  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
  const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:support@fittrack-ai.app'
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

  const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))

  const { data: subs, error: subsError } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')
  if (subsError) {
    return new Response(JSON.stringify({ error: subsError.message }), { status: 500, headers: corsHeaders })
  }
  if (!subs?.length) {
    return new Response(JSON.stringify({ sent: 0, checked: 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const userIds = [...new Set(subs.map((s) => s.user_id))]
  const cutoff = new Date(Date.now() - INACTIVE_AFTER_MS).toISOString()

  const [{ data: recentWorkouts }, { data: recentMeals }] = await Promise.all([
    supabase.from('workout_sessions').select('user_id').in('user_id', userIds).gte('started_at', cutoff),
    supabase.from('meal_logs').select('user_id').in('user_id', userIds).gte('created_at', cutoff),
  ])

  const activeUserIds = new Set([
    ...(recentWorkouts ?? []).map((r) => r.user_id),
    ...(recentMeals ?? []).map((r) => r.user_id),
  ])

  let sent = 0
  for (const sub of subs) {
    if (activeUserIds.has(sub.user_id)) continue
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({
          title: 'FitTrack AI',
          body: "Haven't seen you in a couple days — your streak's waiting 👀",
          url: '/dashboard',
        })
      )
      sent++
    } catch (err) {
      const statusCode = err?.statusCode
      if (statusCode === 404 || statusCode === 410) {
        // Subscription expired/revoked on the browser side — stop trying it.
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
      }
    }
  }

  return new Response(
    JSON.stringify({ sent, checked: userIds.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
