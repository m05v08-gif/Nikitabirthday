import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      mode?: "home" | "out";
      duration?: "short" | "medium";
      budget?: "zero" | "small";
    };

    const mode = body.mode ?? "home";
    const duration = body.duration ?? "short";
    const budget = body.budget ?? "small";

    const prompt = [
      "Сгенерируй 3 короткие идеи на вечер для пары. Язык: русский.",
      "Формат: нумерованный список 1-3, каждая идея 1-2 предложения, конкретные шаги, без воды.",
      `Условия: ${mode === "home" ? "дома" : "вне дома"}, ${
        duration === "short" ? "30–60 минут" : "2–3 часа"
      }, бюджет: ${budget === "zero" ? "0" : "небольшой"}.`,
      "Не используй эмодзи."
    ].join("\n");

    const completion = await openai().chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.9,
      messages: [
        {
          role: "system",
          content:
            "Ты помогаешь паре придумывать короткие, конкретные идеи на вечер. Пиши по-русски, без воды, без эмодзи."
        },
        { role: "user", content: prompt }
      ]
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!text) {
      return NextResponse.json(
        { ok: false, error: "Пустой ответ от модели." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, text });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

