import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

type Vote = "like" | "dislike";

function isVote(v: unknown): v is Vote {
  return v === "like" || v === "dislike";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      sessionId?: string;
      imageId?: string;
      vote?: Vote;
    };

    const sessionId = (body.sessionId ?? "").trim().slice(0, 120);
    const imageId = (body.imageId ?? "").trim();
    const vote = body.vote;

    if (!sessionId) return NextResponse.json({ ok: false, error: "Нет sessionId." }, { status: 400 });
    if (!imageId) return NextResponse.json({ ok: false, error: "Нет imageId." }, { status: 400 });
    if (!isVote(vote)) return NextResponse.json({ ok: false, error: "Неверный vote." }, { status: 400 });

    const supabase = supabaseServer();

    const upsertRes = await supabase
      .from("user_style_votes")
      .upsert(
        { session_id: sessionId, image_id: imageId, vote },
        { onConflict: "session_id,image_id" }
      )
      .select("id")
      .limit(1);

    if (upsertRes.error) {
      return NextResponse.json({ ok: false, error: upsertRes.error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

