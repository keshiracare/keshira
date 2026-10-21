// api/products.js
// REST API for Products CRUD
import { supabase } from './_supabase.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. GET /api/products -> List all products
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) return res.status(500).json({ success: false, error: error.message });
      return res.status(200).json({ success: true, data });
    }

    // 2. PUT /api/products -> Update a product (prices, B1G1 status, etc.)
    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ success: false, error: 'Product id is required.' });

      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();

      if (error) return res.status(500).json({ success: false, error: error.message });
      return res.status(200).json({ success: true, data: data[0] });
    }

    // 3. POST /api/products -> Create a new custom product
    if (req.method === 'POST') {
      const newProduct = req.body;
      if (!newProduct.id || !newProduct.name) {
        return res.status(400).json({ success: false, error: 'id and name are required.' });
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{ ...newProduct, updated_at: new Date().toISOString() }])
        .select();

      if (error) return res.status(500).json({ success: false, error: error.message });
      return res.status(201).json({ success: true, data: data[0] });
    }

    // 4. DELETE /api/products -> Delete a product
    if (req.method === 'DELETE') {
      const { id } = req.query || req.body;
      if (!id) return res.status(400).json({ success: false, error: 'Product id is required.' });

      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) return res.status(500).json({ success: false, error: error.message });
      return res.status(200).json({ success: true, message: `Product ${id} deleted.` });
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error('API /api/products error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
