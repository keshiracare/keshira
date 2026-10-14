import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Normalizes email addresses to prevent sub-addressing (+) and dots (.) bypass hacks
export const normalizeEmail = (email) => {
  if (!email) return '';
  const cleanEmail = email.trim().toLowerCase();
  const parts = cleanEmail.split('@');
  if (parts.length !== 2) return cleanEmail;
  
  let [local, domain] = parts;
  
  // Strip sub-addressing (+...) for all domains
  local = local.split('+')[0];
  
  // Remove dots for Gmail domains specifically
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    local = local.replace(/\./g, '');
  }
  
  return `${local}@${domain}`;
};
