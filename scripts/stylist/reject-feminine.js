/**
 * Reject likely feminine cards by title keywords (conservative).
 *
 * Usage:
 *   node scripts/stylist/reject-feminine.js
 *
 * It will:
 * - find style_images where title contains female-oriented keywords
 * - set review_status='rejected'
 *
 * You can always undo manually in Supabase UI.
 */

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";

async function loadEnvLocalFile() {
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
      if (typeof process.env[key] === "undefined" || process.env[key] === "") process.env[key] = value;
    }
  } catch {
    // ignore
  }
}

await loadEnvLocalFile();

const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!NEXT_PUBLIC_SUPABASE_URL) throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_URL");
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing env var: SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  global: { headers: { "X-Client-Info": "love-gift/reject" } }
});

const keywords = [
  "woman",
  "women",
  "female",
  "girl",
  "lady",
  "ladies",
  "womenswear",
  "dress",
  "skirt",
  "heels",
  "lingerie",
  "bra"
];

let totalRejected = 0;
for (const k of keywords) {
  const res = await supabase
    .from("style_images")
    .update({ review_status: "rejected" })
    .ilike("title", `%${k}%`)
    .neq("review_status", "rejected");

  if (res.error) throw new Error(res.error.message);
  // Postgrest doesn't return count reliably without extra opts; we just log keyword hits by fetching count.
  const countRes = await supabase
    .from("style_images")
    .select("id", { count: "exact", head: true })
    .ilike("title", `%${k}%`)
    .eq("review_status", "rejected");
  if (!countRes.error) {
    // This is cumulative across keywords; use it only for visibility.
    totalRejected = Math.max(totalRejected, countRes.count ?? totalRejected);
  }
  console.log(`applied reject for keyword="${k}"`);
}

console.log(`Done. Some items were set to review_status='rejected'.`);
console.log(`Tip: in Supabase table UI, filter review_status='rejected' to review/undo if needed.`);

