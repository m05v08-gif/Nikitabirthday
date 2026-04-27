import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

type CompanyType = "with_children" | "with_masha" | "with_friends" | "alone";
type Budget = "econom" | "medium" | "premium";
type Mood = "fun" | "calm" | "beautiful" | "legendary";

type StoryMode =
  | "lunar_absurd"
  | "rational_scifi"
  | "epic_ritual"
  | "cosmic_irony"
  | "child_micro_adventure"
  | "cozy_toddler_chaos";


function getSpecialCaseResponse(input: {
  companyType: CompanyType;
  budget: Budget;
  mood: Mood;
}): string | null {
  const { companyType, mood } = input;
  if (companyType === "with_children" && mood === "calm") {
    return [
      "«Спокойно с детьми» — звучит как жанр фэнтези, но мы попробуем.",
      "Давай сделаем “спокойно насколько это вообще возможно”: мягкий домашний ритуал, без идеальности, с маленькой магией и смешными деталями.",
      "Если хочется, чтобы было бодрее — просто переключи настроение на «весело», и я подкину версию с приключением."
    ].join("\n\n");
  }
  return null;
}

function weightedPick<T extends string>(items: Array<{ id: T; w: number }>): T {
  const total = items.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * total;
  for (const it of items) {
    r -= it.w;
    if (r <= 0) return it.id;
  }
  return items[items.length - 1]!.id;
}

function pickStoryMode(input: { companyType: CompanyType; mood: Mood }): StoryMode {
  const { companyType, mood } = input;

  const kids = companyType === "with_children";
  const wife = companyType === "with_masha";
  const friends = companyType === "with_friends";
  const solo = companyType === "alone";

  if (kids && mood === "fun") {
    return weightedPick([
      { id: "cozy_toddler_chaos", w: 4 },
      { id: "child_micro_adventure", w: 3 },
      { id: "lunar_absurd", w: 2 }
    ]);
  }
  if (kids && mood === "beautiful") {
    return weightedPick([
      { id: "child_micro_adventure", w: 3 },
      { id: "cozy_toddler_chaos", w: 3 },
      { id: "epic_ritual", w: 1 }
    ]);
  }
  if (kids && mood === "calm") {
    return weightedPick([
      { id: "cozy_toddler_chaos", w: 4 },
      { id: "child_micro_adventure", w: 3 }
    ]);
  }
  if (friends && mood === "fun") {
    return weightedPick([
      { id: "cosmic_irony", w: 4 },
      { id: "lunar_absurd", w: 3 }
    ]);
  }
  if (friends && mood === "legendary") {
    return weightedPick([
      { id: "cosmic_irony", w: 3 },
      { id: "epic_ritual", w: 2 },
      { id: "lunar_absurd", w: 2 }
    ]);
  }
  if (friends && mood === "beautiful") {
    return weightedPick([
      { id: "epic_ritual", w: 3 },
      { id: "cosmic_irony", w: 2 }
    ]);
  }
  if (wife && mood === "beautiful") {
    return weightedPick([
      { id: "epic_ritual", w: 4 },
      { id: "rational_scifi", w: 2 },
      { id: "cosmic_irony", w: 1 }
    ]);
  }
  if (wife && mood === "calm") {
    return weightedPick([
      { id: "rational_scifi", w: 3 },
      { id: "epic_ritual", w: 2 }
    ]);
  }
  if (wife && mood === "legendary") {
    return weightedPick([
      { id: "epic_ritual", w: 3 },
      { id: "cosmic_irony", w: 2 }
    ]);
  }
  if (solo && mood === "legendary") {
    return weightedPick([
      { id: "rational_scifi", w: 2 },
      { id: "epic_ritual", w: 3 },
      { id: "cosmic_irony", w: 2 }
    ]);
  }
  if (solo && mood === "calm") {
    return "rational_scifi";
  }
  if (solo && mood === "beautiful") {
    return weightedPick([
      { id: "rational_scifi", w: 3 },
      { id: "epic_ritual", w: 2 }
    ]);
  }
  if (solo && mood === "fun") {
    return weightedPick([
      { id: "cosmic_irony", w: 3 },
      { id: "lunar_absurd", w: 2 }
    ]);
  }

  return weightedPick([
    { id: "cosmic_irony", w: 2 },
    { id: "epic_ritual", w: 2 },
    { id: "rational_scifi", w: 1 }
  ]);
}

