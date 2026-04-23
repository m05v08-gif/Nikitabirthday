import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      city?: "astana" | "tashkent";
      companyType?: "with_children" | "with_masha" | "with_friends" | "alone";
      duration?: "1_2_hours" | "2_3_hours";
      budget?: "econom" | "medium" | "premium";
      mood?: "fun" | "calm" | "beautiful" | "legendary" | "surprise";
    };

    const city = body.city ?? "astana";
    const companyType = body.companyType ?? "with_friends";
    const duration = body.duration ?? "1_2_hours";
    const budget = body.budget ?? "medium";
    const mood = body.mood ?? "beautiful";

    const cityLabel = city === "astana" ? "Астана" : "Ташкент";
    const companyLabel =
      companyType === "with_children"
        ? "с детьми"
        : companyType === "with_masha"
          ? "вдвоём с Машей"
          : companyType === "with_friends"
            ? "с друзьями"
            : "один";
    const durationLabel = duration === "1_2_hours" ? "1–2 часа" : "2–3 часа";
    const budgetLabel =
      budget === "econom" ? "экономно" : budget === "medium" ? "средне" : "можно красиво";
    const moodLabel =
      mood === "fun"
        ? "весело"
        : mood === "calm"
          ? "спокойно"
          : mood === "beautiful"
            ? "красиво"
            : mood === "legendary"
              ? "легендарно"
              : "удиви меня";

    const prompt = [
      "Сгенерируй 3 короткие идеи, как отпраздновать день рождения. Язык: русский.",
      "Формат: нумерованный список 1-3. Каждая идея 1-2 предложения, конкретные шаги, без воды.",
      "Идеи должны быть реалистичными и соответствовать выбранным условиям.",
      `Город: ${cityLabel}.`,
      `С кем: ${companyLabel}.`,
      `Длительность: ${durationLabel}.`,
      `Бюджет: ${budgetLabel}.`,
      `Настроение: ${moodLabel}.`,
      "Если выбрано «Удиви меня», предложи разные по характеру идеи (но всё равно в заданном городе/бюджете/времени/формате).",
      "Не используй эмодзи."
    ].join("\n");

    const completion = await openai().chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.9,
      messages: [
        {
          role: "system",
          content:
            "Ты придумываешь короткие, конкретные идеи празднования дня рождения. Пиши по-русски, без воды, без эмодзи."
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

