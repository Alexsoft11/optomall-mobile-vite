import supabaseAdmin from './_lib/supabaseClient';
import { getUserFromToken, isAdminUser } from './_lib/auth';

// POST { entity: 'products'|'shipments', action: 'update_status'|'delete', ids: [1,2,3], payload: { status: 'delivered' } }
export default async function handler(req: any, res: any) {
  try {
    const token = req.headers?.authorization?.split('Bearer ')[1];
    const user = await getUserFromToken(token);
    if (!user || !isAdminUser(user)) return res.status(403).json({ error: 'admin_required' });

    const { entity, action, ids, payload } = req.body || {};
    if (!entity || !action || !Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'invalid_request' });

    if (entity === 'products') {
      if (action === 'delete') {
        const { error } = await supabaseAdmin.from('products').delete().in('id', ids);
        if (error) throw error;
        return res.json({ ok: true });
      }
      if (action === 'update_status') {
        const { status } = payload || {};
        if (!status) return res.status(400).json({ error: 'status required' });
        const { error } = await supabaseAdmin.from('products').update({ status }).in('id', ids);
        if (error) throw error;
        return res.json({ ok: true });
      }
    }

    if (entity === 'shipments') {
      if (action === 'delete') {
        const { error } = await supabaseAdmin.from('shipments').delete().in('id', ids);
        if (error) throw error;
        return res.json({ ok: true });
      }
      if (action === 'update_status') {
        const { status } = payload || {};
        if (!status) return res.status(400).json({ error: 'status required' });
        const { error } = await supabaseAdmin.from('shipments').update({ status }).in('id', ids);
        if (error) throw error;
        return res.json({ ok: true });
      }
    }

    return res.status(400).json({ error: 'unsupported_entity_or_action' });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
}
