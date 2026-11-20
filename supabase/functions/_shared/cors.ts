// CORS headers for edge functions called cross-origin from the browser
// (the Pages domain differs from the Supabase functions domain, so every
// request is a preflighted cross-origin request).
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
