Supabase Edge Functions / RPC for Optomall

This folder contains server-side functions intended to run as Supabase Edge Functions (or serverless endpoints). Each function uses the Supabase service role key to perform privileged operations (writing to tables, uploading to storage).

Environment variables required (set in Supabase or hosting environment):
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- TMAPI_TAOBAO_KEY (optional)
- TMAPI_1688_KEY (optional)
- TMAPI_PINDUODUO_KEY (optional)
- SUPPORT_PHONE (optional, used in QR payload)
- SUPPORT_LOGO_URL (optional, used in QR payload)

Functions:
- generate-qr.ts — generate QR for an order, save image to storage and update order.qr_code_url & qr_data
- tmapi-fetch.ts — fetch external product data from Taobao/1688/Pinduoduo with caching in external_products
- signed-upload.ts — accept multipart upload and store file in storage bucket (product-images or shipment-docs)
- payments-webhook.ts — webhook receiver for payment providers (Click/Payme) to create/update payments and orders
- bulk-actions.ts — perform bulk updates/deletes for products/shipments (admin-only)

Notes:
- These functions use the @supabase/supabase-js library. When deploying to Supabase Edge Functions (Deno), adapt imports accordingly and ensure the service_role key is kept secret.
- Authentication: endpoints that require admin privileges expect an Authorization: Bearer <access_token> header. The function attempts to validate the token via the Supabase Admin API (supabase.auth.getUser) and checks for the 'role' claim or app metadata indicating 'admin'. Adjust to your auth setup if needed.

Deployment:
- For local testing, you can run these as Node scripts, but in production deploy as Supabase Edge Functions and set environment variables in the Supabase dashboard.
