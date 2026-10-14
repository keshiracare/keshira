import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase URL or Anon Key is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env or host deployment settings.');
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

// Delimiter used to pack extended attributes (photo, productUsed, location, verifiedBuyer)
// safely into Supabase's existing text column without schema migration failures
const REVIEW_META_DELIMITER = '\n--keshira_meta--\n';

export const serializeReviewText = (cleanText, meta = {}) => {
  const text = (cleanText || '').trim();
  const metaObj = {};
  if (meta.photo) metaObj.photo = meta.photo;
  if (meta.productUsed) metaObj.productUsed = meta.productUsed;
  if (meta.productId) metaObj.productId = meta.productId;
  if (meta.location) metaObj.location = meta.location;
  if (typeof meta.verifiedBuyer === 'boolean') metaObj.verifiedBuyer = meta.verifiedBuyer;

  if (Object.keys(metaObj).length === 0) return text;
  return `${text}${REVIEW_META_DELIMITER}${JSON.stringify(metaObj)}`;
};

export const deserializeReviewRow = (row) => {
  if (!row) return null;
  let text = row.text || '';
  let meta = {};

  if (text.includes(REVIEW_META_DELIMITER)) {
    const parts = text.split(REVIEW_META_DELIMITER);
    text = parts[0];
    try {
      meta = JSON.parse(parts.slice(1).join(REVIEW_META_DELIMITER)) || {};
    } catch {
      meta = {};
    }
  }

  return {
    id: row.id,
    author: row.name,
    name: row.name,
    rating: Number(row.rating) || 5,
    scalpType: row.scalp_type || 'Normal & Balanced',
    scalp_type: row.scalp_type || 'Normal & Balanced',
    text: text,
    date: row.date || 'Recent',
    created_at: row.created_at,
    photo: meta.photo || row.photo || '',
    productUsed: meta.productUsed || row.product_used || '',
    productId: meta.productId || row.product_id || '',
    location: meta.location || row.location || '',
    verifiedBuyer: meta.verifiedBuyer !== undefined ? meta.verifiedBuyer : (row.verified_buyer !== false)
  };
};

