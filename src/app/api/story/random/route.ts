import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = supabaseServer();

    const rpc = await supabase.rpc("get_random_story");

    let story: { id: string; text: string; image_path: string } | null = null;

    if (!rpc.error && rpc.data) {
      const row = Array.isArray(rpc.data) ? rpc.data[0] : rpc.data;
      story = row as { id: string; text: string; image_path: string };
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

      story = (storyRes.data?.[0] ?? null) as typeof story;
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

