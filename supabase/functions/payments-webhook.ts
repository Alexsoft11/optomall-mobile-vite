import supabaseAdmin from './_lib/supabaseClient';
import fetch from 'node-fetch';

// Simple webhook endpoint for payment providers (Click/Payme). The provider must POST a JSON payload.
// This endpoint verifies signature (stubbed) and upserts payments and updates order status.

export default async function handler(req: any, res: any) {
  try {
    const body = req.body || {};
    const provider = body.provider || 'unknown';
    const providerPaymentId = body.provider_payment_id || body.payment_id || null;
    const orderRef = body.order_id || body.meta?.order_id || null;
    const amount = body.amount || body.total || null;
    const status = body.status || 'pending';

    if (!orderRef) return res.status(400).json({ error: 'order_id missing' });

    // Insert payment record
    const { error: insertErr } = await supabaseAdmin.from('payments').insert([{ order_id: orderRef, provider, provider_payment_id: providerPaymentId, amount, status, raw_payload: body }]);
    if (insertErr) console.warn('payment insert error', insertErr);

    if (status === 'succeeded' || status === 'paid' || status === 'completed') {
      // Update order status to paid
      await supabaseAdmin.from('orders').update({ status: 'paid' }).eq('id', orderRef);

      // Optionally generate QR for order (if needed) - you can call generate-qr RPC or function here
      // For simplicity, we won't call it automatically here to avoid circular calls; admin may trigger generate-qr
    }

    return res.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
}
