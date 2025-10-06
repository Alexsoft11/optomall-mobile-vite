import fetch from 'node-fetch';
import supabaseAdmin from './supabaseClient';

export async function generateQrImageUrl(payloadJson: object) {
  // Use Google Chart API for quick QR image generation
  const text = encodeURIComponent(JSON.stringify(payloadJson));
  const qrUrl = `https://chart.googleapis.com/chart?chs=500x500&cht=qr&chl=${text}`;
  return qrUrl;
}

export async function uploadQrToStorage(bucket: string, filePath: string, imageBuffer: Buffer) {
  // Upload binary image buffer to Supabase storage using service role
  const { data, error } = await supabaseAdmin.storage.from(bucket).upload(filePath, imageBuffer, { upsert: true });
  if (error) throw error;
  const { publicURL } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
  return publicURL;
}
