import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

type StoryRow = { id: string; text: string; image_path: string };

function parseExcludeIds(req: Request): string[] {
  const url = new URL(req.url);
  const raw = url.searchParams.get("exclude") ?? "";
  if (!raw) return [];
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  // story ids in this project are UUID-like strings
  const safe = parts.filter((id) => /^[0-9a-fA-F-]{16,}$/.test(id));
  return Array.from(new Set(safe)).slice(0, 200);
}

function coerceStoryRow(row: unknown): StoryRow | null {
  if (!row || typeof row !== "object") return null;
  const r = row as { id?: unknown; text?: unknown; image_path?: unknown };
  if (typeof r.id !== "string" || typeof r.text !== "string" || typeof r.image_path !== "string") {
    return null;
  }
  return { id: r.id, text: r.text, image_path: r.image_path };
}

export async function GET(req: Request) {
  try {
    const supabase = supabaseServer();

    const excludeIds = parseExcludeIds(req);
    const inList =
      excludeIds.length > 0 ? `(${excludeIds.map((id) => `"${id}"`).join(",")})` : null;

    const countRes = await supabase
      .from("stories")
      .select("id", { count: "exact", head: true })
      .not("id", "in", inList ?? '("")');

    if (countRes.error) {
      return NextResponse.json({ ok: false, error: countRes.error.message }, { status: 500 });
    }

    const remaining = countRes.count ?? 0;
    if (remaining === 0) {
      return NextResponse.json({ ok: true, done: true });
    }

    const idx = Math.floor(Math.random() * remaining);

    const storyRes = await supabase
      .from("stories")
      .select("id,text,image_path,created_at")
      .not("id", "in", inList ?? '("")')
      .order("created_at", { ascending: false })
      .range(idx, idx)
      .limit(1);

    if (storyRes.error) {
      return NextResponse.json({ ok: false, error: storyRes.error.message }, { status: 500 });
    }

    const story = coerceStoryRow(storyRes.data?.[0]);

    if (!story) {
      return NextResponse.json({ ok: false, error: "Не нашла историю." }, { status: 404 });
    }

    const { data: publicUrl } = supabase.storage
      .from("stories")
      .getPublicUrl(story.image_path);

    return NextResponse.json({
      ok: true,
      story: {
        id: story.id,
        text: story.text,
        imageUrl: publicUrl.publicUrl
      }
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

