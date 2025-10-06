import supabaseAdmin from './_lib/supabaseClient';
import { getUserFromToken, isAdminUser } from './_lib/auth';
import formidable from 'formidable';
import fs from 'fs';

// This handler expects a multipart/form-data POST with file, bucket (product-images|shipment-docs)
export const config = { api: { bodyParser: false } };

export default async function handler(req: any, res: any) {
  try {
    const token = req.headers?.authorization?.split('Bearer ')[1];
    const user = await getUserFromToken(token);
    if (!user || !isAdminUser(user)) {
      return res.status(403).json({ error: 'admin_required' });
    }

    const form = new formidable.IncomingForm();
    form.parse(req, async (err: any, fields: any, files: any) => {
      if (err) return res.status(400).json({ error: 'invalid_form' });
      const bucket = fields.bucket || 'product-images';
      const file = files.file;
      if (!file) return res.status(400).json({ error: 'file required' });

      const buffer = fs.readFileSync(file.filepath || file.path);
      const filePath = `${bucket}/${Date.now()}_${file.originalFilename || file.name}`.replace(/[^a-zA-Z0-9_./-]/g, '_');
      const { data, error: uploadErr } = await supabaseAdmin.storage.from(bucket).upload(filePath, buffer, { upsert: true });
      if (uploadErr) return res.status(500).json({ error: uploadErr.message || uploadErr });
      const { publicURL } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
      return res.json({ publicURL });
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
}
