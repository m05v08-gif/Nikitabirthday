import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

type StoryRow = { id: string; text: string; image_path: string };

function coerceStoryRow(row: unknown): StoryRow | null {
  if (!row || typeof row !== "object") return null;
  const r = row as { id?: unknown; text?: unknown; image_path?: unknown };
  if (typeof r.id !== "string" || typeof r.text !== "string" || typeof r.image_path !== "string") {
    return null;
  }
  return { id: r.id, text: r.text, image_path: r.image_path };
}

export async function GET() {
  try {
    const supabase = supabaseServer();

    const rpc = await supabase.rpc("get_random_story");

    let story: StoryRow | null = null;

    if (!rpc.error && rpc.data) {
      const row = Array.isArray(rpc.data) ? rpc.data[0] : rpc.data;
      story = coerceStoryRow(row);
    } else {
      const countRes = await supabase
        .from("stories")
        .select("id", { count: "exact", head: true });

      if (countRes.error) {
        return NextResponse.json(
          { ok: false, error: countRes.error.message },
          { status: 500 }
        );
      }

      const count = countRes.count ?? 0;
      if (count === 0) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Историй пока нет. Добавь первую через Telegram-бота. Если истории есть, но random не работает — создай SQL-функцию get_random_story() из README."
          },
          { status: 404 }
        );
      }

      const idx = Math.floor(Math.random() * count);

      const storyRes = await supabase
        .from("stories")
        .select("id,text,image_path,created_at")
        .order("created_at", { ascending: false })
        .range(idx, idx)
        .limit(1);

      if (storyRes.error) {
        return NextResponse.json(
          { ok: false, error: storyRes.error.message },
          { status: 500 }
        );
      }

      story = coerceStoryRow(storyRes.data?.[0]);
    }

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

