// api/orders.js
// REST API for Orders CRUD and Telegram payment confirmation actions
import { supabase } from './_supabase.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. GET /api/orders -> List orders
    if (req.method === 'GET') {
      const { limit = 50, id } = req.query;

      if (id) {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) return res.status(500).json({ success: false, error: error.message });
        return res.status(200).json({ success: true, order: data });
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(Number(limit));

      if (error) return res.status(500).json({ success: false, error: error.message });
      return res.status(200).json({ success: true, count: data.length, orders: data });
    }

    // 2. PUT /api/orders -> Update order status or admin notes
    if (req.method === 'PUT') {
      const { id, status, admin_notes, payment_status, utr, order_data } = req.body;
      if (!id) return res.status(400).json({ success: false, error: 'Order id is required.' });

      const updates = {};
      if (status !== undefined) updates.status = status;
      if (admin_notes !== undefined) updates.admin_notes = admin_notes;
      if (payment_status !== undefined) updates.payment_status = payment_status;
      if (utr !== undefined) updates.utr = utr;
      if (order_data !== undefined) updates.order_data = order_data;

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) return res.status(500).json({ success: false, error: error.message });
      return res.status(200).json({ success: true, order: data[0] });
    }

    // 3. POST /api/orders -> Insert new normalized order
    if (req.method === 'POST') {
      const {
        id,
        order_data,
        email,
        normalized_email,
        customer_name,
        phone,
        utr,
        total_amount,
        subtotal,
        discount,
        coupon_code,
        shipping_address,
        city,
        pincode,
        payment_method = 'UPI',
        payment_status = 'Pending Verification',
        items,
        status = 'Received',
        admin_notes = ''
      } = req.body;

      if (!id || !order_data) {
        return res.status(400).json({ success: false, error: 'Order id and order_data are required.' });
      }

      const shipping = order_data.shippingAddress || {};

      const row = {
        id,
        order_data,
        email: email || shipping.email || '',
        normalized_email: normalized_email || (shipping.email || '').toLowerCase().trim(),
        customer_name: customer_name || shipping.fullName || '',
        phone: phone || shipping.phone || '',
        utr: utr || order_data.utr || '',
        total_amount: total_amount !== undefined ? Number(total_amount) : Number(order_data.total || 0),
        subtotal: subtotal !== undefined ? Number(subtotal) : Number(order_data.subtotal || order_data.total || 0),
        discount: discount !== undefined ? Number(discount) : Number(order_data.discount || order_data.couponDiscount || 0),
        coupon_code: coupon_code || order_data.couponCode || '',
        shipping_address: shipping_address || shipping.address || '',
        city: city || shipping.city || '',
        pincode: pincode || shipping.pinCode || '',
        payment_method: payment_method || order_data.paymentMethod || 'UPI',
        payment_status: payment_status || (order_data.utr?.includes('Verified') ? 'Verified' : 'Pending Verification'),
        items: items || order_data.items || [],
        status,
        admin_notes,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([row])
        .select();

      if (error) return res.status(500).json({ success: false, error: error.message });
      return res.status(201).json({ success: true, order: data[0] });
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error('API /api/orders error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
