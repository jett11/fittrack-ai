// Verifies a Razorpay payment signature server-side, then — and only
// then — marks the signed-in user as Premium using the service role key
// (which is allowed past the protect_premium_flag trigger; see
// supabase/migrations/0011_premium_tier.sql).
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

async function hmacSha256Hex(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  const anonClient = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'), {
    global: { headers: { Authorization: authHeader } },
  })

  const {
    data: { user },
    error: userError,
  } = await anonClient.auth.getUser()

  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Not signed in.' }), { status: 401, headers: corsHeaders })
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return new Response(JSON.stringify({ error: 'Missing payment details.' }), { status: 400, headers: corsHeaders })
  }

  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
  const expectedSignature = await hmacSha256Hex(keySecret, `${razorpay_order_id}|${razorpay_payment_id}`)

  if (expectedSignature !== razorpay_signature) {
    return new Response(JSON.stringify({ error: 'Payment could not be verified.' }), { status: 400, headers: corsHeaders })
  }

  const adminClient = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))

  await adminClient.from('profiles').update({ is_premium: true }).eq('id', user.id)
  await adminClient
    .from('upgrade_requests')
    .update({ status: 'approved' })
    .eq('user_id', user.id)
    .eq('status', 'pending')

  return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})
