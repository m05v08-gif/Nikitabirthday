import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

function getSessionId(req: Request): string {
  const url = new URL(req.url);
  const v = url.searchParams.get("sessionId") ?? "";
  return v.trim().slice(0, 120);
}

export async function GET(req: Request) {
  try {
    const sessionId = getSessionId(req);
    if (!sessionId) return NextResponse.json({ ok: false, error: "Нет sessionId." }, { status: 400 });

    const supabase = supabaseServer();

    const votesRes = await supabase
      .from("user_style_votes")
      .select("image_id")
      .eq("session_id", sessionId)
      .eq("vote", "like")
      .order("created_at", { ascending: false })
      .limit(60);

    if (votesRes.error) {
      return NextResponse.json({ ok: false, error: votesRes.error.message }, { status: 500 });
    }

    const ids = (votesRes.data ?? []).map((x) => x.image_id).filter(Boolean);
    if (ids.length === 0) return NextResponse.json({ ok: true, cards: [] });

    const cardsRes = await supabase
      .from("style_images")
      .select("id,image_url,content_type")
      .eq("active", true)
      .eq("review_status", "approved")
      .in("id", ids)
      .limit(60);

    if (cardsRes.error) {
      return NextResponse.json({ ok: false, error: cardsRes.error.message }, { status: 500 });
    }

    const map = new Map((cardsRes.data ?? []).map((c) => [c.id, c]));
    const ordered = ids
      .map((id) => map.get(id))
      .filter(Boolean)
      .map((c) => ({
        id: c!.id as string,
        imageUrl: c!.image_url as string,
        contentType: c!.content_type as string
      }));

    return NextResponse.json({ ok: true, cards: ordered });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

