// Creates a Razorpay order for the FitTrack AI Premium subscription.
// The Razorpay key secret only ever lives here (server-side), never in
// the browser bundle.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const PREMIUM_PRICE_PAISE = 14900 // ₹149.00, in the smallest currency unit Razorpay expects

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'), {
    global: { headers: { Authorization: authHeader } },
  })

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Not signed in.' }), { status: 401, headers: corsHeaders })
  }

  const keyId = Deno.env.get('RAZORPAY_KEY_ID')
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
  const basicAuth = btoa(`${keyId}:${keySecret}`)

  const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${basicAuth}`,
    },
    body: JSON.stringify({
      amount: PREMIUM_PRICE_PAISE,
      currency: 'INR',
      receipt: `premium_${user.id}_${Date.now()}`,
      notes: { user_id: user.id, product: 'fittrack-ai-premium-monthly' },
    }),
  })

  const order = await orderRes.json()

  if (!orderRes.ok) {
    console.error('Razorpay order creation failed:', orderRes.status, JSON.stringify(order))
    return new Response(JSON.stringify({ error: order.error?.description ?? 'Could not create order.' }), {
      status: 502,
      headers: corsHeaders,
    })
  }

  return new Response(
    JSON.stringify({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
