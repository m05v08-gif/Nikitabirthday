/**
 * Approve all pending stylist cards in Supabase.
 *
 * Usage:
 *   node scripts/stylist/approve-pending.js
 *
 * It will:
 * - count how many style_images have review_status='pending'
 * - set review_status='approved' for them
 * - print before/after counts
 */

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";

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
  global: { headers: { "X-Client-Info": "love-gift/approve" } }
});

const before = await supabase
  .from("style_images")
  .select("id", { count: "exact", head: true })
  .eq("review_status", "pending");

if (before.error) throw new Error(before.error.message);

const pendingCount = before.count ?? 0;
console.log(`Pending before: ${pendingCount}`);

if (pendingCount > 0) {
  const updateRes = await supabase
    .from("style_images")
    .update({ review_status: "approved", active: true })
    .eq("review_status", "pending");

  if (updateRes.error) throw new Error(updateRes.error.message);
}

const after = await supabase
  .from("style_images")
  .select("id", { count: "exact", head: true })
  .eq("review_status", "pending");

if (after.error) throw new Error(after.error.message);

console.log(`Pending after: ${after.count ?? 0}`);

