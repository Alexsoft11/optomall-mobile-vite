import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import QRCode from "https://esm.sh/qrcode@1.5.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.28.0";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. This function requires a service role key.');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

function isAdminUser(user: any) {
  if (!user) return false;
  if ((user.user_metadata && user.user_metadata.role === 'admin') || (user.app_metadata && user.app_metadata.role === 'admin')) return true;
  return false;
}

function base64ToUint8Array(base64: string) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.split('Bearer ')[1] : auth || undefined;

    // simple auth check using supabase admin client
    let user: any = null;
    if (token) {
      try {
        const resp = await supabaseAdmin.auth.getUser(token as string);
        user = (resp && (resp as any).data && (resp as any).data.user) ? (resp as any).data.user : null;
      } catch (err) {
        console.warn('getUser error', err);
      }
    }

    if (!isAdminUser(user)) {
      return new Response(JSON.stringify({ error: 'admin_required' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await req.json().catch(() => null);
    const order_id = body?.order_id;
    if (!order_id) return new Response(JSON.stringify({ error: 'order_id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    // fetch order
    const { data: order, error: orderErr } = await supabaseAdmin.from('orders').select('*').eq('id', order_id).maybeSingle();
    if (orderErr) {
      console.error('order fetch error', orderErr);
      return new Response(JSON.stringify({ error: 'order_fetch_error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    if (!order) return new Response(JSON.stringify({ error: 'order_not_found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });

    // Build payload for QR
    const payload = {
      order_id: order.id,
      user_id: order.user_id,
      items: order.items,
      address: order.address,
      total: order.total,
      support_phone: Deno.env.get('SUPPORT_PHONE') || null,
      support_logo: Deno.env.get('SUPPORT_LOGO_URL') || null,
      generated_at: new Date().toISOString(),
    };

    // Generate QR as DataURL (PNG)
    const qrDataUrl: string = await QRCode.toDataURL(JSON.stringify(payload), { errorCorrectionLevel: 'M', width: 600 });

    // Convert dataURL to binary
    const match = qrDataUrl.match(/^data:(image\/png);base64,(.*)$/);
    let publicUrl: string | null = null;
    if (match) {
      const base64 = match[2];
      const bytes = base64ToUint8Array(base64);
      const filePath = `qr/order_${order.id}_${Date.now()}.png`;

      // upload to storage
      const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage.from('product-images').upload(filePath, bytes, {
        contentType: 'image/png',
        upsert: true
      });

      if (uploadErr) {
        console.warn('uploadErr', uploadErr);
        // fallback: return external data URL
        await supabaseAdmin.from('orders').update({ qr_code_url: qrDataUrl, qr_data: payload }).eq('id', order.id);
        return new Response(JSON.stringify({ qr_code_url: qrDataUrl }), { headers: { 'Content-Type': 'application/json' } });
      }

      // get public url
      const { data: pubData, error: pubErr } = await supabaseAdmin.storage.from('product-images').getPublicUrl(filePath);
      if (pubErr) {
        console.warn('getPublicUrl error', pubErr);
        publicUrl = qrDataUrl; // fallback
      } else {
        publicUrl = (pubData as any).publicUrl || null;
      }

      // save to order
      await supabaseAdmin.from('orders').update({ qr_code_url: publicUrl, qr_data: payload }).eq('id', order.id);

      return new Response(JSON.stringify({ qr_code_url: publicUrl }), { headers: { 'Content-Type': 'application/json' } });
    }

    // if data URL not matched, return it directly
    return new Response(JSON.stringify({ qr: qrDataUrl }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
