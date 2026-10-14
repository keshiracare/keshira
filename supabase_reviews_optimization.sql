-- ==============================================================================
-- Keshira Reviews Table Optimization & Indexes Script
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Index for created_at ordering (used when fetching newest reviews)
CREATE INDEX IF NOT EXISTS idx_reviews_created_at_desc 
ON public.reviews (created_at DESC);

-- 2. Index for rating (used when filtering by 5 stars, 4 stars, etc.)
CREATE INDEX IF NOT EXISTS idx_reviews_rating 
ON public.reviews (rating);

-- 3. Composite index for rating + created_at
CREATE INDEX IF NOT EXISTS idx_reviews_rating_created_at 
ON public.reviews (rating, created_at DESC);

-- 4. Enable Row Level Security (RLS) if not already enabled
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 5. Ensure Public Read Access (Anyone can view reviews instantly)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'reviews' AND policyname = 'Public read reviews'
  ) THEN
    CREATE POLICY "Public read reviews" 
    ON public.reviews 
    FOR SELECT 
    USING (true);
  END IF;
END $$;

-- 6. Ensure Public Insert Access (Allow customers to submit reviews)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'reviews' AND policyname = 'Public insert reviews'
  ) THEN
    CREATE POLICY "Public insert reviews" 
    ON public.reviews 
    FOR INSERT 
    WITH CHECK (true);
  END IF;
END $$;

-- 7. Ensure Orders Table Indexing for lightning-fast Buyer Verification
CREATE INDEX IF NOT EXISTS idx_orders_id_email 
ON public.orders (id, email);

CREATE INDEX IF NOT EXISTS idx_orders_normalized_email 
ON public.orders (normalized_email);
