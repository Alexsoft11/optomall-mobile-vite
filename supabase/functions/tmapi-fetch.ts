import { fetchExternalItem } from './_lib/tmapi';
import { getUserFromToken, isAdminUser } from './_lib/auth';

// POST { provider, external_id }
export default async function handler(req: any, res: any) {
  try {
    const { provider, external_id } = req.body || {};
    if (!provider || !external_id) return res.status(400).json({ error: 'provider and external_id required' });

    // Note: allow public reads, but caching/upsert is handled server-side
    const payload = await fetchExternalItem(provider, external_id);
    return res.json({ data: payload });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
}
