-- =========================================================================
-- SQL Migration: Normalize the `orders` table in Supabase
-- Run this in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- =========================================================================

-- 1. Add dedicated columns for customer details, payment & shipping info
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS utr TEXT,
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS discount NUMERIC(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coupon_code TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS pincode TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'UPI',
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending Verification',
  ADD COLUMN IF NOT EXISTS items JSONB;

-- 2. Backfill existing row(s) from `order_data`
UPDATE public.orders
SET
  customer_name = COALESCE(customer_name, order_data->'shippingAddress'->>'fullName', order_data->>'customerName', ''),
  phone = COALESCE(phone, order_data->'shippingAddress'->>'phone', order_data->>'phone', ''),
  utr = COALESCE(utr, order_data->>'utr', ''),
  total_amount = COALESCE(total_amount, (order_data->>'total')::numeric, 0),
  subtotal = COALESCE(subtotal, (order_data->>'subtotal')::numeric, (order_data->>'total')::numeric, 0),
  discount = COALESCE(discount, (order_data->>'discount')::numeric, (order_data->>'couponDiscount')::numeric, 0),
  coupon_code = COALESCE(coupon_code, order_data->>'couponCode', ''),
  shipping_address = COALESCE(shipping_address, order_data->'shippingAddress'->>'address', ''),
  city = COALESCE(city, order_data->'shippingAddress'->>'city', ''),
  pincode = COALESCE(pincode, order_data->'shippingAddress'->>'pinCode', ''),
  payment_method = COALESCE(payment_method, order_data->>'paymentMethod', 'UPI'),
  payment_status = CASE 
    WHEN order_data->>'utr' ILIKE '%verified%' THEN 'Verified'
    WHEN status ILIKE '%verified%' THEN 'Verified'
    ELSE 'Pending Verification'
  END,
  items = COALESCE(items, order_data->'items');

-- 3. Create helpful performance indexes for searching orders
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(normalized_email);
CREATE INDEX IF NOT EXISTS idx_orders_utr ON public.orders(utr);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
