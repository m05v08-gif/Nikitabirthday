import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

type City = "astana" | "tashkent";
type CompanyType = "with_children" | "with_masha" | "with_friends" | "alone";
type Duration = "1_2_hours" | "2_3_hours";
type Budget = "econom" | "medium" | "premium";
type Mood = "fun" | "calm" | "beautiful" | "legendary" | "surprise";

type PromptFamily = "romantic" | "friends" | "solo" | "family";

function getPromptFamily(companyType: CompanyType): PromptFamily {
  if (companyType === "with_masha") return "romantic";
  if (companyType === "with_friends") return "friends";
  if (companyType === "alone") return "solo";
  return "family";
}

function getSpecialCaseResponse(input: {
  city: City;
  companyType: CompanyType;
  duration: Duration;
  budget: Budget;
  mood: Mood;
}): string | null {
  const { city, companyType, duration, budget, mood } = input;
  const cityLabel = city === "astana" ? "Астана" : "Ташкент";
  const currency = city === "astana" ? "₸" : "сум";

  // A) with_children + calm → don't call LLM, gently nudge
  if (companyType === "with_children" && mood === "calm") {
    return [
      "Ну «спокойно с детьми» — запрос, конечно, смелый.",
      "",
      "Давай честно: либо делаем «спокойно настолько, насколько это вообще возможно», либо переключаемся на «весело» или «красиво».",
      "",
      "Выбери другой вайб — и я соберу идею."
    ].join("\n");
  }

  // B) astana + (children | masha) → don't call LLM, ask for travel context
  if (city === "astana" && (companyType === "with_children" || companyType === "with_masha")) {
    const who = companyType === "with_children" ? "детей" : "Машу";
    return [
      `Ну Астана — это уже не просто «куда сходить», это сначала вопрос: как ${who} туда красиво и без нервов доставить.`,
      "",
      "Покажи билеты или хотя бы даты поездки — и потом я уже подберу, что там делать."
    ].join("\n");
  }

  // playful, but practical, non-toxic
  if (mood === "surprise" && duration === "1_2_hours" && budget === "econom") {
    return [
      "Хочешь «удиви меня» на пару часов и экономно — тогда давай сделаем секретный мини‑праздник без подготовки «на сутки».",
      `По деньгам держим ${currency} в рамках «эконом»: доставка/десерт + мелочь на свечи и бумажку для маленького квеста.`,
      "Фишка: пока едет еда, ты пишешь 5–6 коротких вопросов (по одной строке) и прячешь их по дому. Потом — свеча, фото, чай/кофе и финал, который почему-то всегда работает: 2–3 коротких голосовых от близких по очереди.",
      `Если нужно собрать быстро: открой карты в ${cityLabel} и ищи «кондитерская доставка»/«доставка еды», а в сообщении просто попроси свечу и приборы. Если доставка долго — ближайший магазин + готовый десерт, всё равно будет уютно.`
    ].join("\n\n");
  }

  if (companyType === "with_children" && duration === "1_2_hours" && mood === "fun") {
    return [
      "С детьми и «весело» на 1–2 часа лучше всего заходит формат «все заняты и смеются» — домашняя мини‑олимпиада.",
      `По бюджету это легко держится в рамках ${currency}: снэки + наклейки/маленькие призы (или вообще «медали» из бумаги — детям всё равно будет вау).`,
      "Собери 4 испытания за 10 минут (самолётики, попадание в корзину, танец 30 секунд, мини‑квиз), раздай роли “ведущий/судья/фотограф” — и ты уже в сюжете. В финале — свеча на десерте и награды, как на настоящем чемпионате.",
      "Если не хочется готовить: спасает доставка + один смешной «финальный раунд» — и всё, праздник случился."
    ].join("\n\n");
  }

  if (budget === "premium" && mood === "beautiful" && duration === "2_3_hours") {
    return [
      "Если хочется «красиво» и у тебя 2–3 часа, я бы делала вечер без суеты: чуть прогулки, чуть света — и вкусный финал.",
      `По деньгам «можно красиво» (${currency}) обычно укладывается в такси/трансфер + ужин/десерт + маленький сюрприз «в карман».`,
      `Самый простой способ собрать это в ${cityLabel}: открыть карты, выбрать район, найти 2–3 места по запросу «тихо / уютно / десерт» и просто написать/позвонить: “есть ли столик, хочется спокойно и красиво”. Если мест нет — делай десерт‑маршрут или красивую доставку домой, вайб останется.`,
      "Если не сложится — оставь прогулку и сделай финал дома: музыка, свеча и что-то очень вкусное без спешки."
    ].join("\n\n");
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      city?: City;
      companyType?: CompanyType;
      duration?: Duration;
      budget?: Budget;
      mood?: Mood;
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

    const specialCase = getSpecialCaseResponse({ city, companyType, duration, budget, mood });
    if (specialCase) return NextResponse.json({ ok: true, text: specialCase });

    const family = getPromptFamily(companyType);
    const familyTone =
      family === "romantic"
        ? [
            "Тон для «вдвоём с Машей»: нежнее, камернее, больше заботы и красивых деталей.",
            "Можно лёгкую романтику, но без приторности."
          ].join("\n")
        : family === "friends"
          ? [
              "Тон для «с друзьями»: живее, веселее, больше ощущения «собрали себе историю».",
              "Можно одну шутку, но не превращай в стендап."
            ].join("\n")
          : family === "solo"
            ? [
                "Тон для «один»: как будто друг говорит «ну раз один — давай сделаем это красиво».",
                "Без жалости и без пафоса — как маленький подарок себе."
              ].join("\n")
            : [
                "Тон для «с детьми»: тепло, по-человечески, без идеальной картинки.",
                "Можно лёгкую самоиронию, но без цинизма."
              ].join("\n");

    const moodModifier =
      mood === "fun"
        ? "Модификатор «весело»: больше движения, игры и лёгкого хаоса как части веселья."
        : mood === "beautiful"
          ? "Модификатор «красиво»: больше эстетики, света и деталей, которые хочется запомнить."
          : mood === "legendary"
            ? "Модификатор «легендарно»: смелее, чуть более extravagant, ощущение «ну да, это уже праздник»."
            : "Модификатор «спокойно»: тише, камернее, без перегруза.";

    const soloLegendaryOverride =
      companyType === "alone" && mood === "legendary"
        ? "Отдельное правило: «один + легендарно» — пусть звучит ярко и смело, как вечер без компромиссов. Не стесняйся советовать побаловать себя."
        : "";

    const prompt = [
      "Сгенерируй ОДНУ идею празднования дня рождения. Язык: русский.",
      "Пиши как совет друга с хорошим вкусом: живо, тепло, по‑человечески. Без лейблов «Заголовок/Атмосфера/Бюджет».",
      "Это одна идея‑сценарий (не инструкция и не план). Оставь место для фантазии, но держи опоры: как это выглядит и что реально сделать.",
      "Можно 1 лёгкую шутку/самоиронию и пару бытовых деталей (свеча, плейлист, маленький ритуал).",
      "Нельзя писать как менеджер, гид, SEO или ТЗ. Не используй формулировки: «выберите», «организуйте», «завершите».",
      familyTone,
      moodModifier,
      soloLegendaryOverride,
      "",
      "Реализм и ограничения (строго):",
      "- Ты не можешь проверять афишу/расписание. НЕ выдумывай конкретные события, даты, названия заведений/мест или «точные цены».",
      "- Если нужен ресторан/место/услуга — объясни, что искать и как быстро проверить/забронировать (карты, звонок, WhatsApp, доставка).",
      "- Избегай шаблонов типа «ужин на крыше / ресторан с видом / особенное пространство» — только если у тебя есть простой, применимый план без фантазий.",
      "",
      `Город: ${cityLabel}.`,
      `С кем: ${companyLabel}.`,
      `Длительность: ${durationLabel}.`,
      `Бюджет: ${budgetLabel}.`,
      `Настроение: ${moodLabel}.`,
      `Валюта: ${currency}.`,
      `Ориентир по бюджету (sanity-check): ${budgetRange}.`,
      "",
      "Формат ответа:",
      "- 1–2 абзаца свободным текстом, 5–9 предложений.",
      "- Упомяни вайб/атмосферу, и бюджет мягко (без таблиц и без занудства).",
      "- Дай 1–2 конкретные подсказки «что искать/как проверить» (карты/звонок/WhatsApp/доставка).",
      "- Закончить одной короткой строкой: «Если не сложится — ...».",
      "Без эмодзи."
    ].join("\n");

    const completion = await openai().chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content:
            [
              "Ты не помощник по планированию и не менеджер.",
              "Ты — друг с хорошим вкусом, который помогает придумать, как отпраздновать день рождения так, чтобы было и реально, и с вайбом.",
              "Пиши по-русски. Тон: живой, человечный, тёплый.",
              "Можно: лёгкий юмор/самоиронию, романтику (если подходит), маленькие бытовые детали.",
              "Нельзя: сухой канцелярит, «инструкции», штампы, SEO-формулировки.",
              "Нельзя выдумывать конкретные события, даты и названия мест (если не уверен).",
              "Нужно советовать так, чтобы хотелось это сделать."
            ].join("\n")
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

