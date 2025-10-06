import supabaseAdmin from './_lib/supabaseClient';
import { generateQrImageUrl, uploadQrToStorage } from './_lib/qr';
import { getUserFromToken, isAdminUser } from './_lib/auth';
import fetch from 'node-fetch';

// POST { order_id }
export default async function handler(req: any, res: any) {
  try {
    const token = req.headers?.authorization?.split('Bearer ')[1];
    const user = await getUserFromToken(token);
    if (!user || !isAdminUser(user)) {
      return res.status(403).json({ error: 'admin_required' });
    }

    const { order_id } = req.body || {};
    if (!order_id) return res.status(400).json({ error: 'order_id required' });

    // Fetch order
    const { data: order } = await supabaseAdmin.from('orders').select('*').eq('id', order_id).maybeSingle();
    if (!order) return res.status(404).json({ error: 'order_not_found' });

    // Build QR payload
    const payload = {
      order_id: order.id,
      user_id: order.user_id,
      items: order.items,
      address: order.address,
      total: order.total,
      support_phone: process.env.SUPPORT_PHONE || null,
      support_logo: process.env.SUPPORT_LOGO_URL || null,
      generated_at: new Date().toISOString(),
    };

    // Generate QR image URL via Google Chart API
    const qrUrl = `https://chart.googleapis.com/chart?chs=600x600&cht=qr&chl=${encodeURIComponent(JSON.stringify(payload))}`;

    // Fetch QR image and upload to storage
    const resp = await fetch(qrUrl);
    const buffer = await resp.arrayBuffer();
    const buf = Buffer.from(buffer);
    const filePath = `qr/order_${order.id}_${Date.now()}.png`;
    const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage.from('product-images').upload(filePath, buf, { upsert: true });
    if (uploadErr) {
      console.warn('uploadErr', uploadErr);
      // fallback: use external qrUrl
      await supabaseAdmin.from('orders').update({ qr_code_url: qrUrl, qr_data: payload }).eq('id', order.id);
      return res.json({ qr_code_url: qrUrl });
    }

    const { publicURL } = supabaseAdmin.storage.from('product-images').getPublicUrl(filePath);

    // Save to order
    await supabaseAdmin.from('orders').update({ qr_code_url: publicURL, qr_data: payload }).eq('id', order.id);

    return res.json({ qr_code_url: publicURL });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
}
