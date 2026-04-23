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

    const currency = city === "astana" ? "₸" : "сум";
    const budgetRange =
      city === "astana"
        ? budget === "econom"
          ? "15 000–35 000 ₸ на двоих (без алкоголя) или 8 000–18 000 ₸ на человека"
          : budget === "medium"
            ? "35 000–80 000 ₸ на двоих или 18 000–40 000 ₸ на человека"
            : "80 000–180 000 ₸ на двоих или 40 000–90 000 ₸ на человека"
        : budget === "econom"
          ? "250 000–600 000 сум на двоих или 120 000–300 000 сум на человека"
          : budget === "medium"
            ? "600 000–1 500 000 сум на двоих или 300 000–750 000 сум на человека"
            : "1 500 000–3 500 000 сум на двоих или 750 000–1 800 000 сум на человека";

    const prompt = [
      "Сгенерируй ОДНУ идею, как отпраздновать день рождения. Язык: русский.",
      "Это должна быть реально применимая идея в выбранном городе, без фантазийных деталей.",
      "Ты не можешь проверять афишу/расписание. НЕ выдумывай конкретные события, названия заведений или даты. Вместо этого дай конкретный план и как быстро проверить/забронировать (что искать и где).",
      `Город: ${cityLabel}.`,
      `С кем: ${companyLabel}.`,
      `Длительность: ${durationLabel}.`,
      `Бюджет: ${budgetLabel}.`,
      `Настроение: ${moodLabel}.`,
      `Валюта: ${currency}.`,
      `Жёсткое ограничение по бюджету (ориентир): ${budgetRange}.`,
      "Правила реализма:",
      "- Чек должен проходить sanity-check: «красиво» не может выглядеть как дешёвый фастфуд по цене эконом.",
      "- Если что-то не укладывается — упрощай план или предлагай альтернативу, но не ломай бюджет.",
      "Сделай ответ коротким и практичным.",
      "Формат ответа строго:",
      "Заголовок: 4–7 слов",
      "Атмосфера: 1 строка",
      "Бюджет: диапазон + что включено (1 строка)",
      "План (4–5 шагов):",
      "1) …",
      "2) …",
      "…",
      "Где проверить/забронировать (3 пункта):",
      "- Яндекс Афиша / afisha.yandex.ru: запрос «…»",
      "- afisha.uz или iticket.uz: запрос «…»",
      "- Tripadvisor / Ultima / 2ГИС: запрос «…»",
      "Альтернатива (1–2 пункта):",
      "- …",
      "Без эмодзи. Без лишних вступлений."
    ].join("\n");

    const completion = await openai().chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.75,
      messages: [
        {
          role: "system",
          content:
            "Ты придумываешь одну реалистичную, применимую идею празднования дня рождения. Пиши по-русски, конкретно, без эмодзи, не выдумывай непроверяемые факты."
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

