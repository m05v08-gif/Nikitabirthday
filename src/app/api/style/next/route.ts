import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

function getSessionId(req: Request): string {
  const url = new URL(req.url);
  const v = url.searchParams.get("sessionId") ?? "";
  return v.trim().slice(0, 120);
}

function weightedPick<T extends string>(items: Array<{ id: T; w: number }>): T {
  const total = items.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * total;
  for (const it of items) {
    r -= it.w;
    if (r <= 0) return it.id;
  }
  return items[items.length - 1]!.id;
}

function toInList(ids: string[]): string | null {
  if (ids.length === 0) return null;
  // id is UUID, safe quote
  return `(${ids.map((id) => `"${id}"`).join(",")})`;
}

function toFastImageUrl(input: { imageUrl: string; sourceType?: unknown }): string {
  const url = input.imageUrl;
  const sourceType = typeof input.sourceType === "string" ? input.sourceType : "";
  // Unsplash images can be safely requested at smaller widths via query params.
  if (sourceType === "unsplash" || url.includes("images.unsplash.com")) {
    try {
      const u = new URL(url);
      if (!u.searchParams.has("auto")) u.searchParams.set("auto", "format");
      if (!u.searchParams.has("fit")) u.searchParams.set("fit", "max");
      if (!u.searchParams.has("w")) u.searchParams.set("w", "900");
      if (!u.searchParams.has("q")) u.searchParams.set("q", "75");
      return u.toString();
    } catch {
      return url;
    }
  }
  return url;
}

export async function GET(req: Request) {
  try {
    const sessionId = getSessionId(req);
    if (!sessionId) return NextResponse.json({ ok: false, error: "Нет sessionId." }, { status: 400 });

    const supabase = supabaseServer();

    const votesRes = await supabase
      .from("user_style_votes")
      .select("image_id,vote")
      .eq("session_id", sessionId)
      .limit(2000);

    if (votesRes.error) {
      return NextResponse.json({ ok: false, error: votesRes.error.message }, { status: 500 });
    }

    const votedIds = (votesRes.data ?? []).map((v) => v.image_id).filter(Boolean) as string[];
    const likedIds = (votesRes.data ?? [])
      .filter((v) => v.vote === "like")
      .map((v) => v.image_id)
      .filter(Boolean) as string[];

    const mode = weightedPick([
      { id: "exploit" as const, w: likedIds.length > 0 ? 7 : 0 },
      { id: "explore" as const, w: 3 }
    ]);

    const votedIn = toInList(votedIds);

    let exploitStyleFamilies: string[] = [];
    let exploitColors: string[] = [];
    let exploitSeasons: string[] = [];
    let exploitContentType: string | null = null;

    if (mode === "exploit" && likedIds.length > 0) {
      const pickLike = likedIds[Math.floor(Math.random() * likedIds.length)]!;
      const likedRes = await supabase
        .from("style_images")
        .select("style_families,occasion_tags,color_tags,season_tags,content_type")
        .eq("id", pickLike)
        .maybeSingle();

      if (!likedRes.error && likedRes.data) {
        exploitStyleFamilies = ((likedRes.data.style_families ?? []) as string[]).slice(0, 3);
        exploitColors = ((likedRes.data.color_tags ?? []) as string[]).slice(0, 2);
        exploitSeasons = ((likedRes.data.season_tags ?? []) as string[]).slice(0, 1);
        exploitContentType = (likedRes.data.content_type as string | null) ?? null;
      }
    }

    // Count remaining (apply the same filters as the row query)
    let countQuery = supabase
      .from("style_images")
      .select("id", { count: "exact", head: true })
      .eq("active", true)
      .eq("review_status", "approved")
      .not("id", "in", votedIn ?? '("")');

    if (mode === "exploit") {
      if (exploitStyleFamilies.length > 0) countQuery = countQuery.overlaps("style_families", exploitStyleFamilies);
      if (exploitColors.length > 0) countQuery = countQuery.overlaps("color_tags", exploitColors);
      if (exploitSeasons.length > 0) countQuery = countQuery.overlaps("season_tags", exploitSeasons);
      if (exploitContentType && Math.random() < 0.35) countQuery = countQuery.eq("content_type", exploitContentType);
    }

    const countRes = await countQuery;
    if (countRes.error) {
      return NextResponse.json({ ok: false, error: countRes.error.message }, { status: 500 });
    }

    const remaining = countRes.count ?? 0;
    if (remaining === 0) {
      return NextResponse.json({ ok: true, empty: true });
    }

    const idx = Math.floor(Math.random() * remaining);
    let rowQuery = supabase
      .from("style_images")
      .select(
        "id,title,image_url,source_type,content_type,style_families,occasion_tags,clothing_tags,accessory_tags,color_tags,season_tags,fit_tags,vibe_tags,formality_level,notes,source_page_url,attribution"
      )
      .eq("active", true)
      .eq("review_status", "approved")
      .not("id", "in", votedIn ?? '("")');

    if (mode === "exploit") {
      if (exploitStyleFamilies.length > 0) rowQuery = rowQuery.overlaps("style_families", exploitStyleFamilies);
      if (exploitColors.length > 0) rowQuery = rowQuery.overlaps("color_tags", exploitColors);
      if (exploitSeasons.length > 0) rowQuery = rowQuery.overlaps("season_tags", exploitSeasons);
      if (exploitContentType && Math.random() < 0.35) rowQuery = rowQuery.eq("content_type", exploitContentType);
    }

    const rowRes = await rowQuery
      .order("created_at", { ascending: false })
      .range(idx, idx)
      .limit(1);
    if (rowRes.error) {
      return NextResponse.json({ ok: false, error: rowRes.error.message }, { status: 500 });
    }

    const row = rowRes.data?.[0];
    if (!row) return NextResponse.json({ ok: false, error: "Пусто." }, { status: 404 });

    return NextResponse.json({
      ok: true,
      card: {
        id: row.id as string,
        title: (row.title as string | null) ?? null,
        imageUrl: toFastImageUrl({ imageUrl: row.image_url as string, sourceType: row.source_type }),
        contentType: row.content_type as
          | "full_look"
          | "detail"
          | "accessory"
          | "single_item",
        styleFamilies: (row.style_families ?? []) as string[],
        occasionTags: (row.occasion_tags ?? []) as string[],
        clothingTags: (row.clothing_tags ?? []) as string[],
        accessoryTags: (row.accessory_tags ?? []) as string[],
        colorTags: (row.color_tags ?? []) as string[],
        seasonTags: (row.season_tags ?? []) as string[],
        fitTags: (row.fit_tags ?? []) as string[],
        vibeTags: (row.vibe_tags ?? []) as string[],
        formalityLevel: (row.formality_level as number | null) ?? null,
        notes: (row.notes as string | null) ?? null,
        sourcePageUrl: (row.source_page_url as string | null) ?? null,
        attribution: (row.attribution as Record<string, unknown> | null) ?? null
      }
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

