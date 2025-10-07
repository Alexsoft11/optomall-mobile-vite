import { supabase } from "@/lib/supabase";

const FUNCTIONS_URL = (import.meta.env.VITE_SUPABASE_FUNCTIONS_URL as string | undefined) || (import.meta.env.NEXT_PUBLIC_SUPABASE_URL ? `${import.meta.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1` : undefined);

async function invokeOrFetch(functionName: string, body: any) {
  // Try supabase.functions.invoke first
  try {
    const resp = await supabase.functions.invoke(functionName, { method: 'POST', body: JSON.stringify(body) });
    if (resp?.error) throw resp.error;
    return resp?.data ?? resp;
  } catch (err) {
    // Fallback to direct fetch to FUNCTIONS_URL
    if (!FUNCTIONS_URL) throw err;
    const token = (await supabase.auth.getSession()).data?.session?.access_token;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${FUNCTIONS_URL}/${functionName}`, { method: 'POST', headers, body: JSON.stringify(body) });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw json || new Error('Function fetch failed');
    return json;
  }
}

export async function generateQr(orderId: number) {
  if (!supabase) throw new Error("Supabase not initialized");

  // Dev mock: if running in dev and FUNCTIONS_URL is not configured, return a simple SVG data URL as QR placeholder
  const isDev = Boolean(import.meta.env.DEV);
  if (isDev && !FUNCTIONS_URL) {
    // generate QR client-side using a small CDN ESM build of qrcode
    try {
      const QR = await import('https://cdn.skypack.dev/qrcode');
      const dataUrl = await QR.toDataURL(JSON.stringify({ order_id: orderId }), { errorCorrectionLevel: 'M', width: 600 });
      return { qr_code_url: dataUrl, qr: dataUrl };
    } catch (e) {
      // fallback to simple SVG if CDN import fails
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><rect width='100%' height='100%' fill='#fff'/><text x='50%' y='50%' font-size='28' dominant-baseline='middle' text-anchor='middle' fill='#000'>QR:${String(orderId)}</text></svg>`;
      const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
      return { qr_code_url: dataUrl, qr: dataUrl };
    }
  }

  return invokeOrFetch('generate-qr', { order_id: orderId });
}

export async function tmapiFetch(provider: string, externalId: string) {
  if (!supabase) throw new Error("Supabase not initialized");
  return invokeOrFetch('tmapi-fetch', { provider, external_id: externalId });
}

export async function bulkActions(entity: string, action: string, ids: number[], payload?: any) {
  if (!supabase) throw new Error("Supabase not initialized");
  return invokeOrFetch('bulk-actions', { entity, action, ids, payload });
}

export async function signedUpload(file: File, bucket = 'product-images') {
  // Dev mock: if running locally and no FUNCTIONS_URL, return placeholder image URL so UI continues to work
  const isDev = Boolean(import.meta.env.DEV);
  if (isDev && !FUNCTIONS_URL) {
    // Use public placeholder in /public/placeholder.svg
    return { publicURL: '/placeholder.svg', path: `mock/${Date.now()}_${file.name}` };
  }

  // Try to use the Edge function; if not available, use other fallbacks
  try {
    // If supabase.functions.invoke supports FormData, prefer it
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('bucket', bucket);
      const resp = await supabase.functions.invoke('signed-upload', { method: 'POST', body: fd as any });
      if (resp?.error) throw resp.error;
      return resp?.data ?? resp;
    } catch (e) {
      // ignore and fall through to invokeOrFetch which uses JSON
    }

    // If we can't send FormData via invoke, use fetch to FUNCTIONS_URL
    if (FUNCTIONS_URL) {
      const token = (await supabase.auth.getSession()).data?.session?.access_token;
      const fd2 = new FormData();
      fd2.append('file', file);
      fd2.append('bucket', bucket);
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const fetchResp = await fetch(`${FUNCTIONS_URL}/signed-upload`, { method: 'POST', headers, body: fd2 });
      const json = await fetchResp.json();
      if (!fetchResp.ok) throw json;
      return json;
    }

    // Final fallback: attempt direct client-side upload to storage (requires anon key writes enabled)
    const filePath = `${bucket}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true });
    if (error) throw error;
    const { publicURL } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return { publicURL };
  } catch (err) {
    throw err;
  }
}
