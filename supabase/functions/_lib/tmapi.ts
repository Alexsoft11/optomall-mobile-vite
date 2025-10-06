import supabaseAdmin from './supabaseClient';

// Placeholder TMAPI fetchers - these should be implemented with real provider APIs and API keys stored in settings table or env vars.

export async function fetchExternalItem(provider: string, externalId: string) {
  // provider: 'taobao' | '1688' | 'pinduoduo'
  // Check cached external_products table
  const { data: cached, error: cacheErr } = await supabaseAdmin.from('external_products').select('*').eq('provider', provider).eq('external_id', externalId).limit(1).maybeSingle();
  if (cacheErr) console.warn('cache lookup error', cacheErr);
  if (cached && cached.cached_at) {
    const cachedAt = new Date(cached.cached_at);
    const ageMs = Date.now() - cachedAt.getTime();
    const maxAge = 48 * 3600 * 1000; // 48 hours
    if (ageMs < maxAge) {
      return cached.payload;
    }
  }

  // If not cached or expired, fetch from external API (stubbed)
  // TODO: implement real API calls using provider keys stored in settings
  const payload = {
    provider,
    external_id: externalId,
    title: `External ${provider} item ${externalId}`,
    description: 'Fetched from TMAPI (stub)',
    price: 123.45,
    images: [],
    fetched_at: new Date().toISOString(),
  };

  // Upsert into external_products
  try {
    await supabaseAdmin.from('external_products').upsert({ provider, external_id: externalId, payload, cached_at: new Date().toISOString() }, { onConflict: ['provider', 'external_id'] });
  } catch (err) {
    console.warn('upsert external_products failed', err);
  }

  return payload;
}
