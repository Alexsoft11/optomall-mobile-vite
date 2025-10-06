import { supabase } from "@/lib/supabase";

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL as string | undefined;

export async function generateQr(orderId: number) {
  if (!supabase) throw new Error("Supabase not initialized");
  const res = await supabase.functions.invoke('generate-qr', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId }),
  });
  if (res.error) throw res.error;
  return res.data;
}

export async function tmapiFetch(provider: string, externalId: string) {
  if (!supabase) throw new Error("Supabase not initialized");
  const res = await supabase.functions.invoke('tmapi-fetch', {
    method: 'POST',
    body: JSON.stringify({ provider, external_id: externalId }),
  });
  if (res.error) throw res.error;
  return res.data;
}

export async function bulkActions(entity: string, action: string, ids: number[], payload?: any) {
  if (!supabase) throw new Error("Supabase not initialized");
  const res = await supabase.functions.invoke('bulk-actions', {
    method: 'POST',
    body: JSON.stringify({ entity, action, ids, payload }),
  });
  if (res.error) throw res.error;
  return res.data;
}

export async function signedUpload(file: File, bucket = 'product-images') {
  // Prefer calling Supabase Edge Function via supabase.functions.invoke if client is available
  try {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('bucket', bucket);

    // supabase.functions.invoke usually works in browser and will route to your deployed Edge function
    const resp = await supabase.functions.invoke('signed-upload', {
      method: 'POST',
      body: fd as any,
    });
    if (resp?.error) throw resp.error;
    return resp?.data || resp;
  } catch (err) {
    // If invoke is not available or fails, fallback to direct fetch to FUNCTIONS_URL if configured
    const token = (await supabase.auth.getSession()).data?.session?.access_token;
    if (FUNCTIONS_URL) {
      const url = `${FUNCTIONS_URL}/signed-upload`;
      const fd2 = new FormData();
      fd2.append('file', file);
      fd2.append('bucket', bucket);
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const fetchResp = await fetch(url, { method: 'POST', headers, body: fd2 });
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
  }
}
