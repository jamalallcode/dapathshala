import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (
  import.meta.env.VITE_SUPABASE_URL ||
  'https://bdwbjrvxrtknelclmtvf.supabase.co'
).trim();

const SUPABASE_ANON_KEY = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_kmxQKBkCOkgMW2Nr52qy-w_sfzwS8aQ'
).trim();

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL.startsWith('https://')
);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : (null as any);