function modeVibe(mode: StoryMode): string {
  switch (mode) {
    case "lunar_absurd":
      return "Наивный, смешной, чуть сатирический абсурд: бытовая странность и маленький хаос, но мило.";
    case "rational_scifi":
      return "Умный, собранный, чуть холодный и точный тон — и неожиданное человеческое тепло внутри.";
    case "epic_ritual":
      return "Торжественно и красиво, как маленький обряд: свечи, ткань, медленный масштаб, ощущение важности момента.";
    case "cosmic_irony":
      return "Космическая ирония: день внезапно уходит на странную траекторию, но всё равно по-доброму.";
    case "child_micro_adventure":
      return "Детское инженерное приключение: сборка, изобретение, радость процесса, гордость «мы сделали»";
    case "cozy_toddler_chaos":
      return "Домашняя детская магия: мягкий хаос, смешные детали, быт как маленький эпос.";
  }
}

function modeInspiration(mode: StoryMode): string {
  switch (mode) {
    case "lunar_absurd":
      return weightedPick([
        { id: "Н. Носов — «Незнайка на Луне»", w: 5 },
        { id: "Дуглас Адамс — «Автостопом по галактике»", w: 2 },
        { id: "Виктор Пелевин — книги", w: 2 }
      ]);
    case "rational_scifi":
      return weightedPick([
        { id: "Айзек Азимов — «Я, робот»", w: 4 },
        { id: "Айзек Азимов — «Двухсотлетний человек»", w: 3 },
        { id: "Айзек Азимов — цикл «Основание»", w: 2 },
        { id: "Айзек Азимов — «Конец Вечности»", w: 2 },
        { id: "«Звёздные войны»", w: 1 }
      ]);
    case "epic_ritual":
      return weightedPick([
        { id: "Фрэнк Герберт — «Дюна»", w: 5 },
        { id: "«Звёздные войны»", w: 2 },
        { id: "Сергей Есенин — стихи", w: 2 },
        { id: "«Пираты Карибского моря»", w: 1 }
      ]);
    case "cosmic_irony":
      return weightedPick([
        { id: "Дуглас Адамс — «Автостопом по галактике»", w: 5 },
        { id: "«Звёздные войны»", w: 2 },
        { id: "«Пираты Карибского моря»", w: 2 },
        { id: "Виктор Пелевин — книги", w: 1 }
      ]);
    case "child_micro_adventure":
      return weightedPick([
        { id: "«Чик и Брики»", w: 5 },
        { id: "Н. Носов — «Незнайка на Луне»", w: 1 },
        { id: "«Пираты Карибского моря»", w: 1 }
      ]);
    case "cozy_toddler_chaos":
      return weightedPick([
        { id: "«Чик и Брики»", w: 6 },
        { id: "Сергей Есенин — стихи", w: 1 }
      ]);
  }
}

function modePoeticInspiration(mode: StoryMode): string {
  switch (mode) {
    case "lunar_absurd":
      return weightedPick([
        { id: "городским абсурдом и внезапной логикой сковородок", w: 2 },
        { id: "маленьким хаосом и серьёзным видом, с которым его принимают", w: 2 },
        { id: "смешными правилами, которые почему-то делают вечер счастливым", w: 1 }
      ]);
    case "rational_scifi":
      return weightedPick([
        { id: "аккуратностью, в которой вдруг прячется тепло", w: 2 },
        { id: "тишиной, где мысли выстраиваются в красивый порядок", w: 2 },
        { id: "идеей, что у праздника может быть логика — и сердце", w: 1 }
      ]);
    case "epic_ritual":
      return weightedPick([
        { id: "вечерним светом, свечами и тихой торжественностью", w: 2 },
        { id: "шёпотом мечт и ощущением важного момента", w: 2 },
        { id: "тканью, песком времени и маленьким обрядом «мы здесь»", w: 1 }
      ]);
    case "cosmic_irony":
      return weightedPick([
        { id: "иронией судьбы и мягким ощущением «ну конечно»", w: 2 },
        { id: "странной траекторией дня, которая всё равно приводит к десерту", w: 2 },
        { id: "внезапным поворотом, который делает историю вашей", w: 1 }
      ]);
    case "child_micro_adventure":
      return weightedPick([
        { id: "радостью сборки и гордостью «смотри, работает!»", w: 2 },
        { id: "изобретениями из подручного и детской серьёзностью", w: 2 },
        { id: "маленькой инженерией и большим смехом", w: 1 }
      ]);
    case "cozy_toddler_chaos":
      return weightedPick([
        { id: "домашней магией и тем, как дети делают быт эпосом", w: 2 },
        { id: "мягким хаосом, который внезапно становится самым тёплым", w: 2 },
        { id: "смешными деталями — и тем, что всё равно красиво", w: 1 }
      ]);
  }
}

