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

    type Filterable = {
      eq: (column: string, value: unknown) => Filterable;
      not: (column: string, operator: string, value: unknown) => Filterable;
      overlaps: (column: string, value: unknown) => Filterable;
    };

    const applyFilters = (q: Filterable): Filterable => {
      let next = q.eq("active", true).eq("review_status", "approved").not("id", "in", votedIn ?? '("")');
      if (mode === "exploit") {
        if (exploitStyleFamilies.length > 0) next = next.overlaps("style_families", exploitStyleFamilies);
        if (exploitColors.length > 0) next = next.overlaps("color_tags", exploitColors);
        if (exploitSeasons.length > 0) next = next.overlaps("season_tags", exploitSeasons);
        if (exploitContentType && Math.random() < 0.35) next = next.eq("content_type", exploitContentType);
      }
      return next;
    };

    const countRes = await applyFilters(
      supabase.from("style_images").select("id", { count: "exact", head: true })
    );
    if (countRes.error) {
      return NextResponse.json({ ok: false, error: countRes.error.message }, { status: 500 });
    }

    const remaining = countRes.count ?? 0;
    if (remaining === 0) {
      return NextResponse.json({ ok: true, empty: true });
    }

    const idx = Math.floor(Math.random() * remaining);
    const rowRes = await applyFilters(
      supabase.from("style_images").select(
        "id,title,image_url,content_type,style_families,occasion_tags,clothing_tags,accessory_tags,color_tags,season_tags,fit_tags,vibe_tags,formality_level,notes,source_page_url,attribution"
      )
    )
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
        imageUrl: row.image_url as string,
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

