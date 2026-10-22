import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only initialize if we have a valid URL to prevent "supabaseUrl is required" error
export const supabase = supabaseUrl 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any; // Cast to any to avoid type errors in components, but we'll guard usage
