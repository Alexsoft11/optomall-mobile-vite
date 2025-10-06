Step 1: Connect to Supabase (required)

- Click [Connect to Supabase](#open-mcp-popover) and manually connect your Supabase project. This is required so the app can read/write products and files.

Step 2: Create the products table

- Open the Supabase dashboard, go to SQL editor and run the SQL in supabase/schema.sql (file included in the repo).

Step 3: Create a Storage bucket (optional for images)

- In Supabase go to Storage > Create a new bucket (public). Upload product images or use external URLs.

Step 4: Set environment variables

- In your local project (or in the Builder dev server), set these env vars in a .env file or via the Builder dev environment:
  - VITE_SUPABASE_URL=your-supabase-url
  - VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

- If you want me to set them for the running dev server here, provide the values and I can set them using the DevServerControl tool.

Step 5: Install dependencies and run the dev server

- Install dependencies (pnpm is recommended, but npm/yarn also works):
  - pnpm install
  - pnpm dev

Step 6: Verify

- Open the app and check the Marketplace and Product pages. If Supabase env vars are set, the frontend will fetch from the products table. If not set, it falls back to local mock data.

Available MCP integrations you can connect (useful for this project):

- Supabase — database, auth, storage (recommended for this task)
- Neon — alternative Postgres provider
- Netlify — deployment & hosting
- Zapier — automations
- Figma — design to code (use Builder.io Figma plugin)
- Builder.io — CMS and visual content
- Linear — issue tracking
- Notion — documentation
- Sentry — error monitoring
- Context7 — docs
- Semgrep — security scanning
- Prisma Postgres — ORM and Postgres tooling

To connect any of the above, open the MCP popover: [Open MCP popover](#open-mcp-popover).

If you want, I can also:
- Generate more seed products in supabase/schema.sql (I already added 6 samples).
- Wire product image upload UI to Supabase Storage (requires storage bucket and anon or service key).
- Add product CRUD API endpoints (serverless functions or Netlify functions) to manage products.

I proceeded to:
- Add @supabase/supabase-js to package.json dependencies
- Fix client/hooks/useProducts.ts to import React hooks and fetch from Supabase
- Add supabase/schema.sql with a products table and sample seed data

Next steps I will take automatically: wire upload flow and favorites/cart persistence to Supabase if you want (I will implement client-side code and server endpoints where needed).
