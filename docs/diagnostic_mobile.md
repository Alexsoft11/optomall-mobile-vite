# Mobile App — Deep Diagnostic

Generated: automatic analysis of current repository state

> Summary

This project is a Vite + React frontend with a lightweight Node/Express backend (exposed via Netlify function). The frontend uses Tailwind/CSS and several Radix UI libraries. Supabase is used as the primary BaaS for product data, sessions and file storage (if configured). The app includes an admin area (Products, Shipments, etc.) implemented in the frontend and talking directly to Supabase using the anon key.

---

## 1) High-level stack & architecture

- Frontend:
  - Framework: React (v18) + Vite dev build
  - UI tooling: Tailwind CSS, Radix UI components, Lucide icons, sonner/toast libs
  - Routing: react-router-dom
  - State: React useState/useEffect, Context (ShopContext), localStorage
  - Query: optional react-query present but not used heavily
  - Entry: client/App.tsx (React app mounted to `#root`)
- Backend (lightweight dev API):
  - Express app in `server/` with endpoints `/api/ping` and `/api/demo` (server/index.ts, server/routes/demo.ts)
  - Exposed serverless via Netlify function at `netlify/functions/api.ts` (server wrapped with serverless)
- Data / BaaS:
  - Supabase client wrapper: `client/lib/supabase.ts` — reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and creates a client via `@supabase/supabase-js`.
  - SQL schema and seeds present: `supabase/schema.sql` (products, sessions, shipments and sample rows)
  - Storage buckets referenced by code: `product-images` and `shipment-docs`.

## 2) Project structure (key folders/files)

