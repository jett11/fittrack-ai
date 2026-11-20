// Single AI endpoint for FitTrack AI's three Gemini-backed features — routine
// generation, budget meal-plan generation, and dashboard insights. One
// function instead of three so there's only one secret (GEMINI_API_KEY) and
// one deployment to manage. The Gemini key only ever lives here, never in
// the browser bundle — same pattern as create-razorpay-order.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// "-latest" alias instead of a dated model id — dated Gemini model ids get
// retired from new API keys periodically, and the alias tracks whichever
// current model Google points it at.
const GEMINI_MODEL = 'gemini-flash-latest'

const SCHEMAS = {
  routine: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      exercises: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            exercise_id: { type: 'string' },
            sets: { type: 'integer' },
            reps: { type: 'string' },
            rest_seconds: { type: 'integer' },
          },
          required: ['exercise_id', 'sets', 'reps', 'rest_seconds'],
        },
      },
    },
    required: ['name', 'exercises'],
  },
  'meal-plan': {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            food_id: { type: 'string' },
            quantity: { type: 'integer' },
          },
          required: ['food_id', 'quantity'],
        },
      },
      rationale: { type: 'string' },
    },
    required: ['items', 'rationale'],
  },
  insights: {
    type: 'object',
    properties: {
      insight: { type: 'string' },
    },
    required: ['insight'],
  },
}

function buildPrompt(type, payload) {
  if (type === 'routine') {
    const { goal, level, location, daysPerWeek, availableExercises } = payload
    return `You are a fitness coach building ONE workout session (not a full weekly split) for a user.
Goal: ${goal || 'general fitness'}
Experience level: ${level || 'not specified'}
Training location: ${location || 'not specified'}
Days per week the user trains: ${daysPerWeek || 'not specified'}

Choose exercises ONLY from this list — copy "id" values exactly, never invent one:
${JSON.stringify(availableExercises)}

Pick 5-8 exercises covering a balanced mix of muscle groups for this one session, with sets/reps/rest sensible for the stated experience level.`
  }
  if (type === 'meal-plan') {
    const { budget, dietaryPreference, calorieTarget, proteinTarget, availableFoods } = payload
    return `You are an Indian nutrition coach helping someone eat well on a tight daily budget.
Daily budget: ₹${budget}
Dietary preference: ${dietaryPreference || 'no strict preference'}
Calorie target: ${calorieTarget ?? 'unknown'} kcal/day
Protein target: ${proteinTarget ?? 'unknown'} g/day

Choose foods ONLY from this list — copy "id" values exactly, never invent one:
${JSON.stringify(availableFoods)}

Pick realistic quantities of a few foods so total cost stays at or under the budget, getting as close as reasonable to the calorie and protein targets. Respect the dietary preference strictly. Write a short one or two sentence rationale in plain, friendly language explaining the picks.`
  }
  if (type === 'insights') {
    const { weightHistory, weeklyConsistency, todayMeals, todayWorkout, fitnessGoal } = payload
    return `You are an encouraging but honest fitness coach. Based on this user's recent data, write ONE short insight (2-4 sentences, specific, no generic filler) about their progress plus a concrete next step.

Fitness goal: ${fitnessGoal || 'not specified'}
Recent weight entries, oldest to newest (kg): ${JSON.stringify(weightHistory)}
Last 7 days workout consistency (true = completed a session): ${JSON.stringify(weeklyConsistency)}
Today's logged nutrition so far: ${JSON.stringify(todayMeals)}
Today's workout session: ${JSON.stringify(todayWorkout)}`
  }
  throw new Error('Unknown type')
}

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

  const body = await req.json()
  const { type } = body

  if (!SCHEMAS[type]) {
    return new Response(JSON.stringify({ error: 'Unknown request type.' }), { status: 400, headers: corsHeaders })
  }

  let payload = body

  if (type === 'meal-plan') {
    let foodsQuery = supabase
      .from('foods')
      .select('id, name, calories, protein_g, carbs_g, fat_g, price_inr, is_veg')
      .not('price_inr', 'is', null)
    if (body.dietaryPreference === 'vegetarian') foodsQuery = foodsQuery.eq('is_veg', true)
    if (body.dietaryPreference === 'vegan') foodsQuery = foodsQuery.eq('is_veg', true).neq('category', 'Dairy')
    const { data: foods, error: foodsError } = await foodsQuery
    if (foodsError) {
      return new Response(JSON.stringify({ error: 'Could not load foods.' }), { status: 500, headers: corsHeaders })
    }
    payload = { ...body, availableFoods: foods }
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'AI isn’t configured yet — missing GEMINI_API_KEY.' }), { status: 500, headers: corsHeaders })
  }

  const prompt = buildPrompt(type, payload)

  // The free tier returns 503 "high demand" fairly often — worth one quick
  // retry before giving up, since it's usually a few seconds of congestion.
  let geminiRes
  for (let attempt = 0; attempt < 2; attempt++) {
    geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: SCHEMAS[type],
          },
        }),
      }
    )
    if (geminiRes.ok || geminiRes.status !== 503) break
    await new Promise((resolve) => setTimeout(resolve, 1500))
  }

  if (!geminiRes.ok) {
    const errText = await geminiRes.text()
    console.error('Gemini error:', errText)
    const message =
      geminiRes.status === 503
        ? 'The AI is overloaded right now (free tier) — please try again in a moment.'
        : 'The AI service is unavailable right now. Try again shortly.'
    return new Response(JSON.stringify({ error: message }), { status: 502, headers: corsHeaders })
  }

  const geminiData = await geminiRes.json()
  const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    return new Response(JSON.stringify({ error: 'The AI did not return a usable response.' }), { status: 502, headers: corsHeaders })
  }

  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    return new Response(JSON.stringify({ error: 'The AI returned something unexpected. Try again.' }), { status: 502, headers: corsHeaders })
  }

  return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})
