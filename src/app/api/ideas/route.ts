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
      "Сгенерируй ОДНУ идею, как отпраздновать день рождения. Язык: русский.",
      "Это должна быть реально применимая идея в выбранном городе, без фантазийных деталей.",
      "Ты не можешь проверять афишу/расписание и не должен придумывать конкретные события, названия заведений или даты, если не уверен. Вместо этого предлагай реалистичные варианты и как быстро проверить/забронировать (что искать).",
      `Город: ${cityLabel}.`,
      `С кем: ${companyLabel}.`,
      `Длительность: ${durationLabel}.`,
      `Бюджет: ${budgetLabel}.`,
      `Настроение: ${moodLabel}.`,
      "Требования к содержанию:",
      "- Атмосфера (1 строка): как это будет ощущаться.",
      "- Примерный бюджет: диапазон в местной валюте (₸ для Астаны, сум для Ташкента) + что в него входит.",
      "- Понятный план: 5–7 шагов по времени (таймлайн) с длительностями.",
      "- 2 альтернативы на случай, если что-то не получится (например: дождь/нет мест/закрыто).",
      "- Если выбрано «Удиви меня», сделай идею с неожиданным поворотом внутри тех же условий (не нарушая бюджет/время).",
      "Формат ответа строго:",
      "Заголовок: ...",
      "Атмосфера: ...",
      "Бюджет: ...",
      "План:",
      "1) ...",
      "2) ...",
      "…",
      "Альтернативы:",
      "- ...",
      "- ...",
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

