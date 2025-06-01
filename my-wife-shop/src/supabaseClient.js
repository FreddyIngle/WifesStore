import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vajuojydkhhfwwroszvs.supabase.co'
const supabaseAnonKey =import.meta.env.VITE_SUPABASE_KEY;
if (!supabaseAnonKey) {
  throw new Error("Supabase Key is missing");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)