import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://jiznwswtunmhewoerzrf.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppem53c3d0dW5taGV3b2VyenJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NDgwODUsImV4cCI6MjEwNTIyNDA4NX0.2GPD-oqvCZvxoSLuxxWadQ9n1NwVMwmoK55WVSreZ1E";

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

export interface CloudBookQuestion {
  id?: string;
  subject: string;
  class_level?: string;
  topic: string;
  book_name?: string;
  page_number?: string;
  question: string;
  options: string[] | string;
  answer: string;
  explanation?: string;
  year_or_board?: string;
  created_at?: string;
}
