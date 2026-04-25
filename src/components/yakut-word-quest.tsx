"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type YakutWordItem = {
  word: string;
  correct: string;
  options: [string, string, string, string];
  note: string;
};

// NOTE: This is a playful mini-quest, not an academic dictionary.
// If any translation feels off, please verify with a reliable source / native speaker.
const yakutWords: YakutWordItem[] = [
  {
    word: "дьол",
    correct: "счастье",
    options: ["счастье", "снег", "молоко", "дорога"],
    note: "Дьол — это счастье, удача и хорошая судьба."
  },
  {
    word: "ба5а",
    correct: "лягушка",
    options: ["лягушка", "рыбка", "птица", "собака"],
    note: "Ба5а — лягушка. Слово, которое сразу рисует картинку."
  },
  {
    word: "куобах",
    correct: "зайчик",
    options: ["зайчик", "лиса", "медведь", "котёнок"],
    note: "Куобах — зайчик. Мягко звучит — мягко выглядит."
  },
  {
    word: "күн",
    correct: "солнце",
    options: ["луна", "солнце", "огонь", "звезда"],
    note: "Күн — солнце. Очень подходящее слово для тёплого человека."
  },
  {
    word: "уот",
    correct: "огонь",
    options: ["ветер", "огонь", "вода", "камень"],
    note: "Уот — огонь. Про тепло, свет и внутреннюю силу."
  },
  {
    word: "астык",
    correct: "здорово",
    options: ["здорово", "грустно", "тихо", "быстро"],
    note: "Астык — «здорово». Коротко и по делу."
  },
  {
    word: "сүрэх",
    correct: "сердце",
    options: ["сердце", "дом", "голос", "песня"],
    note: "Сүрэх — сердце. Тут всё понятно без перевода."
  },
  {
    word: "дьиэ",
    correct: "дом",
    options: ["дом", "лес", "река", "дорога"],
    note: "Дьиэ — дом. Место, где тепло и свои."
  },
  {
    word: "суол",
    correct: "дорога",
    options: ["дорога", "небо", "снег", "подарок"],
    note: "Суол — дорога. Иногда самая красивая часть — это путь вместе."
  },
  {
    word: "кэл манна",
    correct: "иди сюда",
    options: ["иди сюда", "пойдём домой", "стой здесь", "не уходи"],
    note: "Кэл манна — «иди сюда». Очень нужная фраза в быту."
  },
  {
    word: "утуйа бар",
    correct: "иди спать",
    options: ["иди спать", "иди кушать", "иди гулять", "иди учиться"],
    note: "Утуйа бар — «иди спать». Звучит почти как заклинание на сон."
  },
  {
    word: "харах",
    correct: "глаз",
    options: ["глаз", "нос", "ухо", "рука"],
    note: "Харах — глаз. Простое слово, которое запоминается."
  },
  {
    word: "хаар",
    correct: "снег",
    options: ["снег", "дождь", "ветер", "облако"],
    note: "Хаар — снег. Сразу немного Якутии в кадре."
  },
  {
    word: "сахалыы",
    correct: "по-якутски",
    options: ["по-якутски", "быстро", "красиво", "далеко"],
    note: "Сахалыы — по-якутски. Очень нужное слово для этого квеста."
  },
  {
    word: "аймах",
    correct: "родня",
    options: ["родня", "праздник", "чай", "вечер"],
    note: "Аймах — родня, близкие люди, свои."
  },
  {
    word: "ыраатыма",
    correct: "далеко не уходи",
    options: ["далеко не уходи", "подойди сюда", "я скучаю", "не спеши"],
    note: "Ыраатыма — «далеко не уходи». Очень человеческая фраза."
  },
  {
    word: "баттах",
    correct: "волосы",
    options: ["волосы", "шапка", "расчёска", "платок"],
    note: "Баттах — волосы. Слово из серии «в быту пригодится»."
  },
  {
    word: "принтер",
    correct: "принтер",
    options: ["принтер", "телефон", "компьютер", "бумага"],
    note: "Принтер — принтер. Иногда заимствования звучат особенно мило."
  },
  {
    word: "кофе",
    correct: "кофе",
    options: ["кофе", "чай", "молоко", "вода"],
    note: "Кофе — кофе. Без лишних вопросов."
  },
  {
    word: "харандаас",
    correct: "карандаш",
    options: ["карандаш", "ручка", "тетрадь", "ластик"],
    note: "Харандаас — карандаш. Звучит, как будто уже рисуешь."
  },
  {
    word: "куурусса",
    correct: "курица",
    options: ["курица", "рыба", "утка", "хлеб"],
    note: "Куурусса — курица. Очень бытовое и смешно‑узнаваемое слово."
  },
  {
    word: "олороллор",
    correct: "сидят",
    options: ["сидят", "идут", "спят", "смеются"],
    note: "Олороллор — сидят. В кадре — спокойная сцена."
  },
  {
    word: "кыдамалаһыннарбатахтарынааҕар",
    correct: "лучше бы они не ставили этот стог сена",
    options: [
      "лучше бы они не ставили этот стог сена",
      "они уже ушли домой",
      "я забыл, где оставил ключи",
      "почему так рано темнеет"
    ],
    note: "Кыдамалаһыннарбатахтарынааҕар — фраза‑легенда. Можно просто уважительно кивнуть."
  },
  {
    word: "бэргэьэ",
    correct: "шапка",
    options: ["варежки", "шапка", "носки", "книжка"],
    note: "Бэргэьэ — шапка. Слово из самой зимней части памяти."
  },
  {
    word: "чэй",
    correct: "чай",
    options: ["чай", "кофе", "суп", "сок"],
    note: "Чэй — чай. Тёплый пункт в любом дне."
  },
  {
    word: "уу",
    correct: "вода",
    options: ["вода", "лёд", "ветер", "снег"],
    note: "Уу — вода. Самое простое и самое важное."
  },
  {
    word: "YYT",
    correct: "молоко",
    options: ["молоко", "хлеб", "масло", "сахар"],
    note: "YYT — молоко. Домашнее, базовое, спокойное слово."
  },
  {
    word: "тарбах",
    correct: "палец",
    options: ["палец", "ладонь", "локоть", "колено"],
    note: "Тарбах — палец. Маленькая деталь, которая делает всё точнее."
  },
  {
    word: "махтал",
    correct: "спасибо",
    options: ["спасибо", "привет", "люблю", "пока"],
    note: "Махтал — спасибо. Красивое слово благодарности."
  },
  {
    word: "күүс",
    correct: "сила",
    options: ["сила", "тень", "ветка", "тишина"],
    note: "Күүс — сила. Иногда тихая, но очень надёжная."
  },
  {
    word: "кэрэ",
    correct: "красивый",
    options: ["красивый", "быстрый", "холодный", "высокий"],
    note: "Кэрэ — красивый. Слово, которое хочется произносить медленно."
  },
  {
    word: "сүбэ",
    correct: "совет",
    options: ["совет", "встреча", "любовь", "песня"],
    note: "Сүбэ — совет. Тот самый короткий, который почему-то запоминается."
  },
  {
    word: "түһүлгэ",
    correct: "встреча",
    options: ["встреча", "подарок", "дорога", "рассвет"],
    note: "Түһүлгэ — встреча. Про момент «мы снова рядом»."
  },
  {
    word: "уһун",
    correct: "длинный",
    options: ["длинный", "тёплый", "сладкий", "быстрый"],
    note: "Уһун — длинный. Например, длинный день — и длинное счастье."
  }
];

