import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { sessionId?: string };
    const sessionId = (body.sessionId ?? "").trim().slice(0, 120);
    if (!sessionId) {
      return NextResponse.json({ ok: false, error: "Нет sessionId." }, { status: 400 });
    }

    const supabase = supabaseServer();

    const delRes = await supabase.from("user_style_votes").delete().eq("session_id", sessionId);
    if (delRes.error) {
      return NextResponse.json({ ok: false, error: delRes.error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

