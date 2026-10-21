// api/_supabase.js
// Server-side Supabase client for Vercel Serverless Functions
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key missing in API environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