- client/
  - App.tsx — app root with routes and admin routes
  - lib/supabase.ts — Supabase initialization
  - hooks/useProducts.ts — product fetching (falls back to local mock data)
  - context/ShopContext.tsx — cart & favorites + optional Supabase sessions sync
  - pages/
    - Index.tsx, Marketplace.tsx, ProductDetail.tsx, Cart.tsx, Favorites.tsx, Profile.tsx
    - admin/ — Admin pages: AdminLayout.tsx, Products.tsx, Shipments.tsx, Dashboard.tsx, Placeholders.tsx
  - components/admin/BucketChecker.tsx — checks bucket accessibility
  - components/* — many UI components and shared primitives
  - data/products.ts — local mock products used as fallback
- supabase/schema.sql — SQL for products, sessions, shipments and seeds
- server/
  - index.ts — express app building endpoints
  - routes/demo.ts — demo endpoint
- netlify/functions/api.ts — serverless export of express server
- package.json — dependencies and scripts
- client/lib/export.ts — CSV/print utilities
- docs/ (created by this diagnostic)

## 3) Navigation & screens implemented (frontend)

- Main public screens:
  - Home (Index) — featured and latest products
  - Marketplace — product listing (sourced from Supabase when configured)
  - ProductDetail — product single page
  - Favorites — user favorites (stored locally and optionally synced with Supabase sessions)
  - Cart — shopping cart (client-side state persisted to localStorage + optional Supabase session persist)
  - Profile — user profile placeholder
- Admin area (`/admin`):
  - Dashboard
  - Products — CRUD + image upload to `product-images` bucket
  - Shipments — table with filters, status updates and media upload to `shipment-docs` bucket
  - Users, Categories, Orders, Payments, Local Sellers, Integrations — placeholders

## 4) API calls and endpoints

- Internal Express endpoints (server/):
  - GET /api/ping — returns ping message
  - GET /api/demo — demo response (server/routes/demo.ts)
  - These endpoints are available when server built/exposed; Netlify function wraps the server for serverless usage.

- Supabase usage (client-side):
  - Tables used: `products`, `sessions`, `shipments` (see `supabase/schema.sql`)
  - Products queries: `supabase.from('products').select('*').order('id')` (client/hooks/useProducts.ts, admin pages)
  - Sessions: read/upsert `sessions` by session_key to persist cart/favorites (client/context/ShopContext.tsx)
  - Shipments queries: `supabase.from('shipments').select('*')` and updates/deletes in admin/Shipments.tsx
  - Storage operations: `supabase.storage.from('product-images').upload(...)` and `.getPublicUrl(...)` for product images and `shipment-docs` for shipment attachments
  - Exports: CSV export is client-side using client/lib/export.ts

- Auth & security
  - Frontend uses anon/public Supabase key (VITE_SUPABASE_ANON_KEY) via client/lib/supabase.ts — no user auth flow implemented in codebase (no sign-in UI)
  - There is no server-side proxy in place for privileged actions — current code performs CRUD directly from browser with anon key
  - No explicit RLS policies visible here — project assumes open access for anon key (development). Production must use RLS or server side endpoints with service_role key.

## 5) Supabase integration — tables and buckets referenced

- Tables (SQL in `supabase/schema.sql`):
  - products (id, name, description, price, images jsonb, status, created_at)
  - sessions (session_key PK, cart jsonb, favorites jsonb, updated_at)
  - shipments (id, order_id, status, tracking_number, warehouse, carrier, documents jsonb, photos jsonb, notes, timestamps)
- Buckets referenced in code:
  - product-images (used by admin/Products.tsx)
  - shipment-docs (used by admin/Shipments.tsx)
- Notes: The SQL file includes seeds for sample products and shipments and an ALTER TABLE to add status to products.

## 6) Current state: what is ready vs needs work

Ready / Implemented:
- Frontend UI + admin screens for Products and Shipments with basic CRUD and upload flows (client-only implementations).
- Supabase client integration is present and will work once VITE_SUPABASE_* env vars are configured (they were set in dev environment during earlier setup).
- CSV export and print utilities implemented client-side.
- Local guest sessions persistence implemented (ShopContext) + optional DB sync to sessions table.
- Express demo server and Netlify serverless wrapper present for basic API routes.

Requires work / Risk areas:
1. Security — Using Supabase anon key for all CRUD and storage operations exposes risk:
   - Anon key usually allows public reads/writes depending on policies. For production you must implement proper RLS policies or proxy sensitive operations through server endpoints using a service_role key (never shipped to the client).
2. Auth — No user authentication flows implemented (sign-in/sign-up, roles, admin authentication). Admin pages are unprotected in the current UI.
3. RLS/Policies — No evidence in repo of RLS policy setup. Without RLS, anon key can mutate data.
4. Bucket ownership & privacy — Uploads assume public buckets; if private, getPublicUrl won't work for anonymous access.
5. Scalability — Client-side CSV export and bulk operations are fine for moderate datasets but not for large-scale exports or heavy bulk updates. Server-side batch endpoints are recommended.
6. Error handling & UX — Admin actions sometimes rely on alert/confirm; replace with toasts/modal flows for better UX.
7. Testing & Type safety — Many pieces use `any` or cast; could benefit from stronger typing and tests.

## 7) Endpoints summary (where they are and what they do)

- Local serverless Express (netlify/functions/api.ts -> server/index.ts):
  - GET /api/ping
  - GET /api/demo
- Supabase endpoints are not REST endpoints in this repo — the client uses the Supabase JS client directly to perform select/insert/update/delete operations against tables and storage.

## 8) Recommendations for migrating / integrating with Laravel backend

Goal: safely move sensitive logic (bulk updates, file handling, payments) to Laravel while keeping the frontend intact.

Priority plan (phased):
1. Secure current data access
   - Create server-side endpoints (Laravel) to perform privileged operations (bulk update, delete, exports, payment webhooks). Use service_role keys or server-managed DB connection.
   - Start by implementing the following Laravel API endpoints:
     - POST /api/admin/products/bulk-update — accepts ids + status, validates admin token, performs DB update
     - POST /api/admin/products/bulk-delete — deletes
     - POST /api/admin/shipments/bulk-update
     - POST /api/admin/shipments/bulk-delete
     - POST /api/uploads — accept file multipart/form-data and store to Supabase storage (or to a Laravel-managed storage like S3), return public URL
   - These endpoints must be protected by authentication (JWT/Passport/Sanctum) and role checks.

2. Migrate storage control
   - Option A: Keep Supabase storage and call it from Laravel using service role; implement signed upload URLs so clients can upload directly with short-lived credentials.
   - Option B: Migrate to S3/Minio managed by Laravel — upload via Laravel endpoints and then store public URLs in the DB.

3. Authentication
   - Add authentication (Laravel Sanctum or Passport) for admin users. Implement sign-in UI in frontend and protect admin routes.
   - For customers, decide whether to use Supabase Auth (keep in client) or move auth to Laravel. Mixing both requires careful token translation.

4. Data migration / sync
   - Keep Supabase as a DB for now OR migrate to MySQL/Postgres in Laravel. If migrating, export tables and adapt schema (images as JSON fields, shipments, sessions).
   - Alternatively, keep Supabase as database and let Laravel use Postgres endpoint (Supabase uses Postgres) — Laravel can access the same DB directly.

5. Role-based access control & policies
   - Implement RLS policies in Supabase for public operations or move policies to Laravel and restrict client operations.

6. Large operations / exports
   - Implement server-side export (CSV/PDF generation) in Laravel to avoid client memory pressure.

7. Webhooks / external integrations
   - Move payment provider callbacks and TMAPI integrations into Laravel (more control & secrets management).

## 9) Concrete next steps for the team

- Short-term (1–2 days):
  - Run `supabase/schema.sql` in Supabase SQL editor to ensure DB tables exist and seeds are present.
  - Add README notes about required public buckets (`product-images`, `shipment-docs`) and how to create them.
  - Add a minimal admin auth guard (temporary password) to protect admin routes.
- Mid-term (1–2 weeks):
  - Implement Laravel backend endpoints for bulk actions and uploads. Use Sanctum + role checks.
  - Replace client direct Supabase write operations for sensitive admin actions with calls to Laravel endpoints.
- Long-term:
  - Fully migrate sensitive workflows (payments, shipments processing, exports) to Laravel; implement CI, tests, and monitor.

## 10) File pointers and evidence (important files to inspect)
- client/lib/supabase.ts — Supabase client init
- client/hooks/useProducts.ts — product fetching logic and fallback
- client/context/ShopContext.tsx — cart/favorites logic + sessions sync to Supabase
- client/pages/admin/Products.tsx — products admin UI, CRUD and image upload
- client/pages/admin/Shipments.tsx — shipments UI, status, uploads
- supabase/schema.sql — schema and seeds for products, sessions, shipments
- server/index.ts, server/routes/demo.ts, netlify/functions/api.ts — express server & serverless wrapper
- client/lib/export.ts — CSV/print utilities

## 11) Security notes & cautions
- Remove any exposure of service_role keys to the client. The anon key should be limited by RLS for production.
- Replace client-side admin write operations with protected server endpoints before going to production.
- Add content validation on uploads and set size limits for documents/photos.

---

If you want, I will:
- (A) produce a migration plan / API contract for Laravel endpoints (list of endpoints, payloads, auth) so backend dev can implement quickly; or
- (B) generate the initial Laravel controllers/routes/migrations for Products and Shipments (skeleton) in a separate branch.

Choose A or B and I will prepare the next artifact. 
