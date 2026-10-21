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
      const { id, status, admin_notes, order_data } = req.body;
      if (!id) return res.status(400).json({ success: false, error: 'Order id is required.' });

      const updates = {};
      if (status !== undefined) updates.status = status;
      if (admin_notes !== undefined) updates.admin_notes = admin_notes;
      if (order_data !== undefined) updates.order_data = order_data;

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) return res.status(500).json({ success: false, error: error.message });
      return res.status(200).json({ success: true, order: data[0] });
    }

    // 3. POST /api/orders -> Insert new order
    if (req.method === 'POST') {
      const { id, order_data, email, normalized_email, status = 'Received' } = req.body;
      if (!id || !order_data) {
        return res.status(400).json({ success: false, error: 'Order id and order_data are required.' });
      }

      const { data, error } = await supabase
        .from('orders')
        .insert([{
          id,
          order_data,
          email: email || order_data.shippingAddress?.email || '',
          normalized_email: normalized_email || (order_data.shippingAddress?.email || '').toLowerCase().trim(),
          status,
          created_at: new Date().toISOString()
        }])
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
