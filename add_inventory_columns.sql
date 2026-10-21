-- =========================================================================
-- SQL Migration: Add Stock & Inventory Tracking to Products Table
-- Run in Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- =========================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock_quantity INT DEFAULT 100,
  ADD COLUMN IF NOT EXISTS is_in_stock BOOLEAN DEFAULT TRUE;

-- Update existing products to have active inventory
UPDATE public.products
SET 
  stock_quantity = COALESCE(stock_quantity, 100),
  is_in_stock = COALESCE(is_in_stock, TRUE);