function pickInspirationFooter(mode: StoryMode): string {
  // exactly one line: either a poetic reason or a concrete source
  const kind = weightedPick([
    { id: "poetic", w: 3 },
    { id: "source", w: 7 }
  ]);
  if (kind === "poetic") return `Вдохновился: ${modePoeticInspiration(mode)}.`;
  return `Вдохновился: ${modeInspiration(mode)}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      companyType?: CompanyType;
      budget?: Budget;
      mood?: Mood;
    };

    const companyType = body.companyType ?? "with_friends";
    const budget = body.budget ?? "medium";
    const mood = body.mood ?? "beautiful";

    const companyLabel =
      companyType === "with_children"
        ? "с детьми"
        : companyType === "with_masha"
          ? "вдвоём с Машей"
          : companyType === "with_friends"
            ? "с друзьями"
            : "один";
    const budgetLabel =
      budget === "econom" ? "экономно" : budget === "medium" ? "средне" : "можно красиво";
    const moodLabel =
      mood === "fun"
        ? "весело"
        : mood === "calm"
          ? "спокойно"
          : mood === "beautiful"
            ? "красиво"
            : "легендарно";

    const specialCase = getSpecialCaseResponse({ companyType, budget, mood });
    if (specialCase) return NextResponse.json({ ok: true, text: specialCase });

    const mode = pickStoryMode({ companyType, mood });
    const budgetScale =
      budget === "econom"
        ? "Экономно: бытово, из подручного, без дорогих мест. Магия — в деталях."
        : budget === "medium"
          ? "Средне: можно один «special элемент» (маленький сюрприз, доставка, билет, красивый реквизит)."
          : "Можно красиво: больше ритуальности и атмосферы, эффектнее детали, но без пафоса.";

    const prompt = [
      "Придумай одну идею, как отпраздновать день рождения.",
      "",
      `Параметры:`,
      `- С кем: ${companyLabel}`,
      `- Бюджет: ${budgetLabel}`,
      `- Настроение: ${moodLabel}`,
      "",
      "Это не utilitarian-гайд «куда пойти сегодня». Это генератор шуточных, литературных, атмосферных идей — маленькое странное приключение.",
      "Пользователю НЕ говори, что внутри есть скрытые режимы и вдохновения.",
      "",
      `Внутренний скрытый literary mode (не упоминай в ответе): ${mode}.`,
      `Его вайб: ${modeVibe(mode)}`,
      budgetScale,
      "",
      "Правила:",
      "- В тексте сценария не используй прямые названия книг/авторов/персонажей/миров и не цитируй.",
      "- Не пиши строку «Вдохновился: …» — её добавит приложение.",
      "- Не пиши сухо, не пиши как ТЗ, не пиши как инструкция.",
      "- Можно лёгкий абсурд, иронию, нежность, странные бытовые детали, ощущение ритуала.",
      "- Добавь смелый странный поворот или смешное правило: пусть идея будет немного дерзкой, но не уходи в несвязную фантазию.",
      "- Длина: в 2 раза короче обычного. 1–2 очень коротких абзаца или мини-сценка.",
      "- Ограничение: 4–6 предложений (максимум 7, если очень нужно).",
      "- Лимит: до 600 символов без учёта строки «Вдохновился: …».",
      "- Не делай длинных списков и длинных перечислений через запятые.",
      "- Идея должна быть хотя бы частично реализуемой: добавь 1–2 конкретные опоры (что взять/что сделать/как быстро проверить), но не превращай в план.",
      "- Никаких «выберите/организуйте/завершите» и «весёлое времяпрепровождение».",
      "",
      "Напиши красиво, живо, по‑человечески, с вайбом приложения."
    ].join("\n");

    const completion = await openai().chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.9,
      messages: [
        {
          role: "system",
          content:
            [
              "Ты придумываешь не обычные практичные советы, а маленькие литературные сценарии для празднования дня рождения.",
              "Пиши по-русски. Тон: живой, тёплый, странноватый, красивый, местами смешной.",
              "Ты не менеджер и не помощник по планированию. Ты человек со вкусом, который превращает день рождения в маленькое приключение.",
              "Можно: лёгкий абсурд, иронию, нежность, ощущение маленького ритуала, живые бытовые детали.",
              "Нельзя: канцелярит, сухие инструкции, одинаковый шаблон, SEO-язык, формальный тон.",
              "Не добавляй строку «Вдохновился: …» — её добавит приложение.",
              "Нельзя: прямые отсылки к книгам/авторам/персонажам/цитатам; нельзя узнаваемые формулировки.",
              "Важно: идея должна быть короткой (4–6 предложений), понятной и хотя бы частично реализуемой в реальной жизни."
            ].join("\n")
        },
        { role: "user", content: prompt }
      ]
    });

    const textRaw = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!textRaw) {
      return NextResponse.json(
        { ok: false, error: "Пустой ответ от модели." },
        { status: 502 }
      );
    }

    const footer = pickInspirationFooter(mode);
    const text = `${textRaw}\n\n${footer}`;
    return NextResponse.json({ ok: true, text });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

