/**
 * Unsplash importer (requires UNSPLASH_ACCESS_KEY + Supabase server envs)
 *
 * Strategy:
 * - Read `data/stylist/manifest.json`
 * - For each query, fetch pages from Unsplash Search API
 * - Normalize to style_images rows with rich metadata
 * - Deduplicate by source_page_url
 * - Insert as review_status='approved' (no manual approval for MVP)
 */

import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

async function loadEnvLocalFile() {
  // Node scripts don't automatically load .env.local like Next does.
  // We load it manually so you can keep keys in one place.
  try {
    const envPath = new URL("../../.env.local", import.meta.url);
    const raw = await readFile(envPath, "utf8");
    if (!raw.trim()) return;

    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      if (!key) continue;
      // Node may already have empty strings; treat "" as missing.
      if (typeof process.env[key] === "undefined" || process.env[key] === "") process.env[key] = value;
    }
  } catch {
    // ignore: .env.local may not exist
  }
}

await loadEnvLocalFile();

const { UNSPLASH_ACCESS_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!UNSPLASH_ACCESS_KEY) throw new Error("Missing env var: UNSPLASH_ACCESS_KEY");
if (!NEXT_PUBLIC_SUPABASE_URL) throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_URL");
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing env var: SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  global: { headers: { "X-Client-Info": "love-gift/importer" } }
});

const manifest = JSON.parse(
  await readFile(new URL("../../data/stylist/manifest.json", import.meta.url), "utf8")
);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeContentType(bucketId) {
  if (bucketId === "accessories_details") return Math.random() < 0.7 ? "accessory" : "detail";
  if (bucketId === "outerwear") return Math.random() < 0.8 ? "full_look" : "detail";
  return Math.random() < 0.75 ? "full_look" : "detail";
}

function tagsFromBucket(bucketId) {
  const map = {
    smart_casual: ["smart casual"],
    relaxed_casual: ["relaxed casual"],
    minimal_clean: ["minimal", "clean"],
    date_night: ["date night", "evening"],
    weekend_walk: ["weekend", "city"],
    dad_on_the_go: ["dad-on-the-go", "comfort"],
    summer_vacation: ["summer", "vacation"],
    autumn_layering: ["autumn", "layering"],
    outerwear: ["outerwear"],
    accessories_details: ["accessories"]
  };
  return map[bucketId] ?? [];
}

function isLikelyFeminine(desc) {
  const t = String(desc ?? "").toLowerCase();
  if (!t) return false;
  // conservative keyword filter: only remove clearly female-oriented content
  if (/\b(men|man|menswear|male)\b/.test(t)) return false;
  return /\b(woman|women|female|girl|lady|ladies|womenswear|dress|skirt|heels|lingerie|bra)\b/.test(t);
}

async function existingSourceUrls(urls) {
  if (urls.length === 0) return new Set();
  const res = await supabase.from("style_images").select("source_page_url").in("source_page_url", urls);
  if (res.error) throw new Error(res.error.message);
  return new Set((res.data ?? []).map((x) => x.source_page_url).filter(Boolean));
}

async function insertRows(rows) {
  if (rows.length === 0) return;
  const res = await supabase.from("style_images").insert(rows);
  if (res.error) throw new Error(res.error.message);
}

let inserted = 0;
for (const bucket of manifest.buckets) {
  const perQuery = Math.max(10, Math.ceil(bucket.target / bucket.queries.length));
  for (const q of bucket.queries) {
    const page = 1;
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", q);
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", String(Math.min(30, perQuery)));
    url.searchParams.set("orientation", "portrait");
    // bias to "adult male style" lookbook vibes

    const resp = await fetch(url, {
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
    });

    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      throw new Error(`Unsplash error ${resp.status}: ${t}`);
    }

    const json = await resp.json();
    const results = json.results ?? [];
    const urls = results.map((r) => r.links?.html).filter(Boolean);
    const exists = await existingSourceUrls(urls);

    const rows = results
      .map((r) => {
        const sourcePageUrl = r.links?.html ?? null;
        if (!sourcePageUrl || exists.has(sourcePageUrl)) return null;
        const photographerName = r.user?.name ?? null;
        const photographerUrl = r.user?.links?.html ?? null;
        const imageUrl = r.urls?.small ?? r.urls?.regular ?? null;
        if (!imageUrl) return null;

        const title = r.description ?? r.alt_description ?? null;
        if (isLikelyFeminine(title)) return null;

        const bucketTags = tagsFromBucket(bucket.id);
        const contentType = normalizeContentType(bucket.id);

        return {
          title,
          image_url: imageUrl,
          source_type: "unsplash",
          source_page_url: sourcePageUrl,
          photographer_name: photographerName,
          license_type: "unsplash",
          attribution: {
            sourceType: "unsplash",
            photographerName,
            photographerUrl
          },
          content_type: contentType,
          gender_target: "male",
          style_families: bucketTags,
          occasion_tags: [],
          clothing_tags: [],
          accessory_tags: [],
          color_tags: [],
          season_tags: [],
          fit_tags: [],
          vibe_tags: [],
          formality_level: null,
          notes: `seed:${bucket.id}`,
          active: true,
          review_status: "approved"
        };
      })
      .filter(Boolean);

    await insertRows(rows);
    inserted += rows.length;
    console.log(`bucket=${bucket.id} q="${q}" inserted=${rows.length} total=${inserted}`);

    // gentle rate-limit
    await sleep(650);
  }
}

console.log(`Done. Inserted=${inserted}. All imported items are review_status='approved'.`);

