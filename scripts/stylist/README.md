## Stylist seed pipeline (Pexels / Unsplash)

This project intentionally does **not** scrape Pinterest or use unlicensed images.

### 1) Create tables

Run `docs/stylist-schema.sql` in Supabase SQL editor.

### 2) Provide API keys (optional but recommended)

Set env vars locally (or in CI) before running scripts:

- `UNSPLASH_ACCESS_KEY`
- `PEXELS_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3) Generate a manifest (no keys needed)

This creates a curated list of search queries + target counts per bucket.

### 4) Import (requires keys)

The importer will:
- call the provider API
- normalize metadata into `style_images`
- set `review_status = 'approved'`
- dedupe by `source_page_url`

### 5) Review (optional)

At the moment the importer marks items as `approved` for MVP.
You can still use Supabase UI to reject obviously bad images if you want.

The app only serves `approved`.

### 6) Approve pending items (if you imported earlier)

If you already imported cards that are stuck as `review_status='pending'`, run:

```bash
node scripts/stylist/approve-pending.js
```

