// server/storage.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Accept either server or Vite-style names to be forgiving
const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY || // some teams use this name
  ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  // Helpful debug so you can see what's actually present
  console.error('ENV CHECK – SUPABASE_URL:', Boolean(SUPABASE_URL))
  console.error('ENV CHECK – SUPABASE_SERVICE_KEY:', Boolean(SUPABASE_SERVICE_KEY))
  throw new Error(
    'Supabase env missing. Ensure SUPABASE_URL and SUPABASE_SERVICE_KEY (.env in project root) are set.'
  )
}

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})