const correctFeedback = ["Точно!", "Ого, почти носитель", "Вот это уровень", "Красиво угадал"];
const wrongFeedback = ["Почти!", "Не совсем, но теперь ты знаешь", "Красиво ошибся, бывает", "Якутский — дело тонкое"];

function shuffle<T>(items: T[]) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickDifferentIndex(length: number, prev: number | null) {
  if (length <= 1) return 0;
  let next = Math.floor(Math.random() * length);
  if (prev === null) return next;
  if (next === prev) next = (next + 1 + Math.floor(Math.random() * (length - 1))) % length;
  return next;
}

export function YakutWordQuest() {
  const [idx, setIdx] = useState<number>(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const current = yakutWords[idx]!;

  const correctOption = useMemo(() => current.correct, [current.correct]);

  useEffect(() => {
    setShuffledOptions(shuffle([...current.options]));
  }, [current.options, version]);

  useEffect(() => {
    // On first mount, randomize initial word a bit (still stable per session)
    const startIdx = pickDifferentIndex(yakutWords.length, null);
    setIdx(startIdx);
    setVersion((v) => v + 1);
  }, []);

  const choose = useCallback(
    (opt: string) => {
      if (answered) return;
      setSelected(opt);
      setAnswered(true);
      if (opt === correctOption) {
        setFeedback(correctFeedback[Math.floor(Math.random() * correctFeedback.length)] ?? "Точно!");
      } else {
        setFeedback(wrongFeedback[Math.floor(Math.random() * wrongFeedback.length)] ?? "Почти!");
      }
    },
    [answered, correctOption]
  );

  const cardBg =
    "bg-[color:color-mix(in_oklab,var(--color-panel)_62%,transparent)] " +
    "border-[color:color-mix(in_oklab,var(--color-border)_55%,transparent)]";

  return (
    <section>
      <div
        className={`relative overflow-hidden rounded-[1.25rem] border ${cardBg} p-[1.1rem] ring-1 ring-[color:color-mix(in_oklab,var(--color-ring)_34%,transparent)] backdrop-blur-[16px]`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_18%_18%,color-mix(in_oklab,var(--blob-b)_16%,transparent),transparent_62%),radial-gradient(circle_at_82%_78%,color-mix(in_oklab,var(--blob-c)_12%,transparent),transparent_66%)]"
        />

        <div className="relative">

          <div key={`${current.word}-${version}`} className="mt-5 animate-[yakut_fade_420ms_ease-out_both]">
            <div className="text-center font-display text-[2.25rem] font-semibold leading-none tracking-[-0.03em] text-[color:color-mix(in_oklab,var(--color-fg)_96%,transparent)]">
              {current.word}
            </div>
          </div>

          <div className="mt-5 grid gap-2.5">
            {shuffledOptions.map((opt) => {
              const isCorrect = answered && opt === correctOption;
              const isChosen = selected === opt;
              const isWrongChosen = answered && isChosen && opt !== correctOption;

              const base =
                "relative inline-flex w-full items-center justify-center overflow-hidden rounded-[1.05rem] border px-4 py-3 text-center text-[0.98rem] font-semibold tracking-[-0.01em] backdrop-blur-sm transition active:scale-[0.99]";

              const idle =
                "border-[color:color-mix(in_oklab,var(--color-border)_42%,transparent)] " +
                "bg-[color:color-mix(in_oklab,var(--color-panel-2)_46%,transparent)] " +
                "text-[color:color-mix(in_oklab,var(--color-fg)_92%,transparent)] " +
                "ring-1 ring-[color:color-mix(in_oklab,var(--color-ring)_30%,transparent)]";

              const correct =
                "border-[color:color-mix(in_oklab,hsl(145_55%_42%_/_0.70)_72%,white)] " +
                "bg-[color:color-mix(in_oklab,hsl(145_55%_42%_/_0.14)_52%,transparent)] " +
                "text-[color:color-mix(in_oklab,var(--color-fg)_96%,transparent)] " +
                "ring-2 ring-[color:color-mix(in_oklab,hsl(145_55%_42%_/_0.22)_55%,transparent)]";

              const wrong =
                "border-[color:color-mix(in_oklab,hsl(6_72%_52%_/_0.65)_72%,transparent)] " +
                "bg-[color:color-mix(in_oklab,hsl(6_72%_52%_/_0.12)_48%,transparent)] " +
                "text-[color:color-mix(in_oklab,var(--color-fg)_88%,transparent)] " +
                "ring-1 ring-[color:color-mix(in_oklab,hsl(6_72%_52%_/_0.14)_45%,transparent)]";

              const chosen =
                "border-[color:color-mix(in_oklab,var(--color-fg)_20%,transparent)] " +
                "bg-[color:color-mix(in_oklab,var(--color-panel)_70%,transparent)]";

              const stateClass = isCorrect ? correct : isWrongChosen ? wrong : isChosen ? chosen : idle;

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={answered}
                  onClick={() => choose(opt)}
                  className={`${base} ${stateClass} disabled:cursor-not-allowed disabled:opacity-95`}
                  aria-pressed={isChosen}
                >
                  <span className="relative">{opt}</span>
                </button>
              );
            })}
          </div>

          {answered ? (
            <div className="mt-4 animate-[yakut_fade_420ms_ease-out_both]">
              <div className="text-[0.98rem] font-semibold tracking-[-0.01em] text-[color:color-mix(in_oklab,var(--color-fg)_92%,transparent)]">
                {selected === correctOption
                  ? feedback ?? "Точно!"
                  : `${feedback ?? "Почти!"} Правильный ответ — ${correctOption}.`}
              </div>
              <div className="mt-2 text-[0.92rem] leading-[1.55] tracking-[-0.01em] text-[color:color-mix(in_oklab,var(--color-muted)_92%,transparent)]">
                {current.note}
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    const nextIdx = pickDifferentIndex(yakutWords.length, idx);
                    setIdx(nextIdx);
                    setSelected(null);
                    setAnswered(false);
                    setFeedback(null);
                    setVersion((v) => v + 1);
                  }}
                  className="inline-flex w-full items-center justify-center rounded-[1.1rem] border border-[color:color-mix(in_oklab,var(--blob-b)_44%,color-mix(in_oklab,var(--color-border)_40%,transparent))] bg-[color:color-mix(in_oklab,var(--blob-b)_40%,color-mix(in_oklab,var(--color-panel)_30%,transparent))] px-4 py-3 text-[0.98rem] font-semibold tracking-[-0.01em] text-[color:color-mix(in_oklab,var(--color-fg)_94%,transparent)] shadow-[0_16px_44px_color-mix(in_oklab,var(--blob-b)_18%,transparent)] ring-1 ring-[color:color-mix(in_oklab,var(--blob-b)_26%,color-mix(in_oklab,var(--color-ring)_22%,transparent))] backdrop-blur-[16px] transition active:scale-[0.99] motion-safe:hover:bg-[color:color-mix(in_oklab,var(--blob-b)_48%,color-mix(in_oklab,var(--color-panel)_36%,transparent))]"
                >
                  Ещё слово
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

