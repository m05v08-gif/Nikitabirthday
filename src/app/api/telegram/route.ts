import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { env } from "@/lib/env";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

function telegramApiUrl(method: string) {
  if (!env.TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set");
  }
  return `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`;
}

async function telegramSendMessage(chatId: number, text: string) {
  await fetch(telegramApiUrl("sendMessage"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true
    })
  });
}

async function telegramGetFile(fileId: string): Promise<{ file_path: string }> {
  const res = await fetch(telegramApiUrl("getFile"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ file_id: fileId })
  });
  const json = (await res.json()) as {
    ok: boolean;
    result?: { file_path: string };
    description?: string;
  };
  if (!json.ok || !json.result?.file_path) {
    throw new Error(json.description ?? "getFile failed");
  }
  return { file_path: json.result.file_path };
}

async function telegramDownloadFile(filePath: string): Promise<Uint8Array> {
  if (!env.TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set");
  }
  const url = `https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${filePath}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`download failed: ${res.status}`);
  }
  const buf = new Uint8Array(await res.arrayBuffer());
  return buf;
}

export async function POST(req: Request) {
  try {
    if (!env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ ok: false, error: "TELEGRAM_BOT_TOKEN missing" }, { status: 501 });
    }

    const secret = req.headers.get("x-telegram-bot-api-secret-token") ?? "";
    if (!env.TELEGRAM_WEBHOOK_SECRET || secret !== env.TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const update = (await req.json()) as {
      update_id?: number;
      message?: {
        message_id: number;
        chat: { id: number };
        text?: string;
        caption?: string;
        photo?: Array<{ file_id: string; width: number; height: number }>;
      };
    };

    const msg = update.message;
    if (!msg) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const rawText = (msg.text ?? "").trim();
    const isStart =
      rawText === "/start" ||
      rawText.startsWith("/start ");

    if (isStart) {
      await telegramSendMessage(
        msg.chat.id,
        [
          "Привет! Это бот для дня рождения Никиты.",
          "",
          "Сюда можно отправлять фотографии с текстом.",
          "Это могут быть смешные истории, поздравления или вообще всё, что душе угодно.",
          "",
          "Никите я сделала приложение — оно будет рандомно показывать сообщения из этого бота.",
          "",
          "Как отправить: прикрепи фото и добавь подпись к фото — подпись станет текстом истории."
        ].join("\n")
      );
      return NextResponse.json({ ok: true });
    }

    if (!msg.photo?.length) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const caption = (msg.caption ?? "").trim();
    if (!caption) {
      await telegramSendMessage(
        msg.chat.id,
        "Нужна подпись к фото — это текст истории. Отправь фото ещё раз с подписью."
      );
      return NextResponse.json({ ok: true });
    }

    const best = msg.photo.reduce((a, b) => (b.width * b.height > a.width * a.height ? b : a));
    const file = await telegramGetFile(best.file_id);
    const bytes = await telegramDownloadFile(file.file_path);

    const ext = file.file_path.split(".").pop()?.toLowerCase();
    const contentType =
      ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : ext === "gif"
            ? "image/gif"
            : "image/jpeg";

    const supabase = supabaseServer();
    const objectPath = `telegram/${msg.message_id}-${randomUUID()}.${ext ?? "jpg"}`;

    const upload = await supabase.storage.from("stories").upload(objectPath, bytes, {
      contentType,
      upsert: true
    });

    if (upload.error) {
      await telegramSendMessage(msg.chat.id, `Не смогла сохранить фото: ${upload.error.message}`);
      return NextResponse.json({ ok: false, error: upload.error.message }, { status: 500 });
    }

    const insert = await supabase.from("stories").insert({
      text: caption,
      image_path: objectPath
    });

    if (insert.error) {
      await telegramSendMessage(msg.chat.id, `Не смогла сохранить историю: ${insert.error.message}`);
      return NextResponse.json({ ok: false, error: insert.error.message }, { status: 500 });
    }

    await telegramSendMessage(msg.chat.id, "Сохранила историю.");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
