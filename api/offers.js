// api/offers.js
// REST API for Store Promotions and Coupons CRUD
import { supabase } from './_supabase.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. GET /api/offers -> Fetch store promotions & active coupons
    if (req.method === 'GET') {
      const [promoRes, couponsRes] = await Promise.all([
        supabase.from('store_promotions').select('*').limit(1).maybeSingle(),
        supabase.from('coupons').select('*').order('created_at', { ascending: true })
      ]);

      if (promoRes.error) return res.status(500).json({ success: false, error: promoRes.error.message });
      if (couponsRes.error) return res.status(500).json({ success: false, error: couponsRes.error.message });

      return res.status(200).json({
        success: true,
        promotions: promoRes.data,
        coupons: couponsRes.data
      });
    }

    // 2. PUT /api/offers -> Update promotions, coupons, or master B1G1 switch
    if (req.method === 'PUT') {
      const { promotions, coupon, masterBogo } = req.body;

      // Handle master B1G1 toggle synchronization
      if (typeof masterBogo === 'boolean') {
        // A. Update store_promotions (id is 'global')
        const { error: promoErr } = await supabase
          .from('store_promotions')
          .update({ is_bogo_enabled: masterBogo, updated_at: new Date().toISOString() })
          .eq('id', 'global');

        if (promoErr) return res.status(500).json({ success: false, error: promoErr.message });

        // B. Cascade to all products so product-level B1G1 stays synchronized
        const { error: prodErr } = await supabase
          .from('products')
          .update({ is_bogo: masterBogo, updated_at: new Date().toISOString() })
          .neq('id', 'dummy');

        if (prodErr) return res.status(500).json({ success: false, error: prodErr.message });

        return res.status(200).json({
          success: true,
          message: `Master B1G1 set to ${masterBogo} and cascaded to all products.`
        });
      }

      // Handle store_promotions general update
      if (promotions) {
        const { data, error } = await supabase
          .from('store_promotions')
          .upsert({ id: 'global', ...promotions, updated_at: new Date().toISOString() })
          .select();

        if (error) return res.status(500).json({ success: false, error: error.message });
        return res.status(200).json({ success: true, data: data[0] });
      }

      // Handle single coupon update
      if (coupon && coupon.code) {
        const { data, error } = await supabase
          .from('coupons')
          .update({ ...coupon })
          .eq('code', coupon.code)
          .select();

        if (error) return res.status(500).json({ success: false, error: error.message });
        return res.status(200).json({ success: true, data: data[0] });
      }

      return res.status(400).json({ success: false, error: 'Invalid payload for PUT /api/offers' });
    }

    // 3. POST /api/offers -> Add a new coupon
    if (req.method === 'POST') {
      const { coupon } = req.body;
      if (!coupon || !coupon.code) {
        return res.status(400).json({ success: false, error: 'Coupon with a code is required.' });
      }

      const { data, error } = await supabase
        .from('coupons')
        .insert([{ ...coupon }])
        .select();

      if (error) return res.status(500).json({ success: false, error: error.message });
      return res.status(201).json({ success: true, data: data[0] });
    }

    // 4. DELETE /api/offers -> Delete a coupon
    if (req.method === 'DELETE') {
      const { code } = req.query || req.body;
      if (!code) return res.status(400).json({ success: false, error: 'Coupon code is required.' });

      const { error } = await supabase.from('coupons').delete().eq('code', code);
      if (error) return res.status(500).json({ success: false, error: error.message });
      return res.status(200).json({ success: true, message: `Coupon ${code} deleted.` });
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error('API /api/offers error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
