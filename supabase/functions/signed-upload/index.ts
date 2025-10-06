import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.28.0";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. This function requires a service role key.');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

function sanitizeFilePath(input: string) {
  return input.replace(/[^a-zA-Z0-9_./-]/g, '_');
}

function isAdminUser(user: any) {
  if (!user) return false;
  if ((user.user_metadata && user.user_metadata.role === 'admin') || (user.app_metadata && user.app_metadata.role === 'admin')) return true;
  return false;
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

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(JSON.stringify({ error: 'content-type must be multipart/form-data' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const bucketRaw = formData.get('bucket')?.toString() || 'product-images';
    const bucket = bucketRaw;

    if (!file) return new Response(JSON.stringify({ error: 'file required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const safeName = sanitizeFilePath(`${bucket}/${Date.now()}_${file.name}`);

    // Try streaming upload first (supported by supabase-js in Deno/runtime)
    try {
      // some runtimes accept file.stream() directly
      const stream = (file as any).stream ? (file as any).stream() : null;
      if (stream) {
        const { data, error } = await supabaseAdmin.storage.from(bucket).upload(safeName, stream as unknown as ReadableStream, {
          contentType: file.type || 'application/octet-stream',
          upsert: true
        });
        if (error) throw error;
        const { data: pubData, error: pubErr } = await supabaseAdmin.storage.from(bucket).getPublicUrl(safeName);
        if (pubErr) {
          return new Response(JSON.stringify({ path: data.path }), { headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ path: data.path, publicURL: (pubData as any).publicUrl }), { headers: { 'Content-Type': 'application/json' } });
      }
    } catch (err) {
      console.warn('stream upload failed, falling back to arrayBuffer upload', err);
    }

    // fallback: read whole file and upload as Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage.from(bucket).upload(safeName, uint8, {
      contentType: file.type || 'application/octet-stream',
      upsert: true,
    });

    if (uploadErr) return new Response(JSON.stringify({ error: uploadErr.message || uploadErr }), { status: 500, headers: { 'Content-Type': 'application/json' } });

    const { data: pubData2, error: pubErr2 } = await supabaseAdmin.storage.from(bucket).getPublicUrl(safeName);
    if (pubErr2) return new Response(JSON.stringify({ path: uploadData.path }), { headers: { 'Content-Type': 'application/json' } });

    return new Response(JSON.stringify({ path: uploadData.path, publicURL: (pubData2 as any).publicUrl }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
